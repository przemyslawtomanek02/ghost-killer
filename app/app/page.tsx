"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";
import type { AnalysisResult } from "@/lib/analyze";

const statusColor: Record<string, { dot: string }> = {
  red: { dot: "#DC2626" },
  yellow: { dot: "#D97706" },
  green: { dot: "#16A34A" },
};
const verdictColor: Record<string, { bg: string; border: string; text: string }> = {
  safe: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  danger: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
};

export default function AppPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ nickname?: string; email?: string }>({});
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) { router.push("/login"); return; }
        setAuthed(true);
        setUser({ nickname: data.user.user_metadata?.nickname, email: data.user.email });
      });
  }, [router]);

  function resetAnalysis() {
    setResult(null);
    setError("");
    setJobText("");
    setCompany("");
    setPostedDaysAgo("");
    setOpenRoles("");
    setLinkedinActivity("");
    setLimitReached(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function analyze() {
    if (!jobText.trim()) { setError("Wklej treść ogłoszenia."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    setLimitReached(false);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobText, company, ext: { postedDaysAgo, openRoles, linkedinActivity } }),
    });

    setLoading(false);

    if (res.status === 401) { router.push("/login"); return; }
    if (res.status === 402) { setLimitReached(true); return; }
    if (!res.ok) { setError("Nie udało się przeanalizować. Spróbuj ponownie."); return; }

    const data = await res.json();
    setResult(data.result);
    setRefreshKey((k) => k + 1); // odśwież listę w sidebarze
    setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-[#FAFAF7] text-[#0A0A0A] overflow-hidden"
      style={{ fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif" }}
    >
      <AppSidebar
        user={user}
        onNewAnalysis={resetAnalysis}
        refreshKey={refreshKey}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3.5 border-b border-[#ECEAE3] bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[#F5F4EF] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-bold text-[17px] tracking-tight">Wydmuszka</span>
        </div>

        {/* Content */}
        <div ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-5 py-10 pb-16">

            {limitReached && (
              <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8 text-center mb-6">
                <h2 className="text-2xl font-black tracking-tight mb-2">Limit darmowych analiz</h2>
                <p className="text-[#57564F] mb-5">Wykorzystałeś darmowe analizy w tym miesiącu. Plan Pro znosi limit.</p>
                <div className="bg-[#FAFAF7] border border-[#ECEAE3] rounded-2xl p-5 mb-4">
                  <div className="text-4xl font-black tracking-tight">
                    29 zł<span className="text-base font-medium text-[#6B6A63]">/mies.</span>
                  </div>
                  <div className="text-sm text-[#6B6A63] mt-1">Nielimitowane analizy + historia</div>
                </div>
                <button className="w-full py-3.5 rounded-xl bg-black text-white font-bold">Przejdź na Pro</button>
              </div>
            )}

            {result && (
              <div className="mb-6">
                <div
                  className="rounded-3xl p-6 mb-4"
                  style={{
                    background: verdictColor[result.verdict]?.bg,
                    border: `1px solid ${verdictColor[result.verdict]?.border}`,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-2xl font-black tracking-tight" style={{ color: verdictColor[result.verdict]?.text }}>
                      {result.verdictLabel}
                    </div>
                    <div className="text-sm font-bold whitespace-nowrap" style={{ color: verdictColor[result.verdict]?.text }}>
                      {result.score} / 6 sygnałów
                    </div>
                  </div>
                  <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: verdictColor[result.verdict]?.text }}>
                    {result.summary}
                  </p>
                </div>

                <div className="bg-white border border-[#ECEAE3] rounded-3xl overflow-hidden mb-5">
                  {result.criteria.map((c, i) => (
                    <div
                      key={i}
                      className="flex gap-3 px-5 py-4"
                      style={{ borderBottom: i < result.criteria.length - 1 ? "1px solid #F2F0EA" : "none" }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: statusColor[c.status]?.dot }} />
                      <div>
                        <div className="text-[14.5px] font-semibold">{c.name}</div>
                        <div className="text-[13.5px] text-[#6B6A63] mt-0.5 leading-snug">{c.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={resetAnalysis}
                  className="w-full py-3.5 rounded-xl bg-white border border-[#ECEAE3] font-semibold text-[15px] hover:bg-[#F5F4EF] transition-colors"
                >
                  Sprawdź kolejną ofertę
                </button>
              </div>
            )}

            {!result && !limitReached && (
              <>
                {!loading && (
                  <div className="text-center mb-8">
                    <h1 className="text-[36px] font-black tracking-tight leading-tight mb-2">
                      Sprawdź ofertę pracy
                    </h1>
                    <p className="text-[16px] text-[#57564F]">
                      Wklej ogłoszenie — AI oceni 6 sygnałów ghost joba.
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="text-center mb-8 py-4">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[15px] text-[#57564F] font-medium">Analizuję ogłoszenie...</p>
                  </div>
                )}

                <div className="bg-white border border-[#ECEAE3] rounded-3xl p-6 shadow-sm">
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nazwa firmy (opcjonalnie)"
                    className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none mb-3 focus:border-[#9C9B93] transition-colors"
                  />
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <input
                      value={postedDaysAgo}
                      onChange={(e) => setPostedDaysAgo(e.target.value)}
                      placeholder="Dni temu"
                      className="border border-[#ECEAE3] rounded-xl px-3 py-3 text-[14px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
                    />
                    <input
                      value={openRoles}
                      onChange={(e) => setOpenRoles(e.target.value)}
                      placeholder="Ile ofert firmy"
                      className="border border-[#ECEAE3] rounded-xl px-3 py-3 text-[14px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
                    />
                    <select
                      value={linkedinActivity}
                      onChange={(e) => setLinkedinActivity(e.target.value)}
                      className="border border-[#ECEAE3] rounded-xl px-2 py-3 text-[14px] bg-[#FAFAF7] outline-none"
                    >
                      <option value="">LinkedIn?</option>
                      <option value="brak nowych pracowników od miesięcy">Brak nowych</option>
                      <option value="firma regularnie zatrudnia">Zatrudniają</option>
                      <option value="nie sprawdzałem">Nie wiem</option>
                    </select>
                  </div>
                  <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Wklej tutaj całą treść ogłoszenia o pracę..."
                    className="w-full min-h-[180px] border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] leading-relaxed bg-[#FAFAF7] outline-none resize-y focus:border-[#9C9B93] transition-colors"
                  />
                  {error && <div className="text-red-600 text-sm mt-2.5">{error}</div>}
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className="w-full mt-3.5 py-4 rounded-xl bg-black text-white font-bold text-base disabled:opacity-50 hover:bg-[#1a1a1a] transition-colors"
                  >
                    {loading ? "Analizuję..." : "Sprawdź ofertę →"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
