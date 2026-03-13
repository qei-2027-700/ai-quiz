-- name: ListGenresByCourse :many
SELECT id, course_id, name, label, sort_order
FROM genres
WHERE course_id = $1
ORDER BY sort_order ASC, name ASC;

-- name: CreateGenre :one
INSERT INTO genres (course_id, name, label, sort_order)
VALUES ($1, $2, $3, $4)
ON CONFLICT (course_id, name) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order
RETURNING *;

-- name: ListScoringTiersByCourse :many
SELECT id, course_id, tier, min_ratio, label, sort_order
FROM scoring_tiers
WHERE course_id = $1
ORDER BY min_ratio DESC;

-- name: UpsertScoringTier :one
INSERT INTO scoring_tiers (course_id, tier, min_ratio, label, sort_order)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (course_id, tier) DO UPDATE
    SET min_ratio = EXCLUDED.min_ratio,
        label     = EXCLUDED.label,
        sort_order = EXCLUDED.sort_order
RETURNING *;

-- name: UpdateCoursePromptTemplate :exec
UPDATE topics SET ai_prompt_template = $2 WHERE id = $1;

-- name: GetCourseByID :one
SELECT id, name, description, ai_prompt_template FROM topics WHERE id = $1;
