import { useQuery } from "@tanstack/react-query";
import { quizClient } from "@ai-quiz/api-client";
import type { Course } from "@ai-quiz/api-client";

export function useCourses(options: { enabled?: boolean } = {}): {
  courses: Course[];
  isLoading: boolean;
  error: Error | null;
} {
  const { enabled = true } = options;
  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz", "v2", "courses"],
    queryFn: () => quizClient.listCourses({}),
    enabled,
  });

  return {
    courses: data?.courses ?? [],
    isLoading,
    error: error as Error | null,
  };
}

