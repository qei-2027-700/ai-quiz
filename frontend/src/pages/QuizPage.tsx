import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCourses, useQuiz, useQuizSettings, useCourseGenres } from "@ai-quiz/shared/hooks";
import type { QuizFilter, Genre } from "@ai-quiz/shared/hooks";
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

// TODO: DIFFICULTIES も将来的には useCourseGenres 同様の hook で動的取得に移行する
const DIFFICULTIES = [
  { value: 0, label: "すべて" },
  { value: 1, label: "初級" },
  { value: 2, label: "中級" },
  { value: 3, label: "上級" },
];

// ---- Course Select View ----

interface CourseSelectViewProps {
  courses: Course[];
  genres: Genre[];
  isLoading: boolean;
  errorMessage?: string | null;
  selectedCourseId: string;
  onSelectCourseId: (courseId: string) => void;
  onStart: (selected: CourseSelect) => void;
  isStarting: boolean;
}

function CourseSelectView({
  courses,
  genres,
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
                          ? "border-cyan-500 bg-cyan-500/10 text-black dark:text-black"
                          : "border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/70 hover:border-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-white/5"
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
            {genres.map((g) => {
              const isActive = selected.genre === g.name;
              return (
                <button
                  key={g.id || "all"}
                  onClick={() => setSelected((prev) => ({ ...prev, genre: g.name }))}
                  className={`
                    cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? "bg-cyan-500 text-black border-cyan-500"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/60 hover:border-cyan-400"
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
                        ? "bg-cyan-500 text-black border-cyan-500"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/60 hover:border-cyan-400"
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
            className="cursor-pointer w-full sm:w-auto px-10 py-3 rounded-xl font-bold text-black bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-150"
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
  const { genres } = useCourseGenres(selectedCourseId);

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
  const [feedbackMap, setFeedbackMap] = useState<{
    [questionId: string]: { isCorrect: boolean; correctChoiceId: string };
  }>({});

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
        genres={genres}
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
    const genreLabel = genres.find((g) => g.name === filter.genre)?.label ?? "不明";
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
                setFeedbackMap({});
              }}
              className="cursor-pointer w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-black bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 transition-colors duration-150"
            >
              条件をリセットして再取得
            </button>
            <button
              onClick={() => {
                setAttemptId("");
                setCurrentIndex(0);
                setSelectedAnswers({});
                setFeedbackMap({});
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
  const currentFeedback = currentQuestion ? feedbackMap[currentQuestion.id] : undefined;

  const handleChoiceSelect = (choiceId: string) => {
    if (!currentQuestion) return;
    // 回答済みの場合は変更不可
    if (feedbackMap[currentQuestion.id]) return;

    const next = { ...selectedAnswers, [currentQuestion.id]: choiceId };
    setSelectedAnswers(next);

    // 即時フィードバック: correct_choice_id で正誤を判定
    const body = currentQuestion.body.case === "multipleChoice" ? currentQuestion.body.value : null;
    const correctChoiceId = body?.correctChoiceId ?? "";
const isCorrect = correctChoiceId !== "" && choiceId === correctChoiceId;
    setFeedbackMap((prev) => ({
      ...prev,
      [currentQuestion.id]: { isCorrect, correctChoiceId },
    }));

    if (autoAdvance && !isLastQuestion) {
      // フィードバックを少し見せてから自動進行（最終問題はボタンクリックで提出）
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, 1200);
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
      <div className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-8 transition-all duration-200">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-500 dark:text-white/40">
            問題 {currentIndex + 1} / {total}
          </span>
          <div className="flex gap-1 items-center">
            {questions.map((q, i) => {
              const isAnswered = !!selectedAnswers[q.id];
              const isCurrent = i === currentIndex;
              const isNavigable = isAnswered || isCurrent;
              const qFeedback = feedbackMap[q.id];
              const dotColor = qFeedback
                ? qFeedback.isCorrect
                  ? "bg-cyan-500"
                  : "bg-red-500"
                : isCurrent
                ? "bg-cyan-500/40"
                : "bg-gray-200 dark:bg-white/10";
              return (
                <button
                  key={i}
                  onClick={() => isNavigable && setCurrentIndex(i)}
                  title={isNavigable ? `問題 ${i + 1}` : undefined}
                  className={`
                    py-3 px-1
                    ${isNavigable ? "cursor-pointer" : "cursor-default"}
                  `}
                >
                  <div
                    className={`
                      h-2 w-6 rounded-full transition-all duration-150
                      ${dotColor}
                      ${isNavigable ? "hover:opacity-80" : ""}
                    `}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6 leading-relaxed min-h-[6.1rem]">
          {currentQuestion.prompt}
        </h2>

        {/* Choices */}
        <div className="flex flex-col gap-3 mb-6">
          {choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const isCorrectChoice = !!currentFeedback && choice.id === currentFeedback.correctChoiceId;
            const isWrongSelected = !!currentFeedback && isSelected && !currentFeedback.isCorrect;

            let choiceStyle: string;
            if (currentFeedback) {
              if (isCorrectChoice) {
                choiceStyle = "border-green-500 bg-green-500/10 text-green-400 dark:text-green-400";
              } else if (isWrongSelected) {
                choiceStyle = "border-red-500 bg-red-500/10 text-red-400 dark:text-red-400";
              } else {
                choiceStyle = "border-gray-200 bg-white text-gray-400 dark:border-white/10 dark:bg-white/3 dark:text-white/30";
              }
            } else if (isSelected) {
              choiceStyle = "border-cyan-500 bg-cyan-500/10 text-cyan-400";
            } else {
              choiceStyle = "border-gray-200 bg-white text-gray-700 hover:border-cyan-400/60 hover:bg-cyan-500/10 dark:border-white/10 dark:bg-white/3 dark:text-white/80 dark:hover:border-cyan-500/50 dark:hover:bg-white/5";
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleChoiceSelect(choice.id)}
                disabled={!!currentFeedback}
                className={`
                  text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200
                  ${currentFeedback ? "cursor-default" : "cursor-pointer"}
                  ${choiceStyle}
                `}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{choice.text}</span>
                  {currentFeedback && isCorrectChoice && (
                    <span className="shrink-0 text-green-400 font-bold">✓</span>
                  )}
                  {currentFeedback && isWrongSelected && (
                    <span className="shrink-0 text-red-400 font-bold">✗</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* フィードバックメッセージ */}
        {currentFeedback && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentFeedback.isCorrect
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {currentFeedback.isCorrect ? "正解です！" : "不正解です。正解は緑色の選択肢です。"}
          </div>
        )}

        {/* Next / Submit button */}
        {/* フィードバックあり（回答済みに戻った場合も含む）または送信中は常に表示 */}
        {/* autoAdvance ON の未回答問題: タイマーが自動進行するためボタン非表示（最終問題のみ例外） */}
        {(isSubmitting || !!currentFeedback) && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="
                cursor-pointer px-8 py-3 rounded-xl font-bold text-black
                bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600
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
