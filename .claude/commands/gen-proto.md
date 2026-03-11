`proto/` 配下の .proto ファイルから Go と TypeScript のコードを生成してください。

## 手順

1. `cd proto && buf generate` を実行する
2. 生成先を確認する:
   - Go: `backend/gen/`
   - TypeScript: `packages/api-client/src/gen/`
   - OpenAPI v2 (Swagger): `docs/api/apidocs.swagger.json`
3. `packages/api-client/src/index.ts` の export に新しいサービス・メッセージが含まれているか確認し、不足があれば追記する
4. buf lint エラーがあれば修正してから再実行する
5. OpenAPI ドキュメントのプレビューは `mise run docs`（Redoc が http://localhost:8080 で起動）
