# LinkHub - Claude への指示

## プロジェクト概要

散らばった情報源をテーマ単位で一元管理できる個人用ナレッジ管理アプリ。
ページにソース（リンク・ノート）を蓄積し、必要に応じてセクションでグループ化できる。

- Frontend: Vite + React + TypeScript + Tailwind CSS + TanStack Query + react-hook-form
- Backend: Go + net/http（標準）+ database/sql + golang-migrate
- DB: SQLite（`modernc.org/sqlite`、CGO不要）
- Infra: Docker 対応（開発環境は Docker 上で Go / Node を実行）
- Ports: backend=8080, frontend=5173

## ディレクトリ構成

```
link-hub/
├─ frontend/          # Vite + React
│  └─ src/
├─ backend/           # Go API サーバー
│  ├─ cmd/server/
│  ├─ internal/
│  │  ├─ handler/
│  │  ├─ service/
│  │  ├─ repository/
│  │  ├─ model/
│  │  └─ db/
│  └─ migrations/
├─ docker/
├─ compose.yml
└─ CLAUDE.md
```

## コーディング方針

### 全般

- シンプルに保つ。過剰な抽象化はしない
- 型を明示する（Go・TypeScript ともに）
- エラーは握り潰さず、適切に返す
- コメントは自明でない箇所のみ

### Go

- `internal/` 配下でパッケージを分ける（handler / service / repository / model / db）
- エラーは `fmt.Errorf("...: %w", err)` でラップして返す
- ログは `slog` を使う
- 環境変数は起動時に読み込み、構造体に詰める
- SQLite ドライバは `modernc.org/sqlite`（CGO不要）
- Router は標準 `net/http`（Go 1.22+）を使用。外部ルーターは使わない
- マイグレーションは `golang-migrate`

### React / TypeScript

- コンポーネントは `src/components/` に配置
- ページコンポーネントは `src/pages/` に配置
- API通信は `TanStack Query` でまとめる
- フォームは `react-hook-form` を使う
- スタイルは Tailwind CSS のみ（CSS ファイルは作らない）

## API 設計

- REST API
- ベースパス: `/api`
- エラーレスポンス: `{ "error": "message" }`

### エンドポイント一覧

```
GET    /api/pages
POST   /api/pages
GET    /api/pages/:id
PATCH  /api/pages/:id
DELETE /api/pages/:id
PATCH  /api/pages/:id/restore

GET    /api/pages/:id/sections
POST   /api/pages/:id/sections
PATCH  /api/sections/:id
DELETE /api/sections/:id

GET    /api/pages/:id/sources
POST   /api/pages/:id/sources
PATCH  /api/sources/:id
DELETE /api/sources/:id

GET    /api/search?q=...
```

## データモデル

```sql
pages     : id, title, description, created_at, updated_at, deleted_at
sections  : id, page_id, name, position, created_at, updated_at
sources   : id, page_id, section_id(任意), type, url, title, memo, content, position, created_at, updated_at
tags      : id, name, created_at
page_tags : page_id, tag_id
```

- sources.type は "link" または "note"（STI）
- sources.section_id は任意（未所属なら未分類として扱う）
- pages.deleted_at による論理削除（ソース・タグの紐付けは保持）

## MVP 実装優先順位

1. ページ CRUD（論理削除・復元含む）
2. ソース CRUD（リンク・ノート）
3. セクション管理
4. 検索
5. タグ
6. UI改善（ドラッグ＆ドロップ等）
7. 共有リンク

## 注意事項

- 認証なし（単一ユーザー・ローカル利用前提）
- SQLite ファイルは `.gitignore` 済み（`*.db`）
- Docker 使用時は `.db` ファイルを volume にマウント
- 将来的に PostgreSQL へ移行できる設計にしておく
