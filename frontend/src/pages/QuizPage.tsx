import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCourses, useQuiz, useQuizSettings } from "@ai-quiz/shared/hooks";
import type { QuizFilter } from "@ai-quiz/shared/hooks";
import { quizClient } from "@ai-quiz/api-client";
import type { Course, UserAnswer } from "@ai-quiz/api-client";

// QueryClient を QuizPage の外で生成してプロバイダーとして提供
const queryClient = new QueryClient();

export default function QuizPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuizPageInner />
    </QueryClientProvider>
  );
}

// ---- 内部実装 ----

type Phase = "select" | "quiz";

interface CourseFilter {
  genre: string;      // "" = すべて
  difficulty: number; // 0 = すべて
}

interface CourseSelect {
  courseId: string;
  filter: CourseFilter;
}

interface SelectedAnswers {
  [questionId: string]: string;
}

const GENRES = [
  { value: "", label: "すべて" },
  { value: "ai_basics", label: "AI基礎" },
  { value: "ai_services", label: "AIサービス" },
  { value: "engineering", label: "AIコーディング" },
];

const DIFFICULTIES = [
  { value: 0, label: "すべて" },
  { value: 1, label: "初級" },
  { value: 2, label: "中級" },
  { value: 3, label: "上級" },
];

// ---- Course Select View ----

interface CourseSelectViewProps {
  courses: Course[];
  isLoading: boolean;
  errorMessage?: string | null;
  selectedCourseId: string;
  onSelectCourseId: (courseId: string) => void;
  onStart: (selected: CourseSelect) => void;
  isStarting: boolean;
}

function CourseSelectView({
  courses,
  isLoading,
  errorMessage,
  selectedCourseId,
  onSelectCourseId,
  onStart,
  isStarting,
}: CourseSelectViewProps) {
  const [selected, setSelected] = useState<CourseFilter>({ genre: "", difficulty: 0 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-start justify-center p-4 pt-16">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white/90 mb-8 text-center">
          クイズコースを選択してください
        </h1>

        {isLoading && (
          <div className="mb-6 text-center text-gray-500 dark:text-white/40">
            コースを読み込み中...
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {errorMessage}
          </div>
        )}

        {/* コース */}
        {!isLoading && courses.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-500 dark:text-white/40 mb-3">コース</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((c) => {
                const isActive = selectedCourseId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCourseId(c.id)}
                    className={`
                      cursor-pointer text-left p-4 rounded-xl border-2 transition-all duration-150
                      ${
                        isActive
                          ? "border-blue-600 bg-blue-50 text-blue-800"
                          : "border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/70 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    <p className="font-bold text-sm mb-1">{c.name}</p>
                    {c.description && (
                      <p className="text-xs text-gray-600 dark:text-white/40 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ジャンル */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-500 dark:text-white/40 mb-3">ジャンル</p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const isActive = selected.genre === g.value;
              return (
                <button
                  key={g.value}
                  onClick={() => setSelected((prev) => ({ ...prev, genre: g.value }))}
                  className={`
                    cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/60 hover:border-blue-400"
                    }
                  `}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 難易度 */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-gray-500 dark:text-white/40 mb-3">難易度</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => {
              const isActive = selected.difficulty === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setSelected((prev) => ({ ...prev, difficulty: d.value }))}
                  className={`
                    cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/60 hover:border-blue-400"
                    }
                  `}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <div className="flex justify-center">
          <button
            onClick={() => onStart({ courseId: selectedCourseId, filter: selected })}
            disabled={selectedCourseId.length === 0 || isStarting || isLoading}
            className="cursor-pointer w-full sm:w-auto px-10 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-150"
          >
            {isStarting ? "開始中..." : "クイズを始める →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Quiz Page Inner ----

function QuizPageInner() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("select");
  const [filter, setFilter] = useState<CourseFilter>({ genre: "", difficulty: 0 });
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [attemptId, setAttemptId] = useState<string>("");
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const { courses, isLoading: coursesLoading, error: coursesError } = useCourses({ enabled: phase === "select" });

  useEffect(() => {
    if (selectedCourseId.length > 0) return;
    if (courses.length === 0) return;
    setSelectedCourseId(courses[0].id);
  }, [courses, selectedCourseId]);

  const quizFilter: QuizFilter = { genre: filter.genre, difficulty: filter.difficulty };
  const { questions, isLoading, error } = useQuiz(attemptId, quizFilter, { enabled: phase !== "select" });
  const { autoAdvance } = useQuizSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (phase === "select") return;
    if (questions.length === 0) return;
    if (currentIndex < questions.length) return;
    setCurrentIndex(0);
  }, [currentIndex, phase, questions.length]);

  // Hooks はすべての early return より前に宣言する（Rules of Hooks）
  const submitAnswers = useCallback(
    async (latestAnswers: SelectedAnswers) => {
      const answers: UserAnswer[] = questions.map((q) => ({
        $typeName: "quiz.v2.UserAnswer" as const,
        questionId: q.id,
        body: {
          case: "singleChoice",
          value: {
            $typeName: "quiz.v2.SingleChoiceAnswer" as const,
            choiceId: latestAnswers[q.id] ?? "",
          },
        },
      }));
      setIsSubmitting(true);
      try {
        const response = await quizClient.submitAnswers({ attemptId, answers });
        navigate("/quiz/result", { state: { attemptId, response, questions } });
      } catch {
        alert("回答の送信に失敗しました。もう一度お試しください。");
      } finally {
        setIsSubmitting(false);
      }
    },
    [attemptId, questions, navigate],
  );

  if (phase === "select") {
    return (
      <CourseSelectView
        courses={courses}
        isLoading={coursesLoading}
        errorMessage={coursesError ? "コースの取得に失敗しました。時間をおいて再度お試しください。" : null}
        selectedCourseId={selectedCourseId}
        onSelectCourseId={setSelectedCourseId}
        isStarting={isStarting}
        onStart={async ({ courseId, filter: selectedFilter }) => {
          setFilter(selectedFilter);
          setIsStarting(true);
          try {
            const username = sessionStorage.getItem("username") ?? "Anonymous";
            const res = await quizClient.startAttempt({ courseId, username });
            setAttemptId(res.attemptId);
            setPhase("quiz");
          } catch {
            alert("クイズの開始に失敗しました。もう一度お試しください。");
          } finally {
            setIsStarting(false);
          }
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#080808]">
        <p className="text-lg text-gray-600 dark:text-white/50">問題を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#080808]">
        <p className="text-lg text-red-500">エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  const total = questions.length;
  if (total === 0) {
    const genreLabel = GENRES.find((g) => g.value === filter.genre)?.label ?? "不明";
    const difficultyLabel = DIFFICULTIES.find((d) => d.value === filter.difficulty)?.label ?? "不明";
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-start justify-center p-4 pt-16">
        <div className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-3">問題がありません</h1>
          <p className="text-sm text-gray-600 dark:text-white/50 mb-6 leading-relaxed">
            選択した条件に該当する問題が見つかりませんでした。条件を変更するか、条件をリセットして再取得してください。
          </p>

          <div className="text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-5 py-4 mb-6">
            <div className="text-gray-500 dark:text-white/40 font-semibold mb-2">現在の条件</div>
            <div className="text-gray-700 dark:text-white/70">
              ジャンル: <span className="font-bold">{genreLabel}</span>
              <span className="mx-2 text-gray-300 dark:text-white/15">/</span>
              難易度: <span className="font-bold">{difficultyLabel}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setFilter({ genre: "", difficulty: 0 });
                setCurrentIndex(0);
                setSelectedAnswers({});
              }}
              className="cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
            >
              条件をリセットして再取得
            </button>
            <button
              onClick={() => {
                setAttemptId("");
                setCurrentIndex(0);
                setSelectedAnswers({});
                setPhase("select");
              }}
              className="cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            >
              条件を選び直す
            </button>
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === total - 1;
  const selectedChoiceId = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const handleChoiceSelect = (choiceId: string) => {
    if (!currentQuestion) return;
    const next = { ...selectedAnswers, [currentQuestion.id]: choiceId };
    setSelectedAnswers(next);

    if (autoAdvance) {
      if (isLastQuestion) {
        submitAnswers(next);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    await submitAnswers(selectedAnswers);
  };

  if (!currentQuestion) {
    return null;
  }

  const body = currentQuestion.body.case === "multipleChoice" ? currentQuestion.body.value : null;
  const choices = body ? body.choices : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-start justify-center p-4 pt-16">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-500 dark:text-white/40">
            問題 {currentIndex + 1} / {total}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-6 rounded-full ${
                  i < currentIndex
                    ? "bg-blue-500"
                    : i === currentIndex
                    ? "bg-blue-300"
                    : "bg-gray-200 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6 leading-relaxed min-h-[6.1rem]">
          {currentQuestion.prompt}
        </h2>

        {/* Choices */}
        <div className="flex flex-col gap-3 mb-8">
          {choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelect(choice.id)}
                className={`
                  cursor-pointer text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-150
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-white/3 dark:text-white/80 dark:hover:border-cyan-500/50 dark:hover:bg-white/5"
                  }
                `}
              >
                {choice.text}
              </button>
            );
          })}
        </div>

        {/* Next / Submit button — hidden when autoAdvance is ON */}
        {(!autoAdvance || isSubmitting) && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!selectedChoiceId || isSubmitting}
              className="
                cursor-pointer px-8 py-3 rounded-xl font-bold text-white
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              {isSubmitting ? "送信中..." : isLastQuestion ? "回答する" : "次へ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
