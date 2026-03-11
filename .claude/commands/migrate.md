DB マイグレーションを実行してください。

## 使い方

- `/migrate up` → `mise run migrate-up`（最新まで適用）
- `/migrate down` → `mise run migrate-down`（1つ戻す）
- 引数なし → up として扱う

## 注意事項

- 実行前に `docker compose -f infra/docker-compose.yml ps` で postgres が起動中か確認する
- down は1ステップずつ実行する（大量に戻す場合はユーザーに確認する）
- マイグレーションファイルの命名規則: `000001_<description>.up.sql` / `.down.sql`
