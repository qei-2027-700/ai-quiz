import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminClient } from "@ai-quiz/api-client";
import type { ImportQuestionsCsvResponse, CsvRowError } from "@ai-quiz/api-client";

function isMockMode(): boolean {
  const flag = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_USE_MOCK;
  return flag === "true" || flag === true;
}

export default function AdminImportPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [csvText, setCsvText] = useState("");
  const [isDryRun, setIsDryRun] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportQuestionsCsvResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminClient = useMemo(
    () => createAdminClient({ basicAuth: { user: adminUser, pass: adminPass } }),
    [adminUser, adminPass],
  );

  const template = `course_id,prompt,difficulty,genre,choice_1,choice_2,choice_3,choice_4,correct_choice,explanation,question_id
00000000-0000-0000-0000-000000000001,"例: 生成AIが発展するとデータセンター需要が高まる理由は？",2,engineering,"端末内で完結するから","GPU計算/電力/冷却/ネットワークが必要だから","ストレージ需要が減るから","回線が不要になるから",2,"解説（任意）",
`;

  const submit = async (dryRun: boolean) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const bytes = new TextEncoder().encode(csvText);
      const res = await adminClient.importQuestionsCsv({ csv: bytes, dryRun });
      setResult(res);
    } catch {
      setError("インポートに失敗しました（認証情報・API URL・CSV形式を確認してください）。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const errors: CsvRowError[] = result?.errors ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] py-10 px-4 pt-20">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Admin: CSV インポート</h1>
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer px-4 py-2 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
          >
            戻る
          </button>
        </header>

        {isMockMode() && (
          <div className="text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-200 rounded-xl px-5 py-4">
            現在モックモード（`VITE_USE_MOCK=true`）のため、Admin インポートはバックエンドが必要です。
          </div>
        )}

        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-700 dark:text-white/70">認証（固定Admin）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-500 dark:text-white/40">ADMIN_USER</span>
              <input
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-500 dark:text-white/40">ADMIN_PASS</span>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-md dark:shadow-none dark:border dark:border-white/8 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-700 dark:text-white/70">CSV</h2>
            <button
              onClick={() => setCsvText(template)}
              className="cursor-pointer px-4 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
            >
              テンプレを貼り付け
            </button>
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm font-mono text-gray-800 dark:text-white/80 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="ここにCSVを貼り付けるか、テンプレを使用してください"
          />

          <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/70">
              <input
                type="checkbox"
                checked={isDryRun}
                onChange={(e) => setIsDryRun(e.target.checked)}
              />
              Dry-run（検証のみ）
            </label>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => submit(true)}
                disabled={isSubmitting || csvText.trim().length === 0}
                className="cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl font-bold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Dry-run 実行
              </button>
              <button
                onClick={() => submit(isDryRun)}
                disabled={isSubmitting || csvText.trim().length === 0}
                className="cursor-pointer w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isSubmitting ? "送信中..." : isDryRun ? "検証する" : "インポートする"}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 dark:text-white/70">
                作成予定/作成数: <span className="font-bold">{result.createdQuestions}</span>
              </div>
              {errors.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 overflow-hidden">
                  <div className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-300">
                    エラー（{errors.length}件）
                  </div>
                  <div className="divide-y divide-red-500/10">
                    {errors.slice(0, 30).map((e, idx) => (
                      <div key={idx} className="px-4 py-3 text-sm text-red-700 dark:text-red-200">
                        <span className="font-mono">row {e.rowNumber}</span> / <span className="font-mono">{e.field}</span>:{" "}
                        {e.message}
                      </div>
                    ))}
                  </div>
                  {errors.length > 30 && (
                    <div className="px-4 py-2 text-xs text-red-600 dark:text-red-300">
                      先頭30件のみ表示しています
                    </div>
                  )}
                </div>
              )}
              {errors.length === 0 && (
                <div className="text-sm bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-200 rounded-xl px-5 py-4">
                  OK
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

