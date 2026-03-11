#!/usr/bin/env tsx
// seed-to-mock.ts
// 実行: cd frontend && pnpm seed-to-mock
// 役割: backend/seeds/seeder.sql を読み込み、quizMockData.ts を自動生成する
// seeder.sql がソースオブトゥルース
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const seederPath = join(__dirname, "../../backend/seeds/seeder.sql");
const outputPath = join(__dirname, "../packages/shared/src/mocks/quizMockData.ts");
// ── SQL パーサー ──────────────────────────────────────────────
function unescapeSql(s) {
    return s.replace(/''/g, "'");
}
/** シングルクォートで囲まれた文字列を取り出す（''エスケープ対応） */
function extractSqlString(src, startAt) {
    let i = startAt;
    // 開始クォートを探す
    while (i < src.length && src[i] !== "'")
        i++;
    i++; // skip opening quote
    let value = "";
    while (i < src.length) {
        if (src[i] === "'" && src[i + 1] === "'") {
            value += "'";
            i += 2;
        }
        else if (src[i] === "'") {
            i++; // skip closing quote
            break;
        }
        else {
            value += src[i];
            i++;
        }
    }
    return { value, end: i };
}
function parseSeederSql(sql) {
    const questions = [];
    const choicesByQuestion = {};
    const explanationByQuestion = {};
    let topicId = "";
    // ── topic ──
    const topicMatch = sql.match(/INSERT INTO topics[^)]+\(\s*'([^']+)'/);
    if (topicMatch)
        topicId = topicMatch[1];
    // ── questions ──
    // "INSERT INTO questions (id, topic_id, text, difficulty, genre)" ブロックをすべて抽出
    const qRegex = /INSERT INTO questions[^V]+VALUES\s*\(([\s\S]*?)\)\s*ON CONFLICT/g;
    let m;
    while ((m = qRegex.exec(sql)) !== null) {
        const block = m[1];
        // 値を順番に取り出す
        const idR = extractSqlString(block, 0);
        const topicIdR = extractSqlString(block, idR.end);
        const textR = extractSqlString(block, topicIdR.end);
        // difficulty と genre を取り出す（クォートなし数値とクォートあり文字列）
        const afterText = block.slice(textR.end);
        const diffMatch = afterText.match(/,\s*(\d+)\s*,/);
        const genreR = extractSqlString(afterText, 0);
        if (!diffMatch)
            continue;
        questions.push({
            id: idR.value,
            topicId: topicIdR.value,
            text: unescapeSql(textR.value),
            difficulty: parseInt(diffMatch[1]),
            genre: unescapeSql(genreR.value),
            choices: [],
            explanation: "",
        });
    }
    // ── choices ──
    // "INSERT INTO choices (id, question_id, text, is_correct, sort_order) VALUES" ブロック
    const cRegex = /INSERT INTO choices[^V]+VALUES\s*([\s\S]*?)\s*ON CONFLICT/g;
    while ((m = cRegex.exec(sql)) !== null) {
        const block = m[1];
        // 各行が1つの choice: ('id', 'question_id', 'text', bool, num)
        // 行ごとに分割してパース
        const rowRegex = /\(\s*'[^']*'[\s\S]*?\)/g;
        let row;
        while ((row = rowRegex.exec(block)) !== null) {
            const r = row[0];
            const idR = extractSqlString(r, 0);
            const qidR = extractSqlString(r, idR.end);
            const textR = extractSqlString(r, qidR.end);
            const afterText = r.slice(textR.end);
            const boolMatch = afterText.match(/,\s*(true|false)\s*,\s*(\d+)/);
            if (!boolMatch)
                continue;
            choicesByQuestion[qidR.value] = choicesByQuestion[qidR.value] || [];
            choicesByQuestion[qidR.value].push({
                id: idR.value,
                questionId: qidR.value,
                text: unescapeSql(textR.value),
                isCorrect: boolMatch[1] === "true",
                sortOrder: parseInt(boolMatch[2]),
            });
        }
    }
    // ── explanations ──
    const eRegex = /INSERT INTO explanations[^V]+VALUES\s*\(\s*([\s\S]*?)\s*\)\s*ON CONFLICT/g;
    while ((m = eRegex.exec(sql)) !== null) {
        const block = m[1];
        const qidR = extractSqlString(block, 0);
        const textR = extractSqlString(block, qidR.end);
        explanationByQuestion[qidR.value] = unescapeSql(textR.value);
    }
    // ── 結合 ──
    for (const q of questions) {
        q.choices = (choicesByQuestion[q.id] || []).sort((a, b) => a.sortOrder - b.sortOrder);
        q.explanation = explanationByQuestion[q.id] || "";
    }
    return { topicId, questions };
}
// ── TypeScript 生成 ──────────────────────────────────────────
function generateMockTs(topicId, questions) {
    const lines = [];
    lines.push("// このファイルは自動生成です。直接編集しないでください。");
    lines.push("// 生成元: backend/seeds/seeder.sql");
    lines.push("// 再生成: cd frontend && pnpm seed-to-mock");
    lines.push("");
    lines.push("export interface MockChoice {");
    lines.push("  id: string;");
    lines.push("  text: string;");
    lines.push("  isCorrect: boolean;");
    lines.push("  sortOrder: number;");
    lines.push("}");
    lines.push("");
    lines.push("export interface MockQuestion {");
    lines.push("  id: string;");
    lines.push("  topicId: string;");
    lines.push("  text: string;");
    lines.push("  difficulty: 1 | 2 | 3;");
    lines.push("  genre: 'ai_basics' | 'ai_services' | 'hallucination' | 'engineering';");
    lines.push("  choices: MockChoice[];");
    lines.push("  explanation: string;");
    lines.push("}");
    lines.push("");
    lines.push(`export const TOPIC_ID = '${topicId}';`);
    lines.push("");
    lines.push("export const MOCK_QUESTIONS: MockQuestion[] = [");
    for (const q of questions) {
        lines.push("  {");
        lines.push(`    id: '${q.id}',`);
        lines.push(`    topicId: TOPIC_ID,`);
        lines.push(`    text: ${JSON.stringify(q.text)},`);
        lines.push(`    difficulty: ${q.difficulty},`);
        lines.push(`    genre: '${q.genre}',`);
        lines.push("    choices: [");
        for (const c of q.choices) {
            lines.push(`      { id: '${c.id}', text: ${JSON.stringify(c.text)}, isCorrect: ${c.isCorrect}, sortOrder: ${c.sortOrder} },`);
        }
        lines.push("    ],");
        lines.push(`    explanation: ${JSON.stringify(q.explanation)},`);
        lines.push("  },");
    }
    lines.push("];");
    lines.push("");
    return lines.join("\n");
}
// ── メイン ───────────────────────────────────────────────────
const sql = readFileSync(seederPath, "utf-8");
const { topicId, questions } = parseSeederSql(sql);
console.log(`Parsed: ${questions.length} questions`);
const genreCount = {};
for (const q of questions) {
    genreCount[q.genre] = (genreCount[q.genre] || 0) + 1;
}
for (const [genre, count] of Object.entries(genreCount)) {
    console.log(`  ${genre}: ${count}問`);
}
const ts = generateMockTs(topicId, questions);
writeFileSync(outputPath, ts, "utf-8");
console.log(`\nGenerated: ${outputPath}`);
