export type Locale = "ja" | "en";

export interface LandingContent {
  nav: {
    badge: string;
    github: string;
    docs: string;
    ranking: string;
    signin: string;
  };
  hero: {
    badge: string;
    headline1: string;
    headlineAccent: string;
    headline2: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: Array<{ value: string; label: string }>;
  features: {
    heading: string;
    sub: string;
    items: Array<{ icon: string; title: string; desc: string }>;
  };
  cta: {
    heading: string;
    sub: string;
    button: string;
  };
  footer: {
    signin: string;
    docs: string;
  };
  terminal: Array<{ type: string; text: string }>;
}

const brandName = import.meta.env.VITE_APP_BRAND_NAME ?? "ai-quiz";
const tagline = import.meta.env.VITE_APP_TAGLINE ?? "生成AIの理解度を試そう";
const description =
  import.meta.env.VITE_APP_DESCRIPTION ??
  "RAG・Agent・LLMの知識を10問で確認。4段階ランクで実力を測ろう。";

export const content: Record<Locale, LandingContent> = {
  ja: {
    nav: {
      badge: "v0.1.0-alpha",
      github: "GitHub",
      docs: "Docs",
      ranking: "ランキング",
      signin: "ログイン →",
    },
    hero: {
      badge: "RAG搭載 · オープンソース · セルフホスト可能",
      headline1: tagline,
      headlineAccent: "数値で証明する。",
      headline2: "",
      sub: description,
      ctaPrimary: "クイズを始める →",
      ctaSecondary: "GitHub で見る",
    },
    stats: [
      { value: "10問", label: "1セッションあたりの問題数" },
      { value: "4段階", label: "S / A / B / C ティア評価" },
      { value: "RAG", label: "文脈検索で正確な解説" },
    ],
    features: {
      heading: "本気で学ぶ人のために",
      sub: "トリビアアプリじゃない。あなたの知識のギャップを精密に特定するツールです。",
      items: [
        {
          icon: "⚡",
          title: "RAG による文脈検索",
          desc: "すべての解説は検索されたドキュメントに基づいています。ハルシネーションなし、根拠のある回答のみ。",
        },
        {
          icon: "🧠",
          title: "Claude AI フィードバック",
          desc: "セッション後、Claude があなたの回答履歴を分析してパーソナライズされた学習アドバイスを生成します。",
        },
        {
          icon: "📊",
          title: "ティア制スコアリング",
          desc: "S / A / B / C のランクで、単なる正解数ではなく真の理解度を可視化します。",
        },
        {
          icon: "🔌",
          title: "Connect-RPC API",
          desc: "型安全・バージョン管理済みの gRPC 互換 API。独自フロントエンドの組み込みも可能です。",
        },
        {
          icon: "🛡️",
          title: "セルフホスト対応",
          desc: "Docker Compose 一発で起動。データは自社インフラに。ベンダーロックインなし。",
        },
        {
          icon: "🔓",
          title: "オープンソース",
          desc: "MIT ライセンス。フォーク・拡張・ビルド、すべて自由。プルリクエスト歓迎。",
        },
      ],
    },
    cta: {
      heading: "自分の実力を測ってみませんか？",
      sub: "5分で完了。デモはアカウント不要。今すぐ確かめてください。",
      button: "クイズを始める →",
    },
    footer: {
      signin: "ログイン",
      docs: "Docs",
    },
    terminal: [
      { type: "prompt", text: `$ ${brandName} start --topic ai-fundamentals` },
      { type: "info",   text: "→ RAGパイプラインで10問を読み込み中..." },
      { type: "blank",  text: "" },
      { type: "q",      text: "Q1  RAGとは何の略ですか？" },
      { type: "choice", text: "  [A]  Retrieval-Augmented Generation  ←" },
      { type: "choice", text: "  [B]  Random Access Graph" },
      { type: "ok",     text: "✓  正解  (+10 pts)" },
      { type: "blank",  text: "" },
      { type: "q",      text: "Q2  Transformerの中心的な仕組みは？" },
      { type: "choice", text: "  [A]  Self-Attention（自己注意機構）  ←" },
      { type: "ok",     text: "✓  正解  (+10 pts)" },
      { type: "blank",  text: "" },
      { type: "result", text: "─────────────────────────────────────────" },
      { type: "result", text: "  スコア: 9 / 10    ティア: S    🏆" },
      { type: "result", text: "  AI評価: 卓越した理解度です" },
      { type: "result", text: "─────────────────────────────────────────" },
    ],
  },

  en: {
    nav: {
      badge: "v0.1.0-alpha",
      github: "GitHub",
      docs: "Docs",
      ranking: "Ranking",
      signin: "Sign in →",
    },
    hero: {
      badge: "RAG-powered · Open Source · Self-hostable",
      headline1: "Test your AI ",
      headlineAccent: "knowledge.",
      headline2: "Get smarter, fast.",
      sub: "An open-source quiz platform powered by RAG and Claude AI. Retrieves relevant context, generates explanations, and scores your AI comprehension in real time.",
      ctaPrimary: "Start Quiz →",
      ctaSecondary: "View on GitHub",
    },
    stats: [
      { value: "10", label: "questions per session" },
      { value: "4", label: "performance tiers" },
      { value: "RAG", label: "context retrieval" },
    ],
    features: {
      heading: "Built for serious learners",
      sub: "Not a trivia app. A precision tool to map your AI knowledge gaps.",
      items: [
        {
          icon: "⚡",
          title: "RAG-Powered Context",
          desc: "Every explanation is grounded in retrieved documents — not hallucinated. Know exactly where the answer comes from.",
        },
        {
          icon: "🧠",
          title: "Claude AI Feedback",
          desc: "After each session, Claude synthesizes your answer history into a personalized learning digest.",
        },
        {
          icon: "📊",
          title: "Tier-Based Scoring",
          desc: "S / A / B / C ranking surfaces your true comprehension level, not just right-or-wrong counts.",
        },
        {
          icon: "🔌",
          title: "Connect-RPC API",
          desc: "Typed, versioned gRPC-compatible API. Bring your own frontend or integrate into existing tooling.",
        },
        {
          icon: "🛡️",
          title: "Self-Hostable",
          desc: "One Docker Compose file. Your data stays on your infrastructure. No vendor lock-in.",
        },
        {
          icon: "🔓",
          title: "Open Source",
          desc: "MIT licensed. Fork it, extend it, build on it. Pull requests welcome.",
        },
      ],
    },
    cta: {
      heading: "Ready to benchmark yourself?",
      sub: "Takes 5 minutes. No account required for the demo. See where you stand.",
      button: "Take the Quiz →",
    },
    footer: {
      signin: "Sign in",
      docs: "Docs",
    },
    terminal: [
      { type: "prompt", text: `$ ${brandName} start --topic ai-fundamentals` },
      { type: "info",   text: "→ Loading 10 questions via RAG pipeline..." },
      { type: "blank",  text: "" },
      { type: "q",      text: "Q1  What does RAG stand for?" },
      { type: "choice", text: "  [A]  Retrieval-Augmented Generation  ←" },
      { type: "choice", text: "  [B]  Random Access Graph" },
      { type: "ok",     text: "✓  Correct  (+10 pts)" },
      { type: "blank",  text: "" },
      { type: "q",      text: "Q2  Core mechanism of Transformers?" },
      { type: "choice", text: "  [A]  Self-Attention                  ←" },
      { type: "ok",     text: "✓  Correct  (+10 pts)" },
      { type: "blank",  text: "" },
      { type: "result", text: "─────────────────────────────────────────" },
      { type: "result", text: "  Score: 9 / 10    Tier: S    🏆" },
      { type: "result", text: "  AI Feedback: Exceptional understanding" },
      { type: "result", text: "─────────────────────────────────────────" },
    ],
  },
};
