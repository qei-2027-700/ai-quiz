import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizClient } from "@ai-quiz/api-client";
import type { MyProfile, AttemptEntry } from "@ai-quiz/api-client";

const TIER_STYLES: Record<string, string> = {
  S: "bg-yellow-400 text-yellow-900",
  A: "bg-green-500 text-white",
  B: "bg-cyan-500 text-black",
  C: "bg-gray-400 text-white",
};

function formatDate(iso: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [attempts, setAttempts] = useState<AttemptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const [profileRes, attemptsRes] = await Promise.all([
          quizClient.getMyProfile({}),
          quizClient.listMyAttempts({ limit: 50 }),
        ]);
        if (cancelled) return;
        setProfile(profileRes.profile ?? null);
        setAttempts(attemptsRes.attempts);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "プロフィールの取得に失敗しました。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-white/40 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center pt-16 px-4">
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:border dark:border-white/8 p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer px-6 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-colors duration-150"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] py-10 px-4 sm:px-6 pt-20">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* ユーザー情報 */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white/90 mb-6">
            マイページ
          </h1>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-sm font-medium text-gray-500 dark:text-white/40 sm:w-28 shrink-0">
                表示名
              </span>
              <span className="text-gray-800 dark:text-white/90 font-semibold text-lg">
                {profile?.displayName || "-"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t dark:border-white/8 pt-4">
              <span className="text-sm font-medium text-gray-500 dark:text-white/40 sm:w-28 shrink-0">
                メールアドレス
              </span>
              <span className="text-gray-700 dark:text-white/70">
                {profile?.email || "-"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t dark:border-white/8 pt-4">
              <span className="text-sm font-medium text-gray-500 dark:text-white/40 sm:w-28 shrink-0">
                登録日
              </span>
              <span className="text-gray-700 dark:text-white/70">
                {formatDate(profile?.createdAt ?? "")}
              </span>
            </div>
          </div>
        </div>

        {/* 受験履歴 */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-5 sm:p-8">
          <h2 className="text-lg font-bold text-gray-700 dark:text-white/70 mb-4">
            受験履歴
          </h2>
          {attempts.length === 0 ? (
            <p className="text-gray-500 dark:text-white/40 text-sm text-center py-6">
              まだ受験履歴がありません。
            </p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-white/8">
                    <th className="text-left py-2 px-2 font-semibold text-gray-500 dark:text-white/40 whitespace-nowrap">
                      コース
                    </th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-500 dark:text-white/40 whitespace-nowrap">
                      スコア
                    </th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-500 dark:text-white/40 whitespace-nowrap">
                      ティア
                    </th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-500 dark:text-white/40 whitespace-nowrap">
                      受験日時
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => {
                    const tierStyle =
                      TIER_STYLES[a.tier] ?? "bg-gray-400 text-white";
                    return (
                      <tr
                        key={i}
                        className="border-b dark:border-white/8 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
                      >
                        <td className="py-3 px-2 text-gray-800 dark:text-white/80">
                          {a.courseName}
                        </td>
                        <td className="py-3 px-2 text-center text-gray-700 dark:text-white/70 tabular-nums">
                          {a.correctCount} / {a.totalCount}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tierStyle}`}
                          >
                            {a.tier}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-gray-500 dark:text-white/40 tabular-nums whitespace-nowrap">
                          {formatDateTime(a.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
          <button
            onClick={() => navigate("/quiz")}
            className="cursor-pointer w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-black bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 transition-colors duration-150"
          >
            クイズに挑戦する
          </button>
          <button
            onClick={() => navigate("/ranking")}
            className="cursor-pointer w-full sm:w-auto px-8 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
          >
            ランキングを見る
          </button>
        </div>
      </div>
    </div>
  );
}
