-- Attempt（受験セッション）
CREATE TABLE attempts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    username    TEXT        NOT NULL DEFAULT 'Anonymous',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_course_id ON attempts(course_id);

-- quiz_results に attempt_id を追加（ランキング互換のため NULL 許容）
ALTER TABLE quiz_results
    ADD COLUMN attempt_id UUID;

ALTER TABLE quiz_results
    ADD CONSTRAINT fk_quiz_results_attempt_id
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE SET NULL;

CREATE INDEX idx_quiz_results_attempt_id ON quiz_results(attempt_id);

-- AI/RAG Insights（Attempt に紐づく生成物）
CREATE TABLE attempt_insights (
    attempt_id    UUID PRIMARY KEY REFERENCES attempts(id) ON DELETE CASCADE,
    status        TEXT NOT NULL,
    ai_feedback   TEXT NOT NULL DEFAULT '',
    error_message TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempt_insights_status ON attempt_insights(status);

