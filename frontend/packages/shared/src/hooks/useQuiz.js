import { useQuery } from "@tanstack/react-query";
import { quizClient } from "@ai-quiz/api-client";
export function useQuiz(attemptId, filter = {}, options = {}) {
    const { enabled = true } = options;
    const { data, isLoading, error } = useQuery({
        queryKey: ["quiz", "v2", "questions", attemptId, filter.genre ?? "", filter.difficulty ?? 0],
        queryFn: () => quizClient.listQuestions({
            attemptId,
            genre: filter.genre ?? "",
            difficulty: filter.difficulty ?? 0,
        }),
        enabled: enabled && attemptId.length > 0,
    });
    return {
        questions: data?.questions ?? [],
        isLoading,
        error: error,
    };
}
