# quiz-content

目的: このリポジトリの「クイズ問題（DB seed / モック）」を素早く追加・修正し、フロント/バックエンド双方の整合を保つ。

## 使う場面
- 「問題を追加して」「選択肢を直して」「解説を更新して」などの依頼が来たとき

## ルール（このプロジェクト固有）
- クイズコンテンツの一次ソースは `backend/seeds/seeder.sql`
- `frontend/packages/shared/src/mocks/quizMockData.ts` は自動生成（直接編集しない）
  - 再生成: `cd frontend && pnpm seed-to-mock`

## 追加/修正手順（最短）
1) `backend/seeds/seeder.sql` に問題を追加/修正
   - `questions` に 1 行追加（`genre` / `difficulty` を設定）
   - `choices` を 4 つ追加（`sort_order` 1..4）
   - `explanations` を追加（短くてもよいが、誤解しない説明にする）
   - すべて `ON CONFLICT ... DO NOTHING`（idempotent）にする

2) モックを再生成
```bash
cd frontend
pnpm seed-to-mock
```

3) 最低限の検証
```bash
cd backend && go test ./...
cd frontend && pnpm type-check
```

## UUID 採番の慣例（既存データに合わせる）
- `questions.id`: `10000000-0000-0000-0000-0000000000NN`（NN を増やす）
- `choices.id`: `NN0...` 系の連番（例: Q33 なら 43..., Q34 なら 44...）
- 既存と衝突しないことが最優先（厳密な規則より重複回避）

## genre / difficulty の判断指針（目安）
- difficulty:
  - 1: 用語/料金/定義など暗記寄り
  - 2: なぜそうなるか・仕組みの理解
  - 3: アーキテクチャ/トレードオフ/例外条件まで問う
- genre:
  - `ai_basics`: 概念・原理（RAG/Attention/評価など）
  - `ai_services`: 企業/サービス/エコシステム（プラン・提供形態など）
  - `engineering`: 実装/運用/インフラ（GPU・データセンター・性能/コスト等）

