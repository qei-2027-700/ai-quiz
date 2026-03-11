# 技術スタック詳細

## Backend

### Go 1.22+ / Echo v4
- HTTP サーバーフレームワーク
- Connect-RPC と共存（Echo: ヘルスチェック・認証エンドポイント、Connect: クイズ/AI API）
- ミドルウェア: CORS / Logger / Recover / Auth Interceptor

### Connect-RPC (buf.build/connect)
- gRPC互換の RPC フレームワーク
- HTTP/1.1 + HTTP/2 両対応（ALB での h2c 設定不要）
- Protobuf 定義から Go サーバー・TypeScript クライアントを自動生成
- `buf` CLI でコード生成管理

### API ドキュメント自動生成: buf + grpc-ecosystem/openapiv2

**swag は使わない。** Go コメント注釈は proto と二重管理になるため。
proto が唯一の真実 → buf プラグインで OpenAPI v2 (Swagger) を自動生成する。

```
proto/*.proto
  └─ buf generate
       └─ docs/api/apidocs.swagger.json   ← 自動生成（コミット可）
```

**ローカルプレビュー:**
```bash
mise run docs   # Redoc が http://localhost:8080 で起動
```

**生成プラグイン:** `buf.build/grpc-ecosystem/openapiv2`（`proto/buf.gen.yaml` で設定）

**注意:** auth エンドポイント（Echo REST）は proto 管理外のため、
`docs/api/` に手書きの `auth.swagger.json` を置いて Redoc でマージして表示する（Phase 1 以降）。

### sqlc
- SQL を書く → 型安全な Go コードが自動生成される
- ORM なし・N+1 が起きにくい・SQL が明示的
- 設定: `backend/sqlc.yaml`
- クエリ置き場: `backend/internal/db/queries/*.sql`
- 生成先: `backend/internal/db/gen/`

### golang-migrate
- マイグレーションファイル: `backend/DDL/`
- 命名規則: `000001_create_users.up.sql` / `000001_create_users.down.sql`

### PostgreSQL Extensions
- **pgvector**: RAG実装におけるセマンティックサーチ（ベクトル類似度検索）のために使用。詳細は `docs/design/ai-feedback-rag.md` を参照。

### 主要ライブラリ
| 用途 | ライブラリ |
|------|-----------|
| gRPC/Connect | `connectrpc.com/connect` |
| JWT | `github.com/golang-jwt/jwt/v5` |
| パスワードハッシュ | `golang.org/x/crypto/bcrypt` |
| DB ドライバ | `github.com/lib/pq` |
| 設定 | `github.com/spf13/viper` |
| ログ | `go.uber.org/zap` |
| バリデーション | `github.com/go-playground/validator/v10` |
| テスト | `github.com/stretchr/testify` |

---

## Frontend

### React 18 + TypeScript + Vite
- SPA 構成
- ルーティング: React Router v6

### TailwindCSS v3
- クラスは可読性重視
- 複数クラスのまとめには `clsx` + `tailwind-merge`

### Linter: oxlint
- Rust 製の高速 JS/TS Linter（ESLint 比 50〜100倍速）
- ESLint は使わない。oxlint 単体で運用
- 設定ファイル: `frontend/.oxlintrc.json`
- npm script: `"lint": "oxlint src"`
- CI でも `npm run lint` 経由で実行（ci.yml の lint ステップと統一）

### Frontend / Mobile 共有設計: npm workspaces

#### 共有できるもの / できないもの

| カテゴリ | パッケージ | 共有可否 | 理由 |
|---------|-----------|---------|------|
| API 型・クライアント | `@lifecycle/api-client` | ✅ | proto 生成・プラットフォーム非依存 |
| TanStack Query hooks | `@lifecycle/shared` | ✅ | fetch ロジック・非依存 |
| Zustand stores | `@lifecycle/shared` | ✅ | 状態 shape/actions・非依存 |
| zod バリデーション | `@lifecycle/shared` | ✅ | 純粋ロジック |
| ユーティリティ / 定数 | `@lifecycle/shared` | ✅ | 純粋関数 |
| UI コンポーネント | 各アプリ固有 | ❌ | `<div>` vs `<View>` で primitive が異なる |
| ナビゲーション | 各アプリ固有 | ❌ | React Router vs Expo Router |
| ストレージ操作 | 各アプリ固有 | ❌ | Cookie/localStorage vs SecureStore |

#### パッケージ構成

```
packages/
├── api-client/   @lifecycle/api-client  ← proto 生成 TS 型 + Connect クライアント
└── shared/       @lifecycle/shared      ← hooks / stores / utils / validation / constants
    └── src/
        ├── hooks/       TanStack Query hooks（useTopics, useQuestions, useAiFeedback ...）
        ├── stores/      Zustand stores（useAuthStore, useQuizStore）
        ├── utils/       スコアリング・フォーマット等の純粋関数
        ├── validation/  zod スキーマ（ログイン・登録フォーム等）
        └── constants/   定数（QUIZ_QUESTION_LIMIT, TIER_THRESHOLDS ...）
```

#### 依存関係

```
@lifecycle/api-client   (proto 生成)
       ↑
@lifecycle/shared       (hooks / stores / utils)
       ↑               ↑
   frontend           mobile
 (UI + Router)    (RN UI + Expo Router)
```

#### 利用側の import 例

```ts
// どちらのアプリも同じ import パスで使える
import { useTopics, useQuizStore, calcTier } from '@lifecycle/shared'
import { QuizServiceClient } from '@lifecycle/api-client'
```

#### ストレージ永続化はアプリ側で差し替え

Zustand store の shape は shared で定義し、永続化 middleware はアプリ側で注入：

```ts
// frontend: cookie ベース
// mobile: SecureStore ベース
// → store の実装には一切触れない
```

### パッケージマネージャー: pnpm

npm / yarn ではなく pnpm を採用。

| | npm | pnpm | Bun |
|--|-----|------|-----|
| 速度 | 普通 | 速い（ハードリンク） | 最速 |
| 厳格性 | ゆるい（ホイスティング） | 厳格（幽霊依存なし） | ゆるい |
| Expo/RN 対応 | ○ | ○ | △（実験的） |
| `workspace:*` | ○ | ◎（ネイティブ） | ○ |

- Bun は Expo/React Native の対応が不安定なため除外
- pnpm の `workspace:*` プロトコルはネイティブサポート
- ワークスペース定義: `pnpm-workspace.yaml`

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "frontend"
  - "mobile"
```

### 型共有: pnpm workspaces + @lifecycle/api-client

frontend と mobile で API の型・クライアントを共有するため、pnpm workspaces を採用。

```
packages/
└── api-client/          パッケージ名: @lifecycle/api-client
    └── src/
        ├── gen/         buf generate の出力先（proto → TypeScript）
        └── index.ts     gen/ を re-export
```

**buf.gen.yaml の生成先**
| プラグイン | 出力先 | 用途 |
|-----------|--------|------|
| `buf.build/protocolbuffers/go` | `backend/gen/` | Go 型 |
| `buf.build/connectrpc/go` | `backend/gen/` | Go Connect サーバー |
| `buf.build/bufbuild/es` | `packages/api-client/src/gen/` | TS 型 |
| `buf.build/connectrpc/es` | `packages/api-client/src/gen/` | TS Connect クライアント |

**利用側（frontend / mobile）**
```ts
// package.json に "@lifecycle/api-client": "workspace:*" を追加するだけ
import { QuizServiceClient } from '@lifecycle/api-client'
import type { Question } from '@lifecycle/api-client'
```

- `@connectrpc/connect` + `@connectrpc/connect-web` は `api-client` に閉じ込める
- frontend / mobile は `@lifecycle/api-client` のみ依存すれば OK

### 状態管理
- サーバー状態: TanStack Query v5
- クライアント状態: Zustand（最小限）

### 認証
- `httpOnly Cookie` でリフレッシュトークンを管理
- アクセストークンはメモリ（Zustand）に保持
- 401 時は自動リフレッシュ（TanStack Query の `onError` で処理）

---

## Mobile

### React Native (Expo SDK 51+)
- Web 版と同じ API クライアント（`proto/gen/ts/`）を共有
- ルーティング: Expo Router v3

### 認証
- リフレッシュトークン: `expo-secure-store`
- アクセストークン: メモリ（Zustand）

---

## インフラ

### デプロイ先の分離

| レイヤー | デプロイ先 | 理由 |
|---------|-----------|------|
| **Frontend** | **Vercel** | CDN エッジ配信・Preview デプロイ・ゼロコンフィグ |
| **Backend** | **AWS ECS Fargate** | Connect-RPC / WebSocket 対応・VPC 内 RDS アクセス |
| **DB** | **AWS RDS PostgreSQL 16** | マネージド・マルチ AZ |

### Vercel (Frontend)
- `frontend/vercel.json` で SPA フォールバック（`/* → /index.html`）を設定
- 環境変数は **ビルド時** に埋め込まれる（変更後は再デプロイが必要）
- Backend と接続する場合: `VITE_API_URL` を Vercel ダッシュボードで設定（本番 API エンドポイントを指定）
- Frontend 単体でデモする場合: `VITE_USE_MOCK=true`（モックAPIで見かけ上動作）
- staging: `main` push → Preview URL 自動発行
- production: `v*.*.*` タグ → `--prod` フラグでデプロイ
- 必要な GitHub Secrets: `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`

### AWS ECS Fargate (Backend)
- コンテナ単位でスケール
- タスク定義は Terraform で管理
- 将来 EKS に移行できるよう、アプリ設定は環境変数注入に統一
- Dockerfile: `backend/Dockerfile`（distroless ベース最小イメージ）

### ALB (Application Load Balancer)
- HTTPS 終端
- HTTP/2 有効（Connect-RPC に必要）
- ヘルスチェック: `GET /healthz`
- CORS: Vercel ドメイン（`*.vercel.app` および本番カスタムドメイン）を許可

### RDS PostgreSQL 16
- マルチ AZ（本番）
- パスワードは AWS Secrets Manager で管理

### ECR (Elastic Container Registry)
- backend イメージのみ管理（frontend は Vercel でビルド）
- GitHub Actions でビルド → プッシュ

### Terraform
- modules: `infra/terraform/modules/`（vpc / ecr / ecs-service / alb / rds / iam）
- environments: `infra/terraform/environments/staging|production/`
- state: S3 バックエンド + DynamoDB ロック

---

## ローカル開発

### Docker Compose
- `docker-compose.yml`（リポジトリルート）
- サービス: `postgres` のみ（backend / frontend はローカル直接起動）
- `.env.local` で環境変数を管理（`.gitignore` 対象）

### ツールバージョン管理: mise
プロジェクトルートの `mise.toml` で全ツールのバージョンを一元管理。

```bash
# mise 本体インストール
curl https://mise.run | sh
# または macOS
brew install mise

# プロジェクトのツールを全インストール
mise install
```

`mise.toml` で管理するツール:

| ツール | mise での指定 | 用途 |
|--------|--------------|------|
| Go 1.22 | `go = "1.22"` | バックエンド |
| Node 22 | `node = "22"` | フロントエンド / Mobile |
| pnpm 9 | `pnpm = "9"` | パッケージマネージャー |
| buf | `aqua:bufbuild/buf` | Protobuf / Connect コード生成 |
| sqlc | `go:github.com/sqlc-dev/sqlc/cmd/sqlc` | SQL → Go コード生成 |
| air | `go:github.com/air-verse/air` | Go ホットリロード |
| golangci-lint | `go:github.com/golangci/golangci-lint/...` | Go Lint |
| golang-migrate | `go:github.com/golang-migrate/migrate/...` | マイグレーション実行 |
| Terraform 1.8 | `terraform = "1.8"` | IaC |

mise tasks（`mise run <task>`）でプロジェクト共通タスクも管理:

| タスク | 内容 |
|--------|------|
| `setup` | 初回セットアップ（ツール + DB + マイグレーション） |
| `dev` | backend + frontend 同時起動 |
| `generate` | buf + sqlc コード生成 |
| `lint` | 全体 Lint |
| `test` | 全体テスト |

---

## CI/CD

### GitHub Actions

| トリガー | Backend | Frontend |
|---------|---------|---------|
| PR | lint / test / buf lint | lint / type-check / build |
| `main` push | ECR push → ECS staging | Vercel Preview デプロイ |
| `v*.*.*` タグ | ECR push → ECS production（手動承認） | Vercel Production デプロイ（手動承認） |

**必要な GitHub Secrets:**
- Backend: `ECR_REGISTRY` / `AWS_ROLE_ARN_STAGING` / `AWS_ROLE_ARN_PRODUCTION`
- Frontend: `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`

### ブランチ戦略
- `main`: staging 環境と同期
- `release/x.x.x`: 本番デプロイ用
- feature ブランチ: `feature/<description>`
