#!/usr/bin/env tsx
// 実行: cd frontend && pnpm generate-seed
// 出力: ../backend/DDL/000009_generated_seed.up.sql

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { MOCK_QUESTIONS, TOPIC_ID } from "../packages/shared/src/mocks/quizMockData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "../../backend/DDL/000009_generated_seed.up.sql");

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

const lines: string[] = [];

lines.push("-- Generated from frontend/packages/shared/src/mocks/quizMockData.ts");
lines.push("-- DO NOT EDIT MANUALLY");
lines.push("");

// topics
lines.push(
  `INSERT INTO topics (id, name, description) VALUES (` +
    `'${TOPIC_ID}', 'AI基礎・最新動向', 'RAG・LLM・AI Agentなど、AIエンジニアが押さえておくべき基礎知識と最新トレンド'` +
    `) ON CONFLICT (id) DO NOTHING;`
);
lines.push("");

// questions
for (const q of MOCK_QUESTIONS) {
  lines.push(
    `INSERT INTO questions (id, topic_id, text, difficulty, genre) VALUES (` +
      `'${q.id}', '${q.topicId}', '${escapeSql(q.text)}', ${q.difficulty}, '${q.genre}'` +
      `) ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, difficulty = EXCLUDED.difficulty, genre = EXCLUDED.genre;`
  );
  lines.push("");
}

// choices
for (const q of MOCK_QUESTIONS) {
  for (const c of q.choices) {
    const isCorrect = c.isCorrect ? "true" : "false";
    lines.push(
      `INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES (` +
        `'${c.id}', '${q.id}', '${escapeSql(c.text)}', ${isCorrect}, ${c.sortOrder}` +
        `) ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, is_correct = EXCLUDED.is_correct;`
    );
  }
  lines.push("");
}

// explanations
for (const q of MOCK_QUESTIONS) {
  lines.push(
    `INSERT INTO explanations (question_id, text) VALUES (` +
      `'${q.id}', '${escapeSql(q.explanation)}'` +
      `) ON CONFLICT (question_id) DO UPDATE SET text = EXCLUDED.text;`
  );
  lines.push("");
}

const content = lines.join("\n");
writeFileSync(outputPath, content, "utf-8");
console.log(`Generated: ${lines.length} lines -> ${outputPath}`);
