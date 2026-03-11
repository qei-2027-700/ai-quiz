# Go コーディングルール

## アーキテクチャ

- **依存方向**: `domain` ← `usecase` ← `handler` ← `repository`（外側が内側に依存）
- `domain` パッケージは外部ライブラリに依存しない純粋な Go 型・インターフェースのみ
- `handler` は Connect-RPC の生成インターフェースを実装する形で書く

## sqlc

- `backend/internal/db/gen/` の生成ファイルは直接編集しない
- SQL は `backend/internal/db/queries/*.sql` に書き、`go generate` で再生成する
- クエリアノテーション: `-- name: FuncName :one/:many/:exec`

## エラーハンドリング

- Connect-RPC ハンドラ内: `connect.NewError(connect.CodeXxx, err)` を使う
- コードの選択基準:
  - 入力値エラー → `connect.CodeInvalidArgument`
  - 見つからない → `connect.CodeNotFound`
  - 認証エラー → `connect.CodeUnauthenticated`
  - 権限エラー → `connect.CodePermissionDenied`
  - 内部エラー → `connect.CodeInternal`

## 禁止事項

- `panic` を業務ロジックで使わない（recover はミドルウェア層のみ）
- `init()` 関数を使わない
- グローバル変数を使わない（DI で注入する）
- `Makefile` を作成・参照しない（`mise run <task>` を使う）
