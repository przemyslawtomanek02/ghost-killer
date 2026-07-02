"use client";

import { useState } from "react";
import Link from "next/link";

type DemoResult = {
  verdict: "safe" | "warning" | "danger";
  score: number;
  verdictLabel: string;
  summary: string;
};

const verdictColor: Record<string, { bg: string; border: string; text: string; label: string }> = {
  safe: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", label: "Bezpieczna oferta" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", label: "Warto uważać" },
  danger: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", label: "Wysokie ryzyko" },
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
      <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8 text-center max-w-[640px] mx-auto">
        <div className="text-[40px] mb-3">🚧</div>
        <h3 className="text-[20px] font-black tracking-tight mb-2">Limit demo wyczerpany</h3>
        <p className="text-[#57564F] text-[15px] mb-6 leading-relaxed">
          Wykorzystałeś 3 darmowe analizy demo dzisiaj. Zarejestruj się, żeby analizować bez ograniczeń — z historią i pełnym rozbiciem na 6 kryteriów.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-3.5 rounded-xl bg-black text-white font-bold text-[15px] hover:bg-[#1a1a1a] transition-colors"
        >
          Załóż darmowe konto →
        </Link>
      </div>
    );
  }

  // Result
  if (result) {
    const vc = verdictColor[result.verdict] ?? verdictColor.warning;
    return (
      <div className="max-w-[640px] mx-auto flex flex-col gap-4">
        {/* Verdict card */}
        <div
          className="rounded-3xl p-6"
          style={{ background: vc.bg, border: `1px solid ${vc.border}` }}
        >
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <div className="text-[22px] font-black tracking-tight" style={{ color: vc.text }}>
              {result.verdictLabel}
            </div>
            <div className="text-sm font-bold whitespace-nowrap" style={{ color: vc.text }}>
              {result.score} / 6 sygnałów
            </div>
          </div>
          <p className="text-[15px] leading-relaxed" style={{ color: vc.text }}>
            {result.summary}
          </p>
        </div>

        {/* CTA do rejestracji */}
        <div className="bg-white border border-[#ECEAE3] rounded-3xl p-6">
          <p className="text-[15px] font-semibold text-[#0A0A0A] mb-1">
            Chcesz pełną analizę z rozbiciem na 6 kryteriów i historią?
          </p>
          <p className="text-[13px] text-[#57564F] mb-4">
            Konto darmowe · 3 analizy miesięcznie · Bez karty
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-black text-white font-bold text-[14px] hover:bg-[#1a1a1a] transition-colors"
            >
              Załóż darmowe konto →
            </Link>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl border border-[#ECEAE3] font-semibold text-[14px] hover:bg-[#F5F4EF] transition-colors"
            >
              Sprawdź inne ogłoszenie
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="bg-white border border-[#ECEAE3] rounded-3xl p-6 max-w-[640px] mx-auto shadow-sm">
      <textarea
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Wklej tutaj treść ogłoszenia o pracę... (min. 80 znaków)"
        className="w-full min-h-[180px] border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] leading-relaxed bg-[#FAFAF7] outline-none resize-y focus:border-[#9C9B93] transition-colors"
        disabled={loading}
      />
      {error && <p className="text-red-600 text-[13px] mt-2">{error}</p>}
      <button
        onClick={analyze}
        disabled={loading || jobText.trim().length < 80}
        className="w-full mt-3.5 py-4 rounded-xl bg-black text-white font-bold text-[15px] disabled:opacity-40 hover:bg-[#1a1a1a] transition-colors"
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
        Demo · 3 analizy dziennie bez rejestracji
      </p>
    </div>
  );
}
