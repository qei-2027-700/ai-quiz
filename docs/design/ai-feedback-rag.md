# AI Feedback RAG Implementation Design

## 1. Goal

This document outlines the detailed design for implementing the AI-powered feedback feature (`ai_feedback`) using a Retrieval-Augmented Generation (RAG) architecture. This approach ensures that the feedback provided to users is relevant, context-aware, and based on a controlled set of documents.

This design is based on the high-level requirements specified in `docs/sterring/api-design.md`.

## 2. Architecture Overview

The RAG implementation is divided into two main parts: an **Offline/Indexing Process** and an **Online/Inference Process**.

![RAG Architecture Diagram](https://i.imgur.com/8f3b627.png)

### 2.1. Offline/Indexing Process

This process runs once, or whenever the source documents change. Its purpose is to convert our knowledge base (Markdown files) into searchable vector embeddings.

1.  **Load Documents**: Read the markdown files from `docs/rag-documents/`.
2.  **Split Documents**: Split the documents into smaller, manageable chunks (e.g., by paragraph or a fixed number of tokens). This improves the precision of the retrieval step.
3.  **Generate Embeddings**: For each chunk, use a sentence-transformer model (e.g., `all-MiniLM-L6-v2`) to generate a vector embedding.
4.  **Store Embeddings**: Store the document chunks and their corresponding vector embeddings in a dedicated PostgreSQL table.

### 2.2. Online/Inference Process

This process runs in real-time when a user submits their quiz answers (`QuizService.SubmitAnswers`).

1.  **Create Query**: Formulate a query based on the user's incorrect answers and the topics they relate to.
2.  **Generate Query Embedding**: Convert this query into a vector embedding using the same model from the offline process.
3.  **Similarity Search**: Use PostgreSQL with the `pgvector` extension to perform a similarity search (e.g., cosine similarity) between the query vector and the stored document vectors. This retrieves the most relevant document chunks from the database.
4.  **Construct Prompt**: Create a rich prompt for the generative LLM (Claude). This prompt will include:
    *   The retrieved document chunks as context.
    *   The user's quiz results (questions, their answers, correctness).
    *   A directive to act as a helpful tutor and provide personalized feedback.
5.  **Call LLM API**: Send the constructed prompt to the Claude API.
6.  **Return Feedback**: Return the generated text from the LLM as the `ai_feedback` in the `SubmitAnswers` response.

## 3. Database Schema Changes

To support this architecture, the following changes are required in the PostgreSQL database.

### 3.1. Enable `pgvector` Extension

A new migration is needed to enable the `pgvector` extension.

```sql
-- migration: 000004_enable_pgvector.up.sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3.2. Create `document_chunks` Table

A new table is required to store the document chunks and their embeddings. This table will be the target for our similarity search.

```sql
-- migration: 000005_create_document_chunks.up.sql
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_document_name TEXT NOT NULL,         -- e.g., 'rag-basics.md'
    chunk_text TEXT NOT NULL,                 -- The text content of the chunk
    embedding VECTOR(384) NOT NULL,           -- Embedding vector. The dimension (384) depends on the model (all-MiniLM-L6-v2).
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For efficient similarity search
CREATE INDEX ON document_chunks USING hnsw (embedding vector_l2_ops);
```

**Note:** The dimension of the `VECTOR` type (`384` in this example) must match the output dimension of the chosen embedding model.

## 4. Implementation Plan

The implementation will proceed in the following steps:

1.  **Database Migration**: Create and apply the migrations to enable `pgvector` and create the `document_chunks` table.
2.  **Embedding Script**: Create a standalone Go script (`scripts/embed-documents/main.go`) that performs the "Offline/Indexing Process". This script will be run manually initially.
3.  **Backend Logic**:
    *   Update the `QuizRepository` interface and its implementation to include a method for similarity search (e.g., `FindSimilarDocumentChunks`).
    *   Modify the `QuizUsecase`'s `SubmitAnswers` function to orchestrate the "Online/Inference Process".
    *   Integrate with an LLM client (e.g., for Claude) to perform the final generation step.

## 5. Technology & Tooling

*   **PostgreSQL Extension**: `pgvector` for vector similarity search.
*   **Embedding Model**: `all-MiniLM-L6-v2` (or a similar high-performance sentence-transformer model). We will use a Go library that can run this model locally to avoid external API calls for embedding.
*   **Generative LLM**: Anthropic Claude, as specified in `api-design.md`.
