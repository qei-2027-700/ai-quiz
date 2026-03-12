# admin-csv-import

目的: 固定Admin（環境変数）で保護された AdminService を使い、CSV から問題を安全に追加できるようにする。

## 前提
- Admin は環境変数固定（`ADMIN_USER` / `ADMIN_PASS`）
- MVP は「追加のみ」。`question_id` 列は **予約**（値が入っているとエラー）

## CSV テンプレ
- `docs/admin/questions_template.csv` を起点に作る

## UI 導線
- `frontend` の `/admin` に CSV を貼り付け → Dry-run → Import

## 実装上の要点（変更時の注意）
- 一次ソース: proto `proto/quiz/v2/admin.proto`
- バックエンド: `AdminService.ImportQuestionsCsv`
  - Dry-run は全行バリデーションのみで DB 書き込みなし
  - Commit はトランザクションで一括（エラーがあればロールバック）
- CORS に `Authorization` が含まれている必要がある

## 動作確認（最短）
```bash
cd /Users/km/dev/_github/ai-quiz
mise run generate
cd backend && go test ./...
cd frontend && pnpm type-check && pnpm test
```

