# クイズアプリ汎用化 実行計画

> GitHub Issue: #4
> 目標: 別テーマ（歴史・プログラミング等）を **環境変数 + Admin画面の設定だけ** で展開できる状態にする

---

## 現状の抽象化度

| 層 | 現状 |
|----|------|
| proto (v2) | **ほぼ汎用済み** — `attributes: map<string,string>` で genre/difficulty を自由拡張可能 |
| backend usecase | **ドメイン固有** — tier計算・AIフィードバック文がハードコード |
| frontend | **ドメイン固有** — GENRES配列・LPテキストが"生成AI"前提で固定 |
| DB/seed | **ドメイン固有** — genre カラムに `ai_basics` 等の文字列 |
| Admin UI | **部分実装済み** — CSVインポートの枠はある |

### 主なハードコード箇所

| ファイル | 内容 |
|---------|------|
| `backend/internal/usecase/quiz.go` | `computeTier()` に正答率閾値（0.9/0.7/0.5）と tier 文字列 |
| `backend/internal/usecase/quiz.go` | `generateMockAIFeedback()` に "RAG" "AI Agent" 等の固有語 |
| `backend/DDL/000001_create_tables.up.sql` | `genre` カラムに `ai_basics` / `ai_services` / `engineering` |
| `frontend/src/pages/QuizPage.tsx` | `GENRES` / `DIFFICULTIES` 配列を定数で定義 |
| `frontend/src/pages/landing/content.ts` | "RAG搭載" "Claude AI" 等をハードコード |

---

## Phase 1 — Backend汎用化

### 1-1. ジャンル定義をDBに移動

**現状**: `questions.genre` に固定文字列を直書き
**変更**: `genres` テーブルを追加し、コースごとにジャンルを定義可能にする

```sql
-- DDL/000004_add_genres_and_tiers.up.sql
CREATE TABLE genres (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id),
  name        TEXT NOT NULL,          -- 内部キー: "ai_basics"
  label       TEXT NOT NULL,          -- 表示名: "AI基礎"
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE scoring_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id),
  tier        TEXT NOT NULL,          -- "S" / "A" / "B" / "C"
  min_ratio   NUMERIC(4,3) NOT NULL,  -- 0.900 / 0.700 / 0.500
  label       TEXT NOT NULL           -- 表示名
);
```

### 1-2. ティア計算をDB定義に移動

**現状**: `usecase/quiz.go` に `ratio >= 0.9 → "S"` をハードコード
**変更**: `scoring_tiers` テーブルを参照する `computeTier(courseID, ratio)` に変更

```go
// Before
func computeTier(correct, total int) string {
    ratio := float64(correct) / float64(total)
    if ratio >= 0.9 { return "S" }
    ...
}

// After
func (u *QuizUsecase) computeTier(ctx context.Context, courseID string, ratio float64) (string, error) {
    tiers, err := u.repo.GetScoringTiers(ctx, courseID)
    // ratio >= tier.MinRatio でマッチするものを返す
}
```

### 1-3. AIフィードバックプロンプトのテンプレート化

**現状**: `generateMockAIFeedback()` に固有語をハードコード
**変更**: `courses.ai_prompt_template` カラムに Claude API へのプロンプトテンプレートを格納

```sql
ALTER TABLE courses ADD COLUMN ai_prompt_template TEXT;
```

```
テンプレート例:
あなたは{course_name}の先生です。受験者が{total}問中{correct}問（{pct}%）正解し、
{tier}ランクでした。100字程度でフィードバックをしてください。
```

### 1-4. Admin API 完成（Course / Genre / Tier CRUD）

`proto/quiz/v2/admin.proto` に以下 RPC を追加、handler + usecase + repository を実装:

| RPC | 説明 |
|-----|------|
| `CreateCourse` | コース作成（name, description, ai_prompt_template） |
| `UpdateCourse` | コース更新 |
| `CreateGenre` | ジャンル追加（course_id, name, label） |
| `ListGenres` | コースのジャンル一覧取得 |
| `UpsertScoringTiers` | ティア定義の一括更新 |

---

## Phase 2 — Frontend設定化

> Phase 1 と並行実施可能

### 2-1. GENRES を API から動的取得

```ts
// Before (QuizPage.tsx)
const GENRES = [
  { value: "ai_basics", label: "AI基礎" },
  { value: "ai_services", label: "AIサービス" },
  { value: "engineering", label: "エンジニアリング" },
];

// After
const { genres } = useCourseGenres(courseId);
// → ListGenres(courseId) を呼ぶ hook
```

### 2-2. LPテキストを環境変数化

```env
# .env（生成AIクイズ）
VITE_APP_BRAND_NAME=ai-quiz
VITE_APP_TAGLINE=生成AIの理解度を試そう
VITE_APP_DESCRIPTION=RAG・Agent・LLMの知識を10問で確認

# .env（別テーマ展開例）
VITE_APP_BRAND_NAME=history-quiz
VITE_APP_TAGLINE=歴史の知識を試そう
VITE_APP_DESCRIPTION=日本史・世界史の理解を10問でチェック
```

変更対象: `frontend/src/pages/landing/content.ts`
→ ハードコードテキストを `import.meta.env.VITE_APP_*` 参照に置き換え

### 2-3. マスコットキャラ選択の設定化

```env
VITE_APP_MASCOT_VARIANT=anime_girl  # anime_girl / short_hair / none
```

変更対象: `frontend/src/components/Mascot/` にある `variant` prop を環境変数から注入

---

## Phase 3 — コンテンツ管理 UI

> Phase 2 完了後に着手

### 3-1. Admin画面で問題 CRUD

現状の CSV インポートを拡張し、Web UI 上で問題・選択肢・解説・ジャンルを直接操作できるようにする。
→ SQL なしで新テーマを展開できる状態にする。

### 3-2. Course のエクスポート / インポート

Course 単位で JSON エクスポート → 別インスタンスにインポートできる仕組みを追加。
「テーマパック」として配布・再利用が可能になる。

---

## 実装ファイル一覧

| Phase | ファイル | 変更内容 |
|-------|---------|---------|
| 1-1 | `backend/DDL/000004_add_genres_and_tiers.up.sql` | genres, scoring_tiers テーブル追加 |
| 1-1 | `backend/internal/db/queries/genre.sql` | Genre CRUD クエリ |
| 1-2 | `backend/internal/usecase/quiz_v2.go` | computeTier() を DB 参照に変更 |
| 1-3 | `backend/internal/usecase/quiz_v2.go` | AIフィードバックをテンプレート化 |
| 1-3 | `backend/DDL/000004_*.sql` | courses.ai_prompt_template カラム追加 |
| 1-4 | `proto/quiz/v2/admin.proto` | Course/Genre/Tier CRUD RPC 追加 |
| 1-4 | `backend/internal/handler/admin.go` | 上記 RPC の実装 |
| 1-4 | `backend/internal/usecase/admin.go` | ビジネスロジック |
| 1-4 | `backend/internal/repository/admin.go` | DB アクセス |
| 2-1 | `frontend/src/pages/QuizPage.tsx` | GENRES を動的取得に変更 |
| 2-1 | `frontend/packages/shared/src/hooks/useCourseGenres.ts` | ListGenres hook 追加 |
| 2-2 | `frontend/src/pages/landing/content.ts` | 環境変数参照に変更 |
| 2-2 | `frontend/.env.example` | 新変数を追記 |
| 2-3 | `frontend/src/components/Mascot/index.tsx` | variant を env から注入 |
| 3-1 | `frontend/src/pages/AdminPage.tsx` | 問題 CRUD UI |
| 3-2 | `proto/quiz/v2/admin.proto` + backend + frontend | エクスポート/インポート API |

---

## 推奨実装順

```
Phase 1-1 (DB migration)
  └─ Phase 1-2 (computeTier → DB参照)
  └─ Phase 1-3 (AIフィードバック テンプレート化)
      └─ Phase 1-4 (Admin API: Course/Genre/Tier CRUD)
                       └─ Phase 3-1/3-2 (Admin UI + エクスポート)

Phase 2-1/2-2/2-3 (FE設定化) ← Phase 1 と並行実施可能
```

Phase 1 の DB 変更と Phase 2 の FE 設定化は **並行実施可能**。
