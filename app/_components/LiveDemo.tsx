"use client";

import { useState } from "react";
import Link from "next/link";

type DemoResult = {
  verdict: "safe" | "warning" | "danger";
  score: number;
  verdictLabel: string;
  summary: string;
};

const verdictConfig: Record<string, {
  bg: string;
  border: string;
  text: string;
  accent: string;
  icon: string;
}> = {
  safe: {
    bg: "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
    border: "#BBF7D0",
    text: "#166534",
    accent: "#16A34A",
    icon: "✓",
  },
  warning: {
    bg: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
    border: "#FDE68A",
    text: "#92400E",
    accent: "#D97706",
    icon: "⚠",
  },
  danger: {
    bg: "linear-gradient(135deg, #FEF2F2, #FFE4E6)",
    border: "#FECACA",
    text: "#991B1B",
    accent: "#DC2626",
    icon: "✕",
  },
};

export default function LiveDemo() {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  async function analyze() {
    const text = jobText.trim();
    if (text.length < 80) {
      setError("Wklej dłuższe ogłoszenie (min. 80 znaków).");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setLimitReached(false);

    try {
      const res = await fetch("/api/analyze-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText: text }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setLimitReached(true);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }

      setResult(data);
    } catch {
      setError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError("");
    setJobText("");
    setLimitReached(false);
  }

  // Limit reached
  if (limitReached) {
    return (
      <div className="relative max-w-[640px] mx-auto">
        {/* Glow */}
        <div
          className="absolute -inset-1 rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #7C6FE8, #F27C5E)",
            filter: "blur(20px)",
            opacity: 0.2,
          }}
        />
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm text-center p-8">
          <div
            className="h-1 absolute top-0 left-0 right-0"
            style={{ background: "linear-gradient(90deg, #7C6FE8, #F27C5E)" }}
          />
          <div className="text-[40px] mb-3">🚧</div>
          <h3 className="text-[20px] font-black tracking-tight mb-2">Limit demo wyczerpany</h3>
          <p className="text-[#57564F] text-[15px] mb-6 leading-relaxed">
            Wykorzystałeś bezpłatną analizę demo. Zarejestruj się, żeby analizować bez ograniczeń — z historią i pełnym rozbiciem na 6 kryteriów.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3.5 rounded-xl text-white font-bold text-[15px] hover:-translate-y-0.5 transition-all duration-200 animate-gradient-btn"
          >
            Załóż darmowe konto →
          </Link>
        </div>
      </div>
    );
  }

  // Result
  if (result) {
    const vc = verdictConfig[result.verdict] ?? verdictConfig.warning;
    return (
      <div className="max-w-[640px] mx-auto flex flex-col gap-4">
        {/* Verdict card */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: vc.bg, border: `1px solid ${vc.border}` }}
        >
          {/* Score ring decoration */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[18px] shrink-0"
                style={{ background: vc.accent, color: "white" }}
              >
                {vc.icon}
              </div>
              <div className="text-[22px] font-black tracking-tight" style={{ color: vc.text }}>
                {result.verdictLabel}
              </div>
            </div>
            <div
              className="shrink-0 text-[13px] font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.7)", color: vc.text }}
            >
              {result.score}/6 red flags
            </div>
          </div>
          <p className="text-[15px] leading-relaxed" style={{ color: vc.text }}>
            {result.summary}
          </p>
        </div>

        {/* CTA */}
        <div className="relative">
          <div
            className="absolute -inset-[1px] rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(124,111,232,0.25), rgba(242,124,94,0.25))",
              borderRadius: "24px",
            }}
          />
          <div className="relative bg-white rounded-3xl p-6">
            <p className="text-[15px] font-semibold text-[#0A0A0A] mb-1">
              Chcesz pełną analizę z rozbiciem na 6 kryteriów i historią?
            </p>
            <p className="text-[13px] text-[#57564F] mb-4">
              Konto darmowe · 3 analizy miesięcznie · Bez karty
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl text-white font-bold text-[14px] hover:-translate-y-0.5 transition-all duration-200 animate-gradient-btn"
              >
                Załóż darmowe konto →
              </Link>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl border border-[#ECEAE3] font-semibold text-[14px] hover:bg-[#F1F0EE] transition-colors"
              >
                Sprawdź inne ogłoszenie
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="relative max-w-[640px] mx-auto">
      {/* Gradient glow behind card */}
      <div
        className="absolute -inset-2 rounded-3xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(124,111,232,0.3), rgba(242,124,94,0.3))",
          filter: "blur(24px)",
          opacity: 0.6,
        }}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm">
        {/* Gradient top bar */}
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(90deg, #7C6FE8, #F27C5E)" }}
        />

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent-purple)" }}
            />
            <span className="text-[13px] font-semibold text-[#57564F]">
              Wklej ogłoszenie poniżej
            </span>
          </div>

          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Wklej tutaj treść ogłoszenia o pracę... (min. 80 znaków)"
            className="w-full min-h-[180px] rounded-xl px-4 py-3 text-[15px] leading-relaxed outline-none resize-y transition-all"
            style={{
              background: "#F1F0EE",
              border: "1.5px solid transparent",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid rgba(124,111,232,0.4)";
              e.currentTarget.style.background = "#FAFAFA";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1.5px solid transparent";
              e.currentTarget.style.background = "#F1F0EE";
            }}
            disabled={loading}
          />

          {error && <p className="text-red-500 text-[13px] mt-2">{error}</p>}

          <button
            onClick={analyze}
            disabled={loading || jobText.trim().length < 80}
            className="w-full mt-3.5 py-4 rounded-xl text-white font-bold text-[15px] disabled:opacity-40 hover:-translate-y-0.5 transition-all duration-200 animate-gradient-btn"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analizuję...
              </span>
            ) : (
              "Sprawdź ofertę →"
            )}
          </button>

          <p className="text-center text-[12px] text-[#9C9B93] mt-3">
            Demo · 1 analiza dziennie bez rejestracji
          </p>
        </div>
      </div>
    </div>
  );
}
