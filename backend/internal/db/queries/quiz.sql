-- name: ListQuestionsByTopic :many
SELECT
    q.id,
    q.text,
    q.topic_id,
    q.difficulty,
    q.genre
FROM questions q
WHERE q.topic_id = $1
ORDER BY random()
LIMIT $2;

-- name: ListCourses :many
SELECT
    t.id,
    t.name,
    t.description
FROM topics t
ORDER BY t.created_at ASC;

-- name: ListChoicesByQuestionIDs :many
SELECT
    c.id,
    c.question_id,
    c.text,
    c.is_correct,
    c.sort_order
FROM choices c
WHERE c.question_id = ANY($1::uuid[])
ORDER BY c.question_id, c.sort_order;

-- name: GetExplanationsByQuestionIDs :many
SELECT
    e.question_id,
    e.text,
    e.doc_ref
FROM explanations e
WHERE e.question_id = ANY($1::uuid[]);

-- name: GetFirstTopicID :one
SELECT id FROM topics ORDER BY created_at LIMIT 1;

-- name: CreateAttempt :one
INSERT INTO attempts (course_id, username)
VALUES ($1, $2)
RETURNING id;

-- name: GetAttempt :one
SELECT
    a.id,
    a.course_id,
    a.username,
    a.created_at
FROM attempts a
WHERE a.id = $1;

-- name: InsertQuizResult :exec
INSERT INTO quiz_results (username, correct_count, total_count, tier)
VALUES ($1, $2, $3, $4);

-- name: InsertQuizResultV2 :exec
INSERT INTO quiz_results (attempt_id, username, correct_count, total_count, tier)
VALUES ($1, $2, $3, $4, $5);

-- name: UpsertAttemptInsights :exec
INSERT INTO attempt_insights (attempt_id, status, ai_feedback, error_message)
VALUES ($1, $2, $3, $4)
ON CONFLICT (attempt_id) DO UPDATE
SET
    status        = EXCLUDED.status,
    ai_feedback   = EXCLUDED.ai_feedback,
    error_message = EXCLUDED.error_message,
    updated_at    = NOW();

-- name: GetAttemptInsights :one
SELECT
    attempt_id,
    status,
    ai_feedback,
    error_message,
    created_at,
    updated_at
FROM attempt_insights
WHERE attempt_id = $1;

-- name: ListRankings :many
SELECT
    ROW_NUMBER() OVER (ORDER BY correct_count DESC, created_at ASC)::int AS rank,
    username,
    correct_count,
    total_count,
    tier,
    created_at
FROM quiz_results
ORDER BY correct_count DESC, created_at ASC
LIMIT $1;
