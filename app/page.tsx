"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AnalysisResult } from "@/lib/analyze";

const statusColor: Record<string, { dot: string }> = {
  red: { dot: "#DC2626" },
  yellow: { dot: "#D97706" },
  green: { dot: "#16A34A" },
};
const verdictColor: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  safe: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  danger: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
};

export default function Home() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [jobText, setJobText] = useState("");
  const [company, setCompany] = useState("");
  const [postedDaysAgo, setPostedDaysAgo] = useState("");
  const [openRoles, setOpenRoles] = useState("");
  const [linkedinActivity, setLinkedinActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  async function analyze() {
    if (!jobText.trim()) {
      setError("Wklej treść ogłoszenia.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setLimitReached(false);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobText,
        company,
        ext: { postedDaysAgo, openRoles, linkedinActivity },
      }),
    });

    setLoading(false);

    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.status === 402) {
      setLimitReached(true);
      return;
    }
    if (!res.ok) {
      setError("Nie udało się przeanalizować. Spróbuj ponownie.");
      return;
    }

    const data = await res.json();
    setResult(data.result);
  }

  function reset() {
    setResult(null);
    setError("");
    setJobText("");
    setCompany("");
  }

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]"
      style={{ fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif" }}
    >
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-black text-white flex items-center justify-center font-black text-[17px]">
            W
          </div>
          <span className="font-bold text-[19px] tracking-tight">
            Wydmuszka
          </span>
        </div>
        {authed === true && (
          <a
            href="/historia"
            className="text-sm font-semibold border border-[#ECEAE3] bg-white rounded-full px-4 py-2"
          >
            Historia
          </a>
        )}
        {authed === false && (
          <a
            href="/login"
            className="text-sm font-semibold border border-[#ECEAE3] bg-white rounded-full px-4 py-2"
          >
            Zaloguj się
          </a>
        )}
      </nav>

      <main className="max-w-[760px] mx-auto px-6 pt-10 pb-20">
        <div className="text-center mb-10">
          <div className="inline-block text-[13px] font-semibold text-[#6B6A63] bg-white border border-[#ECEAE3] rounded-full px-3.5 py-1.5 mb-5">
            Co 5. ogłoszenie w sieci to ghost job
          </div>
          <h1 className="text-[46px] font-black tracking-tight leading-[1.05] mb-4">
            Sprawdź, czy ta oferta
            <br />
            to wydmuszka
          </h1>
          <p className="text-[18px] text-[#57564F] leading-relaxed max-w-[520px] mx-auto">
            Wklej treść ogłoszenia. W kilka sekund dostaniesz ocenę 6 sygnałów i
            werdykt, czy warto tracić czas na aplikowanie.
          </p>
        </div>

        {limitReached && (
          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8 text-center mb-6">
            <h2 className="text-2xl font-black tracking-tight mb-2">
              Limit darmowych analiz
            </h2>
            <p className="text-[#57564F] mb-5">
              Wykorzystałeś darmowe analizy w tym miesiącu. Plan Pro znosi
              limit.
            </p>
            <div className="bg-[#FAFAF7] border border-[#ECEAE3] rounded-2xl p-5 mb-4">
              <div className="text-4xl font-black tracking-tight">
                29 zł
                <span className="text-base font-medium text-[#6B6A63]">
                  /mies.
                </span>
              </div>
              <div className="text-sm text-[#6B6A63] mt-1">
                Nielimitowane analizy + historia
              </div>
            </div>
            <button className="w-full py-3.5 rounded-xl bg-black text-white font-bold">
              Przejdź na Pro
            </button>
          </div>
        )}

        {!result && !limitReached && (
          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-6 shadow-sm">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nazwa firmy (opcjonalnie)"
              className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none mb-3"
            />
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input
                value={postedDaysAgo}
                onChange={(e) => setPostedDaysAgo(e.target.value)}
                placeholder="Dni temu"
                className="border border-[#ECEAE3] rounded-xl px-3 py-3 text-[14px] bg-[#FAFAF7] outline-none"
              />
              <input
                value={openRoles}
                onChange={(e) => setOpenRoles(e.target.value)}
                placeholder="Ile ofert firmy"
                className="border border-[#ECEAE3] rounded-xl px-3 py-3 text-[14px] bg-[#FAFAF7] outline-none"
              />
              <select
                value={linkedinActivity}
                onChange={(e) => setLinkedinActivity(e.target.value)}
                className="border border-[#ECEAE3] rounded-xl px-2 py-3 text-[14px] bg-[#FAFAF7] outline-none"
              >
                <option value="">LinkedIn?</option>
                <option value="brak nowych pracowników od miesięcy">
                  Brak nowych
                </option>
                <option value="firma regularnie zatrudnia">Zatrudniają</option>
                <option value="nie sprawdzałem">Nie wiem</option>
              </select>
            </div>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Wklej tutaj całą treść ogłoszenia o pracę..."
              className="w-full min-h-[170px] border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] leading-relaxed bg-[#FAFAF7] outline-none resize-y"
            />
            {error && (
              <div className="text-red-600 text-sm mt-2.5">{error}</div>
            )}
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full mt-3.5 py-4 rounded-xl bg-black text-white font-bold text-base disabled:bg-[#3A3A38]"
            >
              {loading ? "Analizuję..." : "Sprawdź ofertę"}
            </button>
          </div>
        )}

        {result && (
          <div>
            <div
              className="rounded-3xl p-6 mb-4"
              style={{
                background: verdictColor[result.verdict]?.bg,
                border: `1px solid ${verdictColor[result.verdict]?.border}`,
              }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div
                  className="text-2xl font-black tracking-tight"
                  style={{ color: verdictColor[result.verdict]?.text }}
                >
                  {result.verdictLabel}
                </div>
                <div
                  className="text-sm font-bold whitespace-nowrap"
                  style={{ color: verdictColor[result.verdict]?.text }}
                >
                  {result.score} / 6 sygnałów
                </div>
              </div>
              <p
                className="mt-2.5 text-[15px] leading-relaxed"
                style={{ color: verdictColor[result.verdict]?.text }}
              >
                {result.summary}
              </p>
            </div>

            <div className="bg-white border border-[#ECEAE3] rounded-3xl overflow-hidden mb-5">
              {result.criteria.map((c, i) => (
                <div
                  key={i}
                  className="flex gap-3 px-5 py-4"
                  style={{
                    borderBottom:
                      i < result.criteria.length - 1
                        ? "1px solid #F2F0EA"
                        : "none",
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: statusColor[c.status]?.dot }}
                  />
                  <div>
                    <div className="text-[14.5px] font-semibold">{c.name}</div>
                    <div className="text-[13.5px] text-[#6B6A63] mt-0.5 leading-snug">
                      {c.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full py-3.5 rounded-xl bg-white border border-[#ECEAE3] font-semibold text-[15px]"
            >
              Sprawdź kolejną ofertę
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
