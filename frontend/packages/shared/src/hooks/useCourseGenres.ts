import { useQuery } from "@tanstack/react-query";
import { quizClient } from "@ai-quiz/api-client";

export interface Genre {
  id: string;
  courseId: string;
  name: string;
  label: string;
  sortOrder: number;
}

const ALL_GENRE: Genre = { id: "", courseId: "", name: "", label: "すべて", sortOrder: 0 };

export function useCourseGenres(courseId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["genres", courseId],
    queryFn: async () => {
      if (!courseId) return { genres: [] };
      return (quizClient as unknown as { listGenres: (params: { courseId: string }) => Promise<{ genres: Genre[] }> }).listGenres({ courseId });
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  const genres: Genre[] = data?.genres?.length
    ? [ALL_GENRE, ...(data.genres as Genre[])]
    : getDefaultGenres();

  return { genres, isLoading, error };
}

// バックエンドにジャンルが未定義の場合のフォールバック
function getDefaultGenres(): Genre[] {
  return [
    ALL_GENRE,
    { id: "ai_basics",   courseId: "", name: "ai_basics",   label: import.meta.env.VITE_APP_GENRE_AI_BASICS   ?? "AI基礎",       sortOrder: 1 },
    { id: "ai_services", courseId: "", name: "ai_services", label: import.meta.env.VITE_APP_GENRE_AI_SERVICES ?? "AIサービス",   sortOrder: 2 },
    { id: "engineering", courseId: "", name: "engineering", label: import.meta.env.VITE_APP_GENRE_ENGINEERING ?? "AIコーディング", sortOrder: 3 },
  ];
}
