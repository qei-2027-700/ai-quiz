import { useQuery } from "@tanstack/react-query";
import { quizClient } from "@ai-quiz/api-client";
import type { Question } from "@ai-quiz/api-client";

export interface QuizFilter {
  genre?: string;
  difficulty?: number;
}

export function useQuiz(
  attemptId: string,
  filter: QuizFilter = {},
  options: { enabled?: boolean } = {},
): {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
} {
  const { enabled = true } = options;
  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz", "v2", "questions", attemptId, filter.genre ?? "", filter.difficulty ?? 0],
    queryFn: () =>
      quizClient.listQuestions({
        attemptId,
        genre: filter.genre ?? "",
        difficulty: filter.difficulty ?? 0,
      }),
    enabled: enabled && attemptId.length > 0,
  });

  return {
    questions: data?.questions ?? [],
    isLoading,
    error: error as Error | null,
  };
}
