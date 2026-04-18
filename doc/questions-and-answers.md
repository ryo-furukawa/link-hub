# 質問と回答まとめ

## Go アーキテクチャ

### handler / service / repository / model の役割は？

| このプロジェクト | Rails/Laravel |
|---|---|
| handler | controller |
| service | service |
| repository | model（ActiveRecord） |
| model | 構造体（ORMなし） |

**リクエストの流れ**
```
HTTP Request
    ↓
main.go（ルーティング登録）
    ↓
handler（HTTPの受け取り・レスポンス返却）
    ↓
service（ビジネスロジック）
    ↓
repository（SQL実行）
    ↓
DB
    ↓
model.Page（構造体に詰めて返す）
    ↓
handler（JSONにして返却）
```

**Railsとの違い**
Railsの `Model` はDB操作もデータ定義も一体（ActiveRecord）だが、Goでは分離する。
- `model` → データの形だけ定義
- `repository` → SQL操作だけ

---

### model は DTO のこと？

近いが違う。

- **model** はDBのテーブル構造をそのまま反映した構造体
- **DTO** はレイヤー間でデータを運ぶための構造体で、用途ごとに形が変わる

このプロジェクトでは当面 model をそのままレスポンスに使うシンプルな構成。規模が大きくなったらDTO/レスポンス型を分けるのが一般的。

---

### 依存性の注入（DI）とは？

```go
pageRepo := repository.NewPageRepository(database)  // DBを渡してrepository作成
pageSvc := service.NewPageService(pageRepo)          // repositoryを渡してservice作成
pageHandler := handler.NewPageHandler(pageSvc)       // serviceを渡してhandler作成
```

各層が直接依存先を作らず、外から渡してもらう形。`main.go` がその組み立て役。

**DIがないとどうなる？**
```go
// handler が直接 repository を作る（悪い例）
func (h *PageHandler) List(w http.ResponseWriter, r *http.Request) {
    db, _ := sql.Open("sqlite", "/app/data/app.db")  // handlerがDB接続を知っている
    repo := repository.NewPageRepository(db)
}
```
- DBのパスが各層に散らばる
- テスト時にDBを差し替えられない
- 層の分離が崩れる

**GoではどこでDIするのが一般的？**
`main.go` でやるのが一般的。規模が大きくなると `wire`（Googleのライブラリ）で自動生成することもある。

---

### Railsだと暗黙的に解決されるとは？

```ruby
class PagesController < ApplicationController
  def index
    @pages = Page.all  # Modelを直接呼ぶだけ
  end
end
```
`Page` がどこから来るか、DBとの接続がどう渡されるか意識しなくても動く。ActiveRecordが裏で全部やってくれる。

---

### 手動で作る時の順番は？

```
1. migration   → テーブル定義
2. model       → 構造体定義
3. repository  → SQL実装
4. service     → ロジック実装
5. handler     → HTTP実装
6. main.go     → 配線 + ルート登録  ← 最後
```

後ろから上に向かって作るのが一般的（依存の方向が一方向なので手戻りが少ない）。

---

### レスポンス処理を毎回書くのが一般的？

```go
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(http.StatusCreated)
json.NewEncoder(w).Encode(page)
```

標準 `net/http` では毎回書くのが基本。同じコードが増えてきたらヘルパー関数に切り出すのが一般的。

```go
func respondJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}
```

---

## Go スキャフォールド

### Goにスキャフォールドはある？

標準ツールはなし。基本的に手書き。

サードパーティツール：
- **sqlc** → SQLからGoのコードを自動生成
- **ent** → スキーマ定義からORMコードを生成
- **Buffalo** → Railsに最も近い（スキャフォールドあり、ただし下火）

---

### sqlc を使うとどうなる？

**手書き（repository）**
```go
rows, err := r.db.QueryContext(ctx, `SELECT ...`)
rows.Scan(&p.ID, &p.Title, ...)  // カラム順を手動で合わせる
```

**sqlc を使った場合**
```sql
-- name: ListPages :many
SELECT id, title, description FROM pages WHERE deleted_at IS NULL;
```
`sqlc generate` で Scan 含めて自動生成される。

---

## golang-migrate

### `go get` はグローバルにインストール？

いいえ。`go get` はカレントモジュール（`go.mod`）に追加するだけ。プロジェクト内にスコープされる。

### `database/sqlite3` と `database/sqlite` の違い？

- `sqlite3` → `mattn/go-sqlite3` に依存（CGO必要）
- `sqlite` → `modernc.org/sqlite` に対応（CGO不要）

名前の数字は新旧関係ではなく、依存するライブラリの違い。

---

## REST API vs gRPC

|  | REST | gRPC |
|--|------|------|
| プロトコル | HTTP/1.1 + JSON | HTTP/2 + Protocol Buffers |
| 型定義 | なし（JSONは動的） | `.proto` ファイルで厳密に定義 |
| 速度 | 普通 | 速い（バイナリ転送） |
| ブラウザ対応 | ネイティブ対応 | 非対応（grpc-webが必要） |
| 学習コスト | 低い | 高い |

**REST が向いているケース**
- フロントエンド（ブラウザ）と直接通信
- シンプルなCRUD
- 外部に公開するAPI

**gRPC が向いているケース**
- マイクロサービス同士の内部通信
- 大量データをリアルタイムでやり取り（ストリーミング）

---

## git worktree

### worktree とは？

通常は1つのディレクトリで1ブランチしか作業できないが、worktreeを使うと複数のブランチを別ディレクトリで同時に開ける。

**基本コマンド**
```bash
# worktree を作成（ブランチも同時に作成）
git worktree add .worktrees/page-get-api -b page-get-api

# 一覧確認
git worktree list

# 削除
git worktree remove .worktrees/page-get-api
```

**ディレクトリ構成（`.worktrees/` にまとめる方法）**
```
link-hub/
├── .worktrees/
│   ├── page-get-api/
│   ├── page-update-api/
│   └── page-delete-api/
├── backend/
└── frontend/
```
`.gitignore` に `.worktrees/` を追加する必要がある。

### worktree が効果的なケース

- バックエンドとフロントエンドを並行（触るファイルが別）
- 別機能の実装（pages と sources など）

**同じファイルを触るタスクは並行向きではない**（コンフリクトが発生する）。

### worktree でコンフリクトした場合の対処

1つずつ順番にマージしていく：
```bash
# 1. 最初のブランチをマージ → main を pull
# 2. 次のブランチで rebase
git fetch origin
git rebase origin/main
# コンフリクト解消後
git add .
git rebase --continue
git push --force-with-lease
```

---

## Goフレームワーク

### フレームワークを使うとスキャフォールドや handler の処理がよくなる？

フレームワークによって異なる。

**Gin の例**
```go
// 今の手書き
json.NewDecoder(r.Body).Decode(&req)
http.Error(w, `{"error":"..."}`, 400)
json.NewEncoder(w).Encode(page)

// Gin
c.ShouldBindJSON(&req)
c.JSON(400, gin.H{"error": "..."})
c.JSON(201, page)
```

このプロジェクトは CLAUDE.md に「外部ルーターは使わない」と書いてあるため標準 `net/http` で進める。

---

## SQLite 操作

### SQLite のテーブル一覧確認

```sql
.tables      -- テーブル一覧
.quit        -- 終了
```

`SHOW TABLES` は MySQL の構文で SQLite では使えない。
