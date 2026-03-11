import { useState } from "react";

const STORAGE_KEY = "quiz-settings";

interface QuizSettings {
  autoAdvance: boolean;
}

function loadSettings(): QuizSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { autoAdvance: true, ...JSON.parse(raw) };
  } catch {}
  return { autoAdvance: true }; // デフォルト: 自動進行 ON
}

function saveSettings(s: QuizSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useQuizSettings() {
  const [settings, setSettings] = useState<QuizSettings>(loadSettings);

  const setAutoAdvance = (value: boolean) => {
    const next = { ...settings, autoAdvance: value };
    setSettings(next);
    saveSettings(next);
  };

  return {
    autoAdvance: settings.autoAdvance,
    setAutoAdvance,
  };
}
