-- ジャンルをDBで管理（コースごとに定義可能）
-- NOTE: course_id は topics テーブルを参照する。topics テーブルが "コース" の概念として機能しており、
--       将来 topics → courses にリネームする際はこの外部キー参照も合わせて変更すること。
CREATE TABLE genres (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,          -- 内部キー例: "ai_basics"
    label       TEXT NOT NULL,          -- 表示名例: "AI基礎"
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, name)
);

-- ティア定義をDBで管理（コースごとに閾値を変更可能）
-- NOTE: course_id は topics テーブルを参照（genres テーブルと同様）
CREATE TABLE scoring_tiers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    tier        TEXT NOT NULL,          -- "S" / "A" / "B" / "C"
    min_ratio   NUMERIC(4,3) NOT NULL,  -- 0.900 / 0.700 / 0.500 / 0.000
    label       TEXT NOT NULL,
    sort_order  SMALLINT NOT NULL DEFAULT 0,
    UNIQUE (course_id, tier)
);

-- topics テーブルに AI フィードバックのプロンプトテンプレートを追加
ALTER TABLE topics ADD COLUMN IF NOT EXISTS ai_prompt_template TEXT NOT NULL DEFAULT '';

-- インデックス
CREATE INDEX idx_genres_course_id ON genres(course_id);
CREATE INDEX idx_scoring_tiers_course_id ON scoring_tiers(course_id);
