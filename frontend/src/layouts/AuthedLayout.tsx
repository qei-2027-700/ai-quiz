import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@ai-quiz/shared/hooks";

export function AuthedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    sessionStorage.removeItem("authed");
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/8 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/quiz")}
          className="cursor-pointer font-bold text-gray-800 dark:text-white/70 hover:text-blue-600 dark:hover:text-white transition-colors duration-150"
        >
          AI Quiz
        </button>
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            onClick={() => navigate("/ranking")}
            className={`cursor-pointer text-sm transition-colors duration-150 ${
              location.pathname === "/ranking"
                ? "text-blue-600 font-semibold"
                : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            ランキング
          </button>
          <button
            onClick={() => navigate("/settings")}
            className={`cursor-pointer text-sm transition-colors duration-150 ${
              location.pathname === "/settings"
                ? "text-blue-600 font-semibold"
                : "text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            設定
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors duration-150"
          >
            ログアウト
          </button>
          <button
            onClick={toggle}
            aria-label="テーマ切り替え"
            className="cursor-pointer text-sm text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white transition-colors duration-150"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
