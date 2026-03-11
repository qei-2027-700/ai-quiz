# ai-quiz — Claude Code Steering

## エージェント動作方針
詳細: `.claude/rules/agent.md`
- 許可確認を求めない・質問を最小化・即実装
- ファイル3つ以上の実装・並列作業 → Agent ツールでサブエージェント起動
- UI 実装後 → Playwright MCP でスクショ撮影・自己テスト（`.mcp.json`）

## プロジェクト概要
AI理解力クイズ + RAG/AI Agent の学習アプリ。詳細は README.md。

## 技術スタック
詳細: `docs/sterring/tech-stack.md`

| レイヤー | 採用技術 |
|---------|---------|
| Backend | Go 1.22 / Echo v4 / Connect-RPC |
| Frontend | React 18 / TypeScript / Vite / TailwindCSS / oxlint |
| DB | PostgreSQL 16 + sqlc（ORM なし） |
| AI | Claude API (claude-sonnet-4-6) |
| Frontend Hosting | Vercel（CDN エッジ配信） |
| Backend Infra | AWS ECS Fargate + Terraform |
| API 定義 | Protocol Buffers → buf generate（Go/TS/OpenAPI） |

## ディレクトリ構成

```
proto/          API 定義（唯一の真実）
backend/
  cmd/server/   エントリーポイント
  DDL/          マイグレーション SQL
  internal/
    handler/    Connect-RPC ハンドラ
    usecase/    ビジネスロジック
    repository/ DB アクセス（sqlc）
    db/queries/ .sql ファイル
frontend/
  packages/     api-client / shared（共有TS型・hooks）
  src/          UI + ルーティング
docker-compose.yml  ローカル DB 起動
backend/Dockerfile  本番用マルチステージビルド（distroless）→ ECS
frontend/vercel.json SPA ルーティング設定（Vercel）
infra/          Terraform / AWS CDK（クラウドインフラのみ）
docs/
  sterring/
    tech-stack.md           技術スタック詳細
    api-design.md           MVP API 仕様（2本）
    auth.md                 JWT 認証・RBAC 設計
    harness-engineering.md  テスト・観測可能性の方針
    development-environment.md  ローカル環境・Claude Remote 構想
  api/                      OpenAPI 生成物（buf generate）
```

## コーディング規約
詳細: `.claude/rules/go.md` / `.claude/rules/frontend.md` / `.claude/rules/proto.md`

- **Backend**: handler → usecase → repository の3層。Makefile 不使用（`mise run` のみ）
- **Frontend**: `interface` 優先（Props・オブジェクト）、`@lifecycle/*` から import、oxlint

## 設計ドキュメント

| ファイル | 内容 |
|---------|------|
| `docs/sterring/api-design.md` | MVP API 2本の仕様 |
| `docs/sterring/auth.md` | JWT 認証・RBAC 設計 |
| `docs/sterring/harness-engineering.md` | テスト・観測可能性の方針 |
| `docs/sterring/development-environment.md` | ローカル環境・Claude Remote 構想 |
| `docs/sterring/ai-issue-driven-dev.md` | AI による Issue 自動起票・実装フロー |

## GitHub Issue 運用
詳細: `.claude/rules/issue.md`
- セキュリティ問題・再現バグ → 指示なしで自動起票（ラベル: `ai-detected`）
- 実装は `implement #X` と指示するだけ → AI が Issue を読んで実装・PR 作成
- `/gh-issue` スキルで Issue 起票

## コマンド（mise タスク）

```bash
mise run setup     # 初回セットアップ（ツール + DB + migration）
mise run dev       # backend + frontend 同時起動
mise run generate  # buf + sqlc コード生成（OpenAPI も）
mise run docs      # Redoc API ドキュメントプレビュー（:8080）
mise run lint      # 全体 Lint
mise run test      # 全体テスト
```

## CI/CD（GitHub Actions）
- PR → `ci.yml`（lint / test / buf lint）
- main push → Backend: ECS staging / Frontend: Vercel Preview
- `v*.*.*` タグ → Backend: ECS production / Frontend: Vercel Production（手動承認）

## ローカル開発 URL

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:5173 |
| バックエンド API | http://localhost:8081 |

## 現在のフェーズ
**Phase 1: Backend MVP**（handler / usecase / repository / sqlc / Connect-RPC）
