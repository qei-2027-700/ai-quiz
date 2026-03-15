-- name: CreateUser :one
INSERT INTO users (email, role)
VALUES ($1, $2)
RETURNING id, email, role, created_at, updated_at;

-- name: GetUserByID :one
SELECT id, email, role, created_at, updated_at
FROM users
WHERE id = $1;

-- name: GetUserByProviderSub :one
SELECT u.id, u.email, u.role, u.created_at, u.updated_at
FROM users u
JOIN oauth_identities oi ON oi.user_id = u.id
WHERE oi.provider = $1 AND oi.provider_sub = $2;

-- name: UpsertOAuthIdentity :exec
INSERT INTO oauth_identities (provider, provider_sub, user_id, email, name, picture_url)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (provider, provider_sub) DO UPDATE
SET
    email       = EXCLUDED.email,
    name        = EXCLUDED.name,
    picture_url = EXCLUDED.picture_url,
    updated_at  = NOW();

-- name: InsertRefreshToken :exec
INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
VALUES ($1, $2, $3);

-- name: GetRefreshTokenByHash :one
SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
FROM refresh_tokens
WHERE token_hash = $1;

-- name: RevokeRefreshToken :exec
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE id = $1;

-- name: CreateUserWithPassword :one
INSERT INTO users (email, role, password_hash, display_name)
VALUES ($1, 'user', $2, $3)
RETURNING id, email, role, display_name, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT id, email, role, password_hash, display_name, created_at, updated_at
FROM users
WHERE email = $1;
