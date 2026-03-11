指定された GitHub Pull Request をレビューしてください。

## 手順

1. 引数として PR 番号または URL が渡された場合はそれを使う。なければ `gh pr list` で一覧を表示してユーザーに選ばせる
2. `gh pr diff <number>` で差分を取得する
3. 以下の観点でレビューを行い、`gh pr review` でコメントを投稿する

## レビュー観点

### 共通
- CLAUDE.md・docs/sterring/ の規約に違反していないか
- 不要なファイル・デバッグコードが含まれていないか

### Backend (Go)
- Clean Architecture の依存方向が守られているか（domain ← usecase ← handler）
- sqlc の生成コードを直接編集していないか（queries/*.sql を変更すべき）
- Connect-RPC のエラーが `connect.NewError` を使っているか
- SQL に N+1 の懸念がないか

### Frontend
- `@lifecycle/api-client` / `@lifecycle/shared` 経由で API を呼んでいるか
- fetch を直接書いていないか
- TailwindCSS クラスが可読性を保っているか

### IaC
- シークレットがハードコードされていないか
- Terraform の変更に `plan` 結果のコメントがあるか

## レビューの出力形式

- 問題あり: `gh pr review <number> --comment -b "..."` でコメント投稿
- 承認: `gh pr review <number> --approve`
