# ai-quiz

AI literacy quiz app — test your understanding of RAG, AI Agents, LLMs, and modern AI concepts.

## Features

- Multiple-choice quiz (10 questions per session)
- Genre and difficulty filters: AI basics, AI services, AI coding
- Tier ranking: S / A / B / C based on score
- AI-powered feedback via Claude API (explains weak points, suggests next learning steps)
- Leaderboard (ranking page)
- Bilingual UI: Japanese / English

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.22 / Echo v4 / Connect-RPC / Protocol Buffers |
| Frontend | React 18 / TypeScript / Vite / TailwindCSS |
| DB | PostgreSQL 16 + sqlc |
| AI | Claude API (claude-sonnet-4-6) |
| Frontend Hosting | Vercel |
| Backend Infra | AWS ECS Fargate |

## Local Setup

**Prerequisites**: [mise](https://mise.jdx.dev/), Docker

```bash
# Install tools, start DB, run migrations
mise run setup

# Start backend + frontend concurrently
mise run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8081 |

## Project Structure

```
proto/          API definitions (source of truth)
backend/
  cmd/server/   Entry point
  DDL/          Migration SQL
  internal/
    handler/    Connect-RPC handlers
    usecase/    Business logic
    repository/ DB access (sqlc)
    db/queries/ SQL query files
frontend/
  packages/     api-client / shared (TS types + hooks)
  src/          UI + routing
infra/          Terraform / AWS infrastructure
docs/           Architecture and design documents
```

## Available Commands

```bash
mise run setup     # First-time setup (tools + DB + migrations)
mise run dev       # Start backend + frontend
mise run generate  # Regenerate code from proto + sqlc
mise run lint      # Run all linters
mise run test      # Run all tests
```

## License

MIT
