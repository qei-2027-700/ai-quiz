import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuizSettings, useTheme } from "@ai-quiz/shared/hooks";
export default function SettingsPage() {
    const { autoAdvance, setAutoAdvance } = useQuizSettings();
    const { isDark, toggle } = useTheme();
    return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-[#080808] flex items-center justify-center p-4 pt-20", children: _jsxs("div", { className: "w-full max-w-lg", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-8", children: "\u8A2D\u5B9A" }), _jsxs("div", { className: "bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-white/8 divide-y divide-gray-100 dark:divide-white/8", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800 dark:text-white/90", children: "\u9078\u629E\u5F8C\u3059\u3050\u306B\u6B21\u306E\u554F\u984C\u3078" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-white/40 mt-0.5", children: "\u9078\u629E\u80A2\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u5373\u5EA7\u306B\u6B21\u306E\u554F\u984C\u3078\u9032\u307F\u307E\u3059\u3002\u30AA\u30D5\u306B\u3059\u308B\u3068\u300C\u6B21\u3078\u300D\u30DC\u30BF\u30F3\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002" })] }), _jsx("button", { role: "switch", "aria-checked": autoAdvance, onClick: () => setAutoAdvance(!autoAdvance), className: `
                cursor-pointer relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent
                transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${autoAdvance ? "bg-blue-600" : "bg-gray-200"}
              `, children: _jsx("span", { className: `
                  pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${autoAdvance ? "translate-x-5" : "translate-x-0"}
                ` }) })] }), _jsxs("div", { className: "flex items-center justify-between px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800 dark:text-white/90", children: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-white/40 mt-0.5", children: "\u753B\u9762\u5168\u4F53\u306E\u914D\u8272\u3092\u5207\u308A\u66FF\u3048\u307E\u3059\u3002" })] }), _jsx("button", { role: "switch", "aria-checked": isDark, onClick: toggle, className: `
                cursor-pointer relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent
                transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${isDark ? "bg-blue-600" : "bg-gray-200"}
              `, children: _jsx("span", { className: `
                  pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm
                  transition-transform duration-200
                  ${isDark ? "translate-x-5" : "translate-x-0"}
                ` }) })] })] }), _jsx("p", { className: "text-xs text-gray-400 dark:text-white/30 mt-4 px-1", children: "\u8A2D\u5B9A\u306F\u30D6\u30E9\u30A6\u30B6\u306B\u4FDD\u5B58\u3055\u308C\u307E\u3059\u3002" })] }) }));
}
