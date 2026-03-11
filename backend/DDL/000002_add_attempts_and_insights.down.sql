DROP TABLE IF EXISTS attempt_insights;

DROP INDEX IF EXISTS idx_quiz_results_attempt_id;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS fk_quiz_results_attempt_id;
ALTER TABLE quiz_results DROP COLUMN IF EXISTS attempt_id;

DROP TABLE IF EXISTS attempts;

