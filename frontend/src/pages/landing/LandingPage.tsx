import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { content, type Locale } from "./content";
import { Mascot } from "../../components/Mascot";
import { MascotAnimeGirl } from "../../components/MascotAnimeGirl";
import { MascotShortHair } from "../../components/MascotShortHair";

interface Props {
  locale: Locale;
}

// ── Terminal ─────────────────────────────────────────────────

const BRAND_NAME = import.meta.env.VITE_APP_BRAND_NAME || "ai-quiz";

const LINE_COLORS: Record<string, string> = {
  prompt: "#00e5ff",
  info: "#666",
  blank: "transparent",
  q: "#e2e8f0",
  choice: "#94a3b8",
  ok: "#4ade80",
  result: "#a78bfa",
};

function Terminal({ lines }: { lines: Array<{ type: string; text: string }> }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Replace occurrences of "ai-quiz" with dynamic BRAND_NAME in terminal lines
  const processedLines = useMemo(
    () =>
      lines.map((line) => ({
        ...line,
        text: line.text.replace(/ai-quiz/g, BRAND_NAME),
      })),
    [lines],
  );

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const line = processedLines[lineIdx];
      if (!line) {
        timer = setTimeout(() => {
          setVisibleLines(0);
          setCharCount(0);
          lineIdx = 0;
          charIdx = 0;
          tick();
        }, 3000);
        return;
      }
      if (charIdx <= line.text.length) {
        setVisibleLines(lineIdx + 1);
        setCharCount(charIdx);
        charIdx++;
        timer = setTimeout(tick, line.type === "blank" ? 200 : 18);
      } else {
        lineIdx++;
        charIdx = 0;
        timer = setTimeout(tick, line.type === "ok" || line.type === "result" ? 350 : 80);
      }
    };

    tick();
    return () => clearTimeout(timer);
  }, [processedLines]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, charCount]);

  return (
    <div
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="relative w-full max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/5"
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-xs text-white/30">{BRAND_NAME} — zsh</span>
      </div>
      <div ref={containerRef} className="bg-[#0d0d0d] p-6 h-64 overflow-hidden text-sm leading-7">
        {processedLines.slice(0, visibleLines).map((line, i) => {
          const isCurrent = i === visibleLines - 1;
          const text = isCurrent ? line.text.slice(0, charCount) : line.text;
          return (
            <div key={i} style={{ color: LINE_COLORS[line.type] ?? "#e2e8f0" }}>
              {text}
              {isCurrent && charCount < line.text.length && (
                <span className="animate-pulse ml-px">▋</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────

interface FeatureCardProps { icon: string; title: string; desc: string }

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="group relative p-6 rounded-xl border border-white/8 bg-white/3 hover:border-cyan-500/40 hover:bg-white/5 transition-all duration-300">
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
      <div className="text-3xl mb-4">{icon}</div>
      <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Stat ─────────────────────────────────────────────────────

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div style={{ fontFamily: "'Syne', sans-serif" }} className="text-4xl font-extrabold text-white tabular-nums">{value}</div>
      <div className="text-white/40 text-sm mt-1">{label}</div>
    </div>
  );
}

// ── Language switcher ─────────────────────────────────────────

function LangSwitcher({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const other = locale === "ja" ? "en" : "ja";
  const label = locale === "ja" ? "EN" : "JA";
  const target = locale === "ja" ? "/en" : "/";

  return (
    <button
      onClick={() => navigate(target)}
      className="cursor-pointer px-3 py-1 text-xs font-mono rounded-md border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all duration-150"
      aria-label={`Switch to ${other}`}
    >
      {label}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────

export default function LandingPage({ locale }: Props) {
  const navigate = useNavigate();
  const c = content[locale];

  return (
    <div
      className="min-h-screen bg-[#080808] text-white overflow-x-hidden"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl font-bold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#00e5ff" }}>
            {BRAND_NAME}
          </span>
          <span className="hidden sm:inline px-2 py-0.5 text-xs rounded-md border border-white/15 text-white/40 font-mono">
            {c.nav.badge}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          {/* SP では非表示 */}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="hidden sm:block cursor-pointer text-white/50 hover:text-white text-sm transition-colors duration-150">
            {c.nav.github}
          </a>
          <a href="/docs"
            className="hidden sm:block cursor-pointer text-white/50 hover:text-white text-sm transition-colors duration-150">
            {c.nav.docs}
          </a>
          <button
            onClick={() => navigate("/ranking")}
            className="hidden sm:block cursor-pointer text-white/50 hover:text-white text-sm transition-colors duration-150">
            {c.nav.ranking ?? "Ranking"}
          </button>
          <LangSwitcher locale={locale} />
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            {c.nav.signin}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-5 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-8 sm:mb-10 rounded-full text-xs border"
          style={{ borderColor: "rgba(0,229,255,0.3)", background: "rgba(0,229,255,0.06)", color: "#00e5ff", fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
          {c.hero.badge}
        </div>

        <h1
          className="text-4xl sm:text-7xl font-extrabold leading-tight sm:leading-none tracking-tight mb-5 sm:mb-6 max-w-4xl"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {c.hero.headline1}
          <span style={{ background: "linear-gradient(90deg, #00e5ff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {c.hero.headlineAccent}
          </span>
          {c.hero.headline2 && <><br />{c.hero.headline2}</>}
        </h1>

        <p className="text-white/45 text-base sm:text-lg max-w-xl mb-10 sm:mb-12 leading-relaxed">{c.hero.sub}</p>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-14 sm:mb-20 w-full sm:w-auto">
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-black transition-all duration-200 hover:scale-105 active:scale-100"
            style={{ background: "linear-gradient(135deg, #00e5ff, #0891b2)" }}
          >
            {c.hero.ctaPrimary}
          </button>
          <a
            href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white/70 border border-white/15 hover:border-white/35 hover:text-white transition-all duration-200"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {c.hero.ctaSecondary}
          </a>
        </div>

        <div className="relative w-full flex flex-col items-center">
          <div className="relative w-full max-w-2xl">
            {/* Desktop: place both mascots around the terminal (relative to terminal width) */}
            <MascotAnimeGirl
              className="pointer-events-none hidden sm:block absolute -left-40 -bottom-14 z-10"
              sizePx={170}
            />
            <Mascot
              className="pointer-events-none hidden sm:block absolute -right-44 -bottom-14 z-10"
              sizePx={180}
            />
            <Terminal lines={c.terminal} />
          </div>

          {/* Mobile: show both side-by-side under the terminal */}
          <div className="sm:hidden mt-6 flex items-end justify-center gap-8">
            <MascotAnimeGirl sizePx={132} />
            <Mascot sizePx={120} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex justify-around border-y border-white/8 py-8 sm:py-12">
          {c.stats.map((s, i) => (
            <Fragment key={s.label}>
              {i > 0 && <div className="w-px bg-white/10" />}
              <Stat value={s.value} label={s.label} />
            </Fragment>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">{c.features.heading}</h2>
        <p className="text-center text-white/40 text-sm mb-8 sm:mb-12">{c.features.sub}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {c.features.items.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        <div className="rounded-2xl p-px" style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.4), rgba(124,58,237,0.4))" }}>
          <div className="rounded-2xl bg-[#0f0f0f] px-6 py-10 sm:px-10 sm:py-14 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{c.cta.heading}</h2>
            <p className="text-white/45 mb-8 max-w-md mx-auto text-sm sm:text-base">{c.cta.sub}</p>
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-black transition-all duration-200 hover:scale-105 active:scale-100 text-sm"
              style={{ background: "linear-gradient(135deg, #00e5ff, #0891b2)" }}
            >
              {c.cta.button}
            </button>
          </div>
        </div>
      </section>

      {/* Mascot (bottom) */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-16 pb-10 sm:pb-14">
        <div className="flex items-end justify-center sm:justify-end">
          <MascotShortHair sizePx={220} className="opacity-95" />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between text-white/25 text-xs">
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{BRAND_NAME} © {new Date().getFullYear()}</span>
        <div className="flex items-center gap-4 sm:gap-6">
          <a href="/login" className="cursor-pointer hover:text-white/60 transition-colors">{c.footer.signin}</a>
          <a href="https://github.com" className="cursor-pointer hover:text-white/60 transition-colors">GitHub</a>
          <a href="/docs" className="cursor-pointer hover:text-white/60 transition-colors">{c.footer.docs}</a>
          <LangSwitcher locale={locale} />
        </div>
      </footer>
    </div>
  );
}
