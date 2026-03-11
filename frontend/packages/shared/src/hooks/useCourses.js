import { useQuery } from "@tanstack/react-query";
import { quizClient } from "@ai-quiz/api-client";
export function useCourses(options = {}) {
    const { enabled = true } = options;
    const { data, isLoading, error } = useQuery({
        queryKey: ["quiz", "v2", "courses"],
        queryFn: () => quizClient.listCourses({}),
        enabled,
    });
    return {
        courses: data?.courses ?? [],
        isLoading,
        error: error,
    };
}
