import { useEffect, useState } from "react";
const STORAGE_KEY = "theme";
function getInitial() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark")
            return stored;
    }
    catch { }
    return "dark"; // デフォルトはダーク
}
function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === "dark") {
        html.classList.add("dark");
    }
    else {
        html.classList.remove("dark");
    }
}
export function useTheme() {
    const [theme, setTheme] = useState(getInitial);
    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);
    const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    return { theme, toggle, isDark: theme === "dark" };
}
