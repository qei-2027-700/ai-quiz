-- トピック
CREATE TABLE topics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 問題
-- difficulty: 1=初級 / 2=中級 / 3=上級
-- genre: ai_basics / ai_services / engineering
CREATE TABLE questions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    difficulty  SMALLINT NOT NULL DEFAULT 1,
    genre       TEXT     NOT NULL DEFAULT 'ai_services',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 選択肢
CREATE TABLE choices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- 解説（RAG 用ドキュメントと紐付く）
CREATE TABLE explanations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    doc_ref     TEXT
);

-- クイズ結果
CREATE TABLE quiz_results (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL DEFAULT 'Anonymous',
    correct_count INT  NOT NULL,
    total_count   INT  NOT NULL,
    tier          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_choices_question_id ON choices(question_id);
CREATE INDEX idx_quiz_results_ranking ON quiz_results(correct_count DESC, created_at ASC);
