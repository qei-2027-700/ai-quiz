// アプリ全体で使う定数
export const QUIZ_QUESTION_LIMIT = 10;

export const TIER_THRESHOLDS = {
  S: 0.9,
  A: 0.75,
  B: 0.6,
  C: 0,
} as const;

export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;  // 15分
