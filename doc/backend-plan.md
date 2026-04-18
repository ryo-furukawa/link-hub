# バックエンド実行計画（Go）

個人開発の Go 新規開発では、**最初は「全部の層を薄くつなぐ」ことから始める**のがおすすめです。
いきなり全 CRUD や検索を作り込むより、**1機能を縦に貫通させる**ほうが進めやすく、設計のズレも早く見つかります。

今回の LinkHub なら、結論としては **「ページ一覧取得」→「ページ作成」から始める**のがよいです。

---

## まずの方針

この構成なら実装順は次が安定です。

1. **起動できる状態を作る**
2. **DB 接続と migration を通す**
3. **ページ一覧 API を作る**
4. **ページ作成 API を作る**
5. **フロントから叩く**
6. そのあとに詳細、更新、削除、復元へ進む

理由はシンプルで、`pages` は中心概念だからです。
`sections` や `sources` は `pages` にぶら下がるので、先に `pages` が安定すると後続がかなり楽になります。

---

# おすすめの実装順

## 1. 最初にやること

まずは「アプリが起動し、DB につながり、HTTP が返る」状態を作ります。

### backend 側で最初に作るもの

- `cmd/server/main.go`
- `internal/db/`
- `internal/model/`
- `internal/repository/`
- `internal/service/`
- `internal/handler/`
- `migrations/`

この段階では、まず最低限で十分です。

### 先に通したいもの

- `/healthz` などの簡易エンドポイント
- SQLite 接続
- migration 実行後に `pages` テーブルが存在すること
- サーバー起動

ここが通ると、以降は「機能追加」に集中できます。

---

## 2. 最初の migration を作る

MVP 優先順位的にも、最初は `pages` だけでよいです。
最初から全部のテーブルを作ってもいいですが、個人的には **最初は `pages` 単体** をおすすめします。

### 最初のテーブル

- `pages`
  - `id`
  - `title`
  - `description`
  - `created_at`
  - `updated_at`
  - `deleted_at`

これだけで、

- 一覧
- 作成
- 詳細
- 更新
- 論理削除
- 復元

まで進められます。

---

## 3. 最初の縦スライスは「GET /api/pages」

最初の CRUD は、**Create より Read のほうが簡単**です。
なので、最初の 1 本はこれがいいです。

### 流れ

- handler: HTTP リクエストを受ける
- service: ビジネスルールを呼ぶ
- repository: DB から `pages` を取得する
- JSON で返す

### この 1 本で確認できること

- ルーティング
- レスポンス形式
- DB 接続
- repository/service/handler の責務分離
- JSON エンコード
- エラーハンドリングの流れ

つまり、土台が一気に確認できます。

---

## 4. 次に「POST /api/pages」

一覧が通ったら、次は作成です。

### 次に作る理由

- request body の decode を試せる
- validation を入れられる
- DB insert を確認できる
- フロントのフォームとつなげやすい

ここまで通れば、かなり「開発の型」が固まります。

---

# 実装の具体的な進め方

## ステップ 1: main.go で配線する

最初は依存注入をシンプルに手書きで十分です。

`main.go` でやること:

- config 読み込み
- logger 作成
- DB 接続
- repository 作成
- service 作成
- handler 作成
- mux 登録
- `http.ListenAndServe`

この時点では DI フレームワークなど不要です。

---

## ステップ 2: db パッケージを作る

例えば役割はこんな感じです。

- `Open(...)`
- `Ping(...)`
- 必要なら SQLite 用 PRAGMA 設定

SQLite では最低限、接続直後の設定をここに寄せると後で整理しやすいです。

---

## ステップ 3: model を定義する

まずは `Page` だけで大丈夫です。

例:

- `Page`
- `CreatePageInput`
- `UpdatePageInput`

最初から API 用 DTO と DB モデルを厳密に分けなくてもいいですが、
少なくとも **作成用 input は分ける** と扱いやすいです。

---

## ステップ 4: repository を作る

最初は `PageRepository` だけで十分です。

必要なメソッドの最初の候補:

- `List(ctx context.Context) ([]model.Page, error)`
- `Create(ctx context.Context, input model.CreatePageInput) (model.Page, error)`

そのあとに:

- `GetByID`
- `Update`
- `SoftDelete`
- `Restore`

という順で増やすと自然です。

---

## ステップ 5: service を作る

service は最初は薄くて大丈夫です。
ただし、**将来 PostgreSQL へ移行できる設計**を意識するなら、ビジネスルールは repository に寄せすぎず service に持たせるのがよいです。

例えば service の責務:

- title の必須チェック
- 空文字や長さチェック
- deleted_at の扱いポリシー
- 取得対象に論理削除を含めるかどうか

---

## ステップ 6: handler を作る

handler は以下に徹するのがよいです。

- パス・クエリ・body を受け取る
- service を呼ぶ
- JSON を返す
- エラー時に `{ "error": "message" }` を返す

つまり、**業務ロジックは持たせすぎない**です。

---

# 最初の 1 週間で作るとよいもの

かなり現実的に区切ると、こんな順です。

## Day 1

- backend 起動
- `/healthz`
- SQLite 接続
- migration 導入
- `pages` テーブル作成

## Day 2

- `GET /api/pages`
- `POST /api/pages`

## Day 3

- `GET /api/pages/:id`
- `PATCH /api/pages/:id`

## Day 4

- `DELETE /api/pages/:id`
- `PATCH /api/pages/:id/restore`

## Day 5

- frontend でページ一覧表示
- ページ作成フォーム
- API クライアント作成
- TanStack Query 導入

ここまで来ると、かなり気持ちよく進められます。

---

# フロントエンドはいつ着手すべきか

おすすめは、**backend の GET /api/pages と POST /api/pages ができた時点**です。

理由:

- モックを大量に作らなくてよい
- 画面から API を叩くことで仕様のズレにすぐ気づける
- モチベーションが上がる

つまり、**backend を全部作ってから frontend** ではなく、
**pages の最小機能ができたらすぐ繋ぐ**のがよいです。

---

# あなたの構成で最初に作るべきファイルのイメージ

例えば backend はこう始めるとよいです。

```txt
backend/
├─ cmd/server/main.go
├─ internal/config/config.go
├─ internal/db/sqlite.go
├─ internal/model/page.go
├─ internal/repository/page_repository.go
├─ internal/service/page_service.go
├─ internal/handler/page_handler.go
├─ internal/handler/health_handler.go
└─ migrations/
   └─ 000001_create_pages_table.up.sql
```

---

# 実装順のコツ

## 1. 最初から全部の抽象化をしない

たとえば repository interface を最初から大量に切るより、
まずは具体実装で進めて、必要になったら interface を切るほうが楽です。

ただし service が依存する repository だけは interface にしてもよいです。

## 2. テストは「重要なところから」

最初から全部ユニットテストを書く必要はありません。
まずは以下が優先です。

- repository の基本動作
- service の validation
- handler の HTTP ステータス確認

## 3. SQL は無理に隠さない

`database/sql` を使うなら、SQL をしっかり書く方向でよいです。
小さい個人開発なら、そのほうが見通しが良いです。

## 4. migration を信頼できる土台にする

あとからスキーマ変更が必ず入るので、手作業で DB をいじるより migration を正として進めるのがおすすめです。

---

# LinkHub で最初に避けたいこと

以下は後回しで大丈夫です。

- タグ実装
- 検索の作り込み
- DnD
- 共有リンク
- 過剰な共通化
- 早すぎる PostgreSQL 対応

PostgreSQL 移行を見据えるのは大事ですが、
最初から両対応を頑張ると進みが悪くなります。

今は **`database/sql` に寄せて、SQLite 方言に依存しすぎない程度** で十分です。

---

# 最終的なおすすめ順

今回なら、私はこの順で進めます。

## Backend

1. サーバー起動
2. config
3. SQLite 接続
4. migration
5. `pages` の model
6. `GET /api/pages`
7. `POST /api/pages`
8. `GET /api/pages/:id`
9. `PATCH /api/pages/:id`
10. `DELETE /api/pages/:id`
11. `PATCH /api/pages/:id/restore`

## Frontend

1. ページ一覧
2. ページ作成フォーム
3. ページ詳細
4. ページ編集
5. 論理削除済み表示と復元

## その後

1. `sources`
2. `sections`
3. `search`
4. `tags`

---

# 迷ったらこれで始めれば大丈夫です

最初の実装対象はこれです。

- migration で `pages` テーブル作成
- `GET /api/pages`
- `POST /api/pages`
- React で一覧画面 + 作成フォーム

これが一番バランスがいいです。
設計、DB、HTTP、JSON、フロント接続まで一通り確認できます。

必要であれば次に、
**「この構成前提で backend の最初のディレクトリ・ファイル作成順」** や
**「GET /api/pages を実装する最小コード一式」** まで具体化してお出しできます。
