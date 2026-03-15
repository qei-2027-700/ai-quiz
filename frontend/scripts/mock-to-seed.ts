#!/usr/bin/env tsx
// mock-to-seed.ts
// 実行: cd frontend && pnpm mock-to-seed
// 役割: quizMockData.ts を読み込み、backend/seeds/seeder.sql を生成する
// quizMockData.ts がソースオブトゥルース（問題・選択肢・解説）
// genres / scoring_tiers / ai_prompt_template はこのスクリプト内で管理（DB設定系）

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { MOCK_QUESTIONS, TOPIC_ID } from "../packages/shared/src/mocks/quizMockData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "../../backend/seeds/seeder.sql");

// ── DB設定（コース・ジャンル・ティア）────────────────────────────
// 問題コンテンツとは別に管理。変更する場合はこのスクリプトを直接編集する。

const TOPIC = {
  id: TOPIC_ID, // quizMockData.ts の TOPIC_ID と自動的に同期
  name: "AI基礎・最新動向",
  description: "RAG・LLM・AI Agentなど、AIエンジニアが押さえておくべき基礎知識と最新トレンド",
};

const GENRES = [
  { name: "ai_basics",   label: "AI基礎",         sortOrder: 1 },
  { name: "ai_services", label: "AIサービス",     sortOrder: 2 },
  { name: "engineering", label: "AIコーディング", sortOrder: 3 },
];

const SCORING_TIERS = [
  { tier: "S", minRatio: "0.900", label: "S ランク", sortOrder: 1 },
  { tier: "A", minRatio: "0.700", label: "A ランク", sortOrder: 2 },
  { tier: "B", minRatio: "0.500", label: "B ランク", sortOrder: 3 },
  { tier: "C", minRatio: "0.000", label: "C ランク", sortOrder: 4 },
];

// ── SQL ユーティリティ ────────────────────────────────────────────

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

// ── SQL 生成 ──────────────────────────────────────────────────────

const lines: string[] = [];

lines.push("-- このファイルは自動生成です。直接編集しないでください。");
lines.push("-- 生成元: frontend/packages/shared/src/mocks/quizMockData.ts");
lines.push("-- 再生成: cd frontend && pnpm mock-to-seed");
lines.push("-- idempotent（重複実行しても安全）");
lines.push("");

// ── トピック ──────────────────────────────────────────────────────
lines.push("-- ── トピック ──────────────────────────────────────────────────────");
lines.push(`INSERT INTO topics (id, name, description) VALUES (`);
lines.push(`  '${TOPIC.id}',`);
lines.push(`  '${escapeSql(TOPIC.name)}',`);
lines.push(`  '${escapeSql(TOPIC.description)}'`);
lines.push(`) ON CONFLICT (id) DO NOTHING;`);
lines.push("");
lines.push("");

// ── 問題・選択肢・解説 ────────────────────────────────────────────
for (const q of MOCK_QUESTIONS) {
  lines.push(`-- ── ${q.id}: ${q.text.slice(0, 40).replace(/\n/g, " ")}... ──`);
  lines.push(`INSERT INTO questions (id, topic_id, text, difficulty, genre)`);
  lines.push(`VALUES (`);
  lines.push(`  '${q.id}',`);
  lines.push(`  '${TOPIC.id}',`);
  lines.push(`  '${escapeSql(q.text)}',`);
  lines.push(`  ${q.difficulty}, '${q.genre}'`);
  lines.push(`) ON CONFLICT (id) DO UPDATE SET`);
  lines.push(`  text = EXCLUDED.text,`);
  lines.push(`  difficulty = EXCLUDED.difficulty,`);
  lines.push(`  genre = EXCLUDED.genre;`);
  lines.push("");

  if (q.choices.length > 0) {
    lines.push(`INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES`);
    q.choices.forEach((c, i) => {
      const isLast = i === q.choices.length - 1;
      lines.push(
        `  ('${c.id}', '${q.id}', '${escapeSql(c.text)}', ${c.isCorrect}, ${c.sortOrder})${isLast ? "" : ","}`
      );
    });
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`  text = EXCLUDED.text,`);
    lines.push(`  is_correct = EXCLUDED.is_correct;`);
    lines.push("");
  }

  if (q.explanation) {
    lines.push(`INSERT INTO explanations (question_id, text) VALUES (`);
    lines.push(`  '${q.id}',`);
    lines.push(`  '${escapeSql(q.explanation)}'`);
    lines.push(`) ON CONFLICT (question_id) DO UPDATE SET`);
    lines.push(`  text = EXCLUDED.text;`);
    lines.push("");
  }

  lines.push("");
}

// ── ジャンル（DB設定）────────────────────────────────────────────
lines.push("-- ── ジャンル（DB設定） ─────────────────────────────────────────────");
for (const g of GENRES) {
  lines.push(`INSERT INTO genres (course_id, name, label, sort_order) VALUES (`);
  lines.push(`  '${TOPIC.id}', '${g.name}', '${escapeSql(g.label)}', ${g.sortOrder}`);
  lines.push(`) ON CONFLICT (course_id, name) DO NOTHING;`);
}
lines.push("");
lines.push("");

// ── スコアティア（DB設定）────────────────────────────────────────
lines.push("-- ── スコアティア（DB設定） ─────────────────────────────────────────");
for (const t of SCORING_TIERS) {
  lines.push(`INSERT INTO scoring_tiers (course_id, tier, min_ratio, label, sort_order) VALUES (`);
  lines.push(`  '${TOPIC.id}', '${t.tier}', ${t.minRatio}, '${escapeSql(t.label)}', ${t.sortOrder}`);
  lines.push(`) ON CONFLICT (course_id, tier) DO NOTHING;`);
}
lines.push("");

const content = lines.join("\n");
writeFileSync(outputPath, content, "utf-8");
console.log(`Generated: ${outputPath}`);
console.log(`  ${MOCK_QUESTIONS.length} questions`);
