-- name: CourseExists :one
SELECT EXISTS(
    SELECT 1
    FROM topics t
    WHERE t.id = $1
) AS exists;

-- name: InsertQuestionWithID :exec
INSERT INTO questions (id, topic_id, text, difficulty, genre)
VALUES ($1, $2, $3, $4, $5);

-- name: InsertChoiceWithID :exec
INSERT INTO choices (id, question_id, text, is_correct, sort_order)
VALUES ($1, $2, $3, $4, $5);

-- name: InsertExplanationWithID :exec
INSERT INTO explanations (id, question_id, text, doc_ref)
VALUES ($1, $2, $3, $4);

