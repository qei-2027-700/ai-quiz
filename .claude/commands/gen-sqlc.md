`backend/internal/db/queries/*.sql` から型安全な Go コードを生成してください。

## 手順

1. `cd backend && go generate ./...` を実行する（sqlc.yaml の設定に従い生成）
2. 生成先: `backend/internal/db/gen/`
3. コンパイルエラーが出た場合は SQL クエリの型と Go コードの整合性を確認して修正する

## sqlc の規約（このプロジェクト）

- クエリファイル: `backend/internal/db/queries/*.sql`
- 各クエリには `-- name: XxxYyy :one/:many/:exec` のアノテーションが必須
- 生成されたファイルは直接編集しない（*.sql を修正して再生成する）
