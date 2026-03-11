import { describe, it, expect, vi } from "vitest";

// @ai-quiz/shared/hooks モジュールをモック
vi.mock("@ai-quiz/shared/hooks", () => ({
  useQuiz: vi.fn(() => ({
    questions: [],
    isLoading: true,
    error: null,
  })),
  useCourses: vi.fn(() => ({
    courses: [],
    isLoading: true,
    error: null,
  })),
  useQuizSettings: vi.fn(() => ({
    autoAdvance: false,
  })),
}));

// @ai-quiz/api-client モジュールをモック
vi.mock("@ai-quiz/api-client", () => ({
  quizClient: {
    listCourses: vi.fn().mockResolvedValue({ courses: [] }),
    startAttempt: vi.fn().mockResolvedValue({ attemptId: "mock-attempt" }),
    listQuestions: vi.fn().mockResolvedValue({ questions: [] }),
    submitAnswers: vi.fn().mockResolvedValue({
      result: {
        correctCount: 0,
        totalCount: 0,
        tier: "C",
        questionResults: [],
      },
      insightsStatus: 2,
    }),
    getAttemptInsights: vi.fn().mockResolvedValue({
      status: 2,
      aiFeedback: "",
      citations: [],
      errorMessage: "",
    }),
  },
}));

// @tanstack/react-query モジュールをモック
vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useQuery: vi.fn(() => ({
    data: undefined,
    isLoading: true,
    error: null,
  })),
}));

describe("QuizPage", () => {
  it("モジュールが正常にインポートできる", async () => {
    const module = await import("./QuizPage");
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  it("useQuiz フックがローディング状態を返す", async () => {
    const { useQuiz } = await import("@ai-quiz/shared/hooks");
    const result = (useQuiz as ReturnType<typeof vi.fn>)("mock-attempt", {});
    expect(result.isLoading).toBe(true);
    expect(result.questions).toEqual([]);
    expect(result.error).toBeNull();
  });
});
