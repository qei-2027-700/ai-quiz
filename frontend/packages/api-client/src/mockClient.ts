import { InsightsStatus } from "./gen/quiz/v2/quiz_pb.js";
import { MOCK_QUESTIONS } from "../../shared/src/mocks/quizMockData.js";

type AttemptState = {
  attemptId: string;
  courseId: string;
  username: string;
  aiFeedback: string;
};

interface ListQuestionsParams {
  attemptId: string;
  genre?: string;
  difficulty?: number;
}

interface SubmitAnswersParams {
  attemptId: string;
  answers: Array<{
    questionId: string;
    body:
      | { case: "singleChoice"; value: { choiceId: string } }
      | { case: "multiChoice"; value: { choiceIds: string[] } }
      | { case: "ordering"; value: { orderedItemIds: string[] } }
      | { case: undefined; value?: undefined };
  }>;
}

type MockQuizClient = {
  listCourses: () => Promise<unknown>;
  startAttempt: (params: { courseId: string; username?: string }) => Promise<unknown>;
  listQuestions: (params: ListQuestionsParams) => Promise<unknown>;
  submitAnswers: (params: SubmitAnswersParams) => Promise<unknown>;
  getAttemptInsights: (params: { attemptId: string }) => Promise<unknown>;
  listRankings: (params: { limit?: number }) => Promise<unknown>;
  listGenres: (params: { courseId: string }) => Promise<unknown>;
  register: (params: { email: string; password: string; name: string }) => Promise<{ accessToken: string; displayName: string }>;
  login: (params: { email: string; password: string }) => Promise<{ accessToken: string; displayName: string }>;
};

function generateMockAIFeedback(tier: string, correctCount: number, totalCount: number): string {
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  switch (tier) {
    case "S":
      return `素晴らしい結果です！${totalCount}問中${correctCount}問（${percentage}%）正解し、Sランクを達成しました。理解がとても深いです。次はより高度な応用問題にも挑戦してみましょう。`;
    case "A":
      return `よくできました！${totalCount}問中${correctCount}問（${percentage}%）正解し、Aランクを達成しました。基礎は十分です。苦手カテゴリを重点的に復習するとさらに伸びます。`;
    case "B":
      return `合格ラインです！${totalCount}問中${correctCount}問（${percentage}%）正解し、Bランクでした。理解はできています。間違えた問題の解説を読み直してみましょう。`;
    default:
      return `学習の機会です！${totalCount}問中${correctCount}問（${percentage}%）正解でした。まずは基礎から少しずつ積み上げていきましょう。`;
  }
}

function calcTier(correctCount: number, totalCount: number): string {
  if (totalCount === 0) return "C";
  const ratio = correctCount / totalCount;
  if (ratio >= 0.9) return "S";
  if (ratio >= 0.7) return "A";
  if (ratio >= 0.5) return "B";
  return "C";
}

function getMockUsers(): Record<string, { password: string; name: string }> {
  try {
    return JSON.parse(localStorage.getItem("mock_users") ?? "{}");
  } catch {
    return {};
  }
}

export function createMockQuizClient(): MockQuizClient {
  const attempts = new Map<string, AttemptState>();

  return {
    async listCourses() {
      return {
        courses: [
          {
            id: "mock-course",
            name: "Mock Course",
            description: "ローカルモック用コース",
          },
        ],
      };
    },

    async startAttempt({ courseId, username }) {
      const attemptId = `mock-attempt-${Date.now()}`;
      attempts.set(attemptId, {
        attemptId,
        courseId,
        username: username && username.length > 0 ? username : "Anonymous",
        aiFeedback: "",
      });
      return { attemptId };
    },

    async listQuestions({ attemptId: _attemptId, genre, difficulty }: ListQuestionsParams) {
      let filtered = [...MOCK_QUESTIONS];

      if (genre) filtered = filtered.filter((q) => q.genre === genre);
      if (difficulty !== undefined && difficulty > 0) filtered = filtered.filter((q) => q.difficulty === difficulty);

      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }

      const questions = filtered.slice(0, 10).map((q) => {
        const correctChoice = q.choices.find((c) => c.isCorrect);
        return {
          id: q.id,
          prompt: q.text,
          explanation: q.explanation,
          attributes: { genre: q.genre, difficulty: String(q.difficulty) },
          body: {
            case: "multipleChoice" as const,
            value: {
              choices: q.choices.map((c) => ({
                id: c.id,
                text: c.text,
                sortOrder: c.sortOrder,
              })),
              correctChoiceId: correctChoice?.id ?? "",
            },
          },
        };
      });

      return { questions };
    },

    async submitAnswers({ attemptId, answers }: SubmitAnswersParams) {
      const questionResults = answers.map((answer) => {
        const question = MOCK_QUESTIONS.find((q) => q.id === answer.questionId);
        if (!question) {
          return {
            questionId: answer.questionId,
            isCorrect: false,
            correct: { case: "singleChoice" as const, value: { choiceId: "" } },
            explanation: "",
          };
        }

        const correctChoice = question.choices.find((c) => c.isCorrect);
        const picked = answer.body.case === "singleChoice" ? answer.body.value.choiceId : "";
        const isCorrect = correctChoice?.id === picked;

        return {
          questionId: answer.questionId,
          isCorrect,
          correct: { case: "singleChoice" as const, value: { choiceId: correctChoice?.id ?? "" } },
          explanation: question.explanation,
        };
      });

      const correctCount = questionResults.filter((r) => r.isCorrect).length;
      const totalCount = questionResults.length;
      const tier = calcTier(correctCount, totalCount);
      const aiFeedback = generateMockAIFeedback(tier, correctCount, totalCount);

      const state = attempts.get(attemptId);
      if (state) {
        state.aiFeedback = aiFeedback;
        attempts.set(attemptId, state);
      }

      return {
        result: {
          correctCount,
          totalCount,
          tier,
          questionResults,
        },
        insightsStatus: InsightsStatus.READY,
      };
    },

    async getAttemptInsights({ attemptId }: { attemptId: string }) {
      const state = attempts.get(attemptId);
      return {
        status: InsightsStatus.READY,
        aiFeedback: state?.aiFeedback ?? "",
        citations: [],
        errorMessage: "",
      };
    },

    async listRankings({ limit: _limit }: { limit?: number }) {
      const entries = [
        { rank: 1, username: "ai_master", correctCount: 10, totalCount: 10, tier: "S", createdAt: "2025-03-01T10:00:00Z" },
        { rank: 2, username: "llm_nerd", correctCount: 9, totalCount: 10, tier: "S", createdAt: "2025-03-02T12:00:00Z" },
        { rank: 3, username: "deeplearner", correctCount: 8, totalCount: 10, tier: "A", createdAt: "2025-03-03T09:00:00Z" },
        { rank: 4, username: "rag_fan", correctCount: 7, totalCount: 10, tier: "A", createdAt: "2025-03-04T15:00:00Z" },
        { rank: 5, username: "transformer", correctCount: 6, totalCount: 10, tier: "B", createdAt: "2025-03-05T11:00:00Z" },
      ];
      return { entries };
    },

    async listGenres({ courseId: _courseId }: { courseId: string }) {
      return {
        genres: [
          { id: "genre-1", courseId: _courseId, name: "ai_basics",   label: "AI基礎",       sortOrder: 1 },
          { id: "genre-2", courseId: _courseId, name: "ai_services", label: "AIサービス",   sortOrder: 2 },
          { id: "genre-3", courseId: _courseId, name: "engineering", label: "AIコーディング", sortOrder: 3 },
        ],
      };
    },

    async register({ email, password, name }) {
      const users = getMockUsers();
      if (users[email]) {
        throw new Error("このメールアドレスはすでに登録されています");
      }
      users[email] = { password, name };
      localStorage.setItem("mock_users", JSON.stringify(users));
      return { accessToken: "mock-token", displayName: name || email };
    },

    async login({ email, password }) {
      // テストユーザー
      if (email === "test@example.com" && password === "password") {
        return { accessToken: "mock-token", displayName: "テストユーザー" };
      }
      const users = getMockUsers();
      const user = users[email];
      if (!user || user.password !== password) {
        throw new Error("メールアドレスまたはパスワードが違います");
      }
      return { accessToken: "mock-token", displayName: user.name || email };
    },
  };
}
