# Protobuf / Connect-RPC ルール

## ファイル構成

- `proto/<service>/v1/<service>.proto` の形式で配置する
- `option go_package` は必ず設定する: `github.com/km/ai-quiz/backend/gen/<pkg>`

## 命名規則

- サービス名: `PascalCase` + `Service`（例: `QuizService`）
- RPC メソッド: `PascalCase` の動詞句（例: `ListQuestions`, `SubmitAnswers`）
- メッセージ: `PascalCase`（例: `Question`, `SubmitAnswersRequest`）
- フィールド: `snake_case`（例: `question_id`, `is_correct`）

## バージョニング

- パッケージは必ず `v1` から始める（`quiz.v1`）
- 後方互換を破る変更は新バージョン（`v2`）を作る
- フィールドの削除・番号変更は禁止（`reserved` を使う）

## 生成コードの扱い

- `proto/gen/` の生成ファイルは直接編集しない
- 変更は `.proto` ファイルを修正 → `/gen-proto` で再生成する
