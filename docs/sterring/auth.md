# 認証認可設計

## 方針

- **認証方式**: JWT（Access Token + Refresh Token）の自前実装
- **外部 IdP**: MVP では使わない。将来 Keycloak（OIDC）への移行を想定した設計
- **ベンダーロックイン回避**: AWS Cognito を使わない

---

## トークン仕様

| トークン | 有効期限 | 保存場所 |
|---------|---------|---------|
| Access Token | 15分 | メモリ（Zustand / React state）|
| Refresh Token | 7日 | httpOnly Cookie（Web）/ SecureStore（RN）|

### Access Token ペイロード（JWT Claims）

```json
{
  "sub": "user-uuid",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token
- DB の `refresh_tokens` テーブルに保存（無効化を可能にするため）
- ローテーション方式: リフレッシュ時に古いトークンを無効化し新しいものを発行
- 複数端末ログインをサポート（端末ごとに Refresh Token を持つ）

---

## ロール定義（RBAC）

| Role | 説明 | 主な権限 |
|------|------|---------|
| `guest` | 未認証 | クイズ受験（スコア保存なし）、トピック一覧閲覧 |
| `user` | 登録済みユーザー | スコア保存、AI フィードバック取得、回答履歴閲覧 |
| `admin` | 管理者 | クイズ問題の作成・編集・削除、ユーザー管理 |

---

## API エンドポイント（認証関連）

Echo ルーターで REST として実装（Connect-RPC ではなく Echo を使う）

```
POST /auth/register    ユーザー登録（email + password）
POST /auth/login       ログイン → Access Token + Refresh Token Cookie
POST /auth/refresh     Refresh Token → 新 Access Token
POST /auth/logout      Refresh Token を無効化
GET  /auth/me          現在のユーザー情報取得

GET  /auth/google/start    Google OAuth 開始（リダイレクト）
GET  /auth/google/callback Google OAuth コールバック
```

### Google OAuth 用の環境変数（ローカル/本番で注入）
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URL`（例: `http://localhost:8081/auth/google/callback`）
- `AUTH_RETURN_TO_ORIGINS`（許可する return_to の origin をカンマ区切り。例: `http://localhost:5173`）

---

## Connect-RPC の認証フロー

### Interceptor 実装（`backend/internal/middleware/auth.go`）

```
Request
  └─ Authorization: Bearer <access_token>
       └─ Interceptor
            ├─ トークン検証（署名・有効期限）
            ├─ Claims からロール取得
            ├─ ctx に UserID / Role を注入
            └─ 各 handler で ctx から取得して認可判定
```

### Public / Protected の分離

```go
// Public（認証不要）
- quiz.v1.QuizService/ListTopics
- quiz.v1.QuizService/GetQuestions
- health.v1.HealthService/Check

// Protected（user ロール以上）
- quiz.v1.QuizService/SubmitAnswers
- quiz.v1.QuizService/GetResults
- ai.v1.AIService/GetFeedback
- ai.v1.AIService/GetExplanation

// Admin のみ
- admin.v1.AdminService/CreateQuestion
- admin.v1.AdminService/UpdateQuestion
- admin.v1.AdminService/DeleteQuestion
```

---

## DBスキーマ（認証関連）

```sql
-- ユーザー
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- リフレッシュトークン
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,   -- トークン本体はハッシュ化して保存
    device_info TEXT,                   -- 端末情報（任意）
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,            -- NULL = 有効
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## セキュリティ考慮点

### パスワード
- bcrypt（コスト: 12）でハッシュ化
- 平文は絶対に保存・ログ出力しない

### JWT
- アルゴリズム: `HS256`（MVP）→ `RS256`（本番。秘密鍵を AWS Secrets Manager で管理）
- シークレットは環境変数 `JWT_SECRET` で注入

### Refresh Token
- トークン本体は DB に保存しない（`SHA-256` ハッシュのみ保存）
- Cookie の属性: `HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh`

### Rate Limiting
- `/auth/login`, `/auth/register`: IP ベースで 10 req/min
- Echo ミドルウェアで実装（`golang.org/x/time/rate`）

### CORS
- 許可オリジン: 環境変数 `ALLOWED_ORIGINS` で管理（本番は特定ドメインのみ）

---

## 将来の拡張（Keycloak / OIDC）

現在の JWT 実装を OIDC に移行する際の互換ポイント：

1. Access Token の `sub` フィールドは UUID → OIDC の `sub` に対応
2. ロールは JWT の `role` claim → OIDC の `realm_roles` にマッピング
3. Interceptor の検証ロジックを JWKS エンドポイント取得に変更するだけ

```
MVP: JWT_SECRET で HS256 検証
↓
本番移行: Keycloak の JWKS URL で RS256 検証
（Interceptor の検証部分のみ差し替え）
```
