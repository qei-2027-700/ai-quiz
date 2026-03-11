# Project Context Summary

## Overview
This project is a full-stack quiz application with a Go backend and a TypeScript/React frontend. Communication is handled via gRPC over HTTP using `connect-go`.

## Architecture
The backend is well-structured, following a clean, layered architecture (Handler -> Usecase -> Repository). It uses PostgreSQL for its database, with `sqlc` generating a type-safe data access layer from raw SQL queries. The database schema is well-designed, with appropriate indexes for performance.

## Core Functionality
The application allows users to take a quiz, submit answers, and see their score on a public leaderboard. The API is defined in Protobuf and includes services for listing questions, submitting answers, and fetching rankings.

## Key Insight & Incomplete Features
A major finding is that the AI-powered feedback feature, advertised in the API (`ai_feedback`) and hinted at in the database schema (RAG-related columns), is **not yet implemented**. The backend currently returns a hardcoded placeholder string. Furthermore, the application lacks a secure authentication system, relying only on a user-provided name.

## Investigation Status
My analysis of the backend and API is complete. However, the investigation was interrupted before a thorough analysis of the `frontend`, `docs`, and `mobile` directories could be performed. The frontend appears to be a modern React application built with Vite, but its internal state management, component structure, and exact API usage have not been verified.

## Relevant Locations

### `proto/quiz/v1/quiz.proto`
- **Reasoning:** This file defines the entire API contract between the frontend and backend. It reveals the application's core features: fetching questions, submitting answers, and getting rankings. The `SubmitAnswersResponse` message is critical as it specifies the planned, but not fully implemented, `ai_feedback` feature.
- **Key Symbols:** `QuizService`, `SubmitAnswersResponse`

### `backend/internal/usecase/quiz.go`
- **Reasoning:** This file contains the core business logic of the application. The `SubmitAnswers` function is the most important part, as it handles scoring, tier calculation, and result saving. Crucially, it reveals that the `AiFeedback` is currently a hardcoded placeholder string, which is a major insight into the project's current state.
- **Key Symbols:** `SubmitAnswers`, `AiFeedback`

### `backend/cmd/server/main.go`
- **Reasoning:** This is the backend's main entry point. It clearly shows the application's layered architecture (Repository, Usecase, Handler) and the dependency injection used to wire the components together. It also confirms the technology stack: Go, PostgreSQL, and `connect-go` for the gRPC API.
- **Key Symbols:** `NewPostgresQuizRepository`, `NewQuizUsecase`, `NewQuizHandler`

### `backend/DDL/`
- **Reasoning:** These files define the complete database schema. They reveal the structure of the quiz content, results, and rankings tables. The schema includes columns and comments (e.g., `doc_ref` for RAG) that point to planned features. The indexes show a consideration for performance, especially for the rankings query.
- **Key Symbols:** `000001_create_tables.up.sql`

### `frontend/src/pages/QuizPage.tsx`
- **Reasoning:** (Unconfirmed) Based on the file name and project structure, this is almost certainly the main React component for the quiz user interface. My investigation was interrupted before I could analyze it, but it is the logical starting point for understanding the user-facing part of the application.
- **Key Symbols:** None specified.
