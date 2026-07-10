"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";
import { scanCv, type CvScanResult } from "@/lib/cv-scan";

type UserMeta = { nickname?: string; email?: string };

const gradeColor: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  A: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", ring: "#16A34A" },
  B: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", ring: "#2563EB" },
  C: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", ring: "#D97706" },
  D: { bg: "#FFF7ED", border: "#FDBA74", text: "#9A3412", ring: "#EA580C" },
  F: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", ring: "#DC2626" },
};

const gradeLabel: Record<string, string> = {
  A: "Świetne CV",
  B: "Dobre CV",
  C: "Wymaga poprawek",
  D: "Słabe dopasowanie",
  F: "Wymaga przepisania",
};

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const gc = gradeColor[grade] ?? gradeColor["C"];
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#ECEAE3" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={gc.ring} strokeWidth="10"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-[#0A0A0A]">{score}</span>
          <span className="text-xs text-[#9C9B93] font-medium">/ 100</span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-sm font-bold border"
        style={{ background: gc.bg, borderColor: gc.border, color: gc.text }}
      >
        {grade} — {gradeLabel[grade]}
      </div>
    </div>
  );
}

function SectionCard({
  title, score, max, children,
}: { title: string; score: number; max: number; children?: React.ReactNode }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "#16A34A" : pct >= 55 ? "#D97706" : "#DC2626";

  return (
    <div className="bg-white border border-[#ECEAE3] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-[#0A0A0A]">{title}</span>
        <span className="text-[13px] font-bold" style={{ color }}>
          {score} / {max}
        </span>
      </div>
      <div className="h-1.5 bg-[#F0EFE9] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {children}
    </div>
  );
}

function Tag({ label, variant }: { label: string; variant: "green" | "red" | "neutral" }) {
  const styles = {
    green: "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]",
    red: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
    neutral: "bg-[#F5F4EF] text-[#57564F] border-[#ECEAE3]",
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${styles[variant]}`}>
      {label}
    </span>
  );
}

export default function CvPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserMeta>({});
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<CvScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setAuthed(true);
      setUser({ nickname: data.user.user_metadata?.nickname, email: data.user.email });
    });
  }, [router]);

  function scan() {
    setError("");
    const cv = cvText.trim();
    if (cv.length < 100) {
      setError("Wklej pełny tekst CV (minimum 100 znaków).");
      return;
    }
    setScanning(true);
    // Lekkie opóźnienie UI, żeby animacja zdążyła się pokazać
    setTimeout(() => {
      const r = scanCv(cv, jobText.trim() || undefined);
      setResult(r);
      setScanning(false);
      setTimeout(() => {
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }, 300);
  }

  function reset() {
    setResult(null);
    setError("");
    setCvText("");
    setJobText("");
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAF7] overflow-hidden">
      <AppSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#ECEAE3] bg-white sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[#F5F4EF] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-bold text-[16px] tracking-tight">Skaner CV</span>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-black tracking-tight text-[#0A0A0A] mb-1.5">
              Skaner CV
            </h1>
            <p className="text-[15px] text-[#57564F] leading-relaxed">
              Sprawdź, jak Twoje CV wypadnie w systemie ATS. Wklej tekst CV i opcjonalnie ogłoszenie pracy,
              żeby zobaczyć dopasowanie słów kluczowych.
            </p>
          </div>

          {!result ? (
            /* ─── Input form ─────────────────────────────────────────── */
            <div className="flex flex-col gap-5">
              {/* CV textarea */}
              <div>
                <label className="block text-[13px] font-semibold text-[#6B6A63] mb-2">
                  Tekst CV <span className="text-[#DC2626]">*</span>
                </label>
                <p className="text-[12px] text-[#9C9B93] mb-2">
                  Skopiuj i wklej pełny tekst CV (Ctrl+A → Ctrl+C z dokumentu Word/PDF).
                </p>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Jan Kowalski&#10;jan.kowalski@email.com | +48 123 456 789&#10;&#10;DOŚWIADCZENIE ZAWODOWE&#10;Senior Frontend Developer — Firma XYZ (2021–obecnie)&#10;— Wdrożyłem nową architekturę komponentów w React, skracając czas ładowania o 40%&#10;..."
                  rows={14}
                  className="w-full border border-[#ECEAE3] rounded-2xl px-5 py-4 text-[14px] bg-white outline-none focus:border-[#9C9B93] transition-colors resize-none font-mono leading-relaxed"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] text-[#9C9B93]">{cvText.length} znaków</span>
                </div>
              </div>

              {/* Job description textarea */}
              <div>
                <label className="block text-[13px] font-semibold text-[#6B6A63] mb-2">
                  Ogłoszenie pracy{" "}
                  <span className="text-[11px] font-normal text-[#9C9B93]">
                    (opcjonalnie — sprawdza dopasowanie słów kluczowych)
                  </span>
                </label>
                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Wklej tutaj treść ogłoszenia pracy, na które aplikujesz..."
                  rows={7}
                  className="w-full border border-[#ECEAE3] rounded-2xl px-5 py-4 text-[14px] bg-white outline-none focus:border-[#9C9B93] transition-colors resize-none leading-relaxed"
                />
              </div>

              {error && (
                <div className="text-red-600 text-[13px] font-medium">{error}</div>
              )}

              <button
                onClick={scan}
                disabled={scanning}
                className="w-full py-4 rounded-2xl bg-black text-white font-bold text-[15px] disabled:opacity-60 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
              >
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analizuję...
                  </>
                ) : (
                  "Skanuj CV →"
                )}
              </button>

              {/* Info box */}
              <div className="bg-[#F5F4EF] border border-[#ECEAE3] rounded-2xl px-5 py-4 text-[13px] text-[#57564F] leading-relaxed">
                <strong className="text-[#0A0A0A]">Jak działa skaner?</strong>
                <br />
                Algorytm sprawdza 5 kategorii: dopasowanie słów kluczowych do oferty, strukturę CV,
                kompatybilność z systemami ATS, obecność mierzalnych osiągnięć i użycie słów akcji.
                Całość liczy się lokalnie w przeglądarce — tekst Twojego CV nigdzie nie jest wysyłany.
              </div>
            </div>
          ) : (
            /* ─── Results ────────────────────────────────────────────── */
            <div className="flex flex-col gap-6">
              {/* Score overview */}
              <div className="bg-white border border-[#ECEAE3] rounded-3xl p-7 flex flex-col items-center gap-2">
                <ScoreRing score={result.totalScore} grade={result.grade} />
              </div>

              {/* Category breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Keywords */}
                <SectionCard
                  title={result.sections.keywords.hasJobDesc ? "Dopasowanie do oferty" : "Słowa kluczowe"}
                  score={result.sections.keywords.score}
                  max={result.sections.keywords.max}
                >
                  {result.sections.keywords.hasJobDesc ? (
                    <div className="flex flex-col gap-2">
                      {result.sections.keywords.matched.length > 0 && (
                        <div>
                          <p className="text-[11px] text-[#9C9B93] font-medium mb-1.5">
                            Znalezione ({result.sections.keywords.matched.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.sections.keywords.matched.map((k) => (
                              <Tag key={k} label={k} variant="green" />
                            ))}
                          </div>
                        </div>
                      )}
                      {result.sections.keywords.missing.length > 0 && (
                        <div>
                          <p className="text-[11px] text-[#9C9B93] font-medium mb-1.5">
                            Brakujące ({result.sections.keywords.missing.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.sections.keywords.missing.map((k) => (
                              <Tag key={k} label={k} variant="red" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#9C9B93]">
                      Wklej ogłoszenie pracy, żeby sprawdzić dopasowanie słów kluczowych.
                    </p>
                  )}
                </SectionCard>

                {/* Structure */}
                <SectionCard
                  title="Struktura CV"
                  score={result.sections.structure.score}
                  max={result.sections.structure.max}
                >
                  {result.sections.structure.foundSections.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[11px] text-[#9C9B93] font-medium mb-1.5">Znalezione sekcje</p>
                      <div className="flex flex-col gap-1">
                        {result.sections.structure.foundSections.map((s) => (
                          <div key={s} className="flex items-center gap-1.5 text-[12px] text-[#166534]">
                            <span className="text-[10px]">✓</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.sections.structure.missingSections.length > 0 && (
                    <div>
                      <p className="text-[11px] text-[#9C9B93] font-medium mb-1.5">Brakujące sekcje</p>
                      <div className="flex flex-col gap-1">
                        {result.sections.structure.missingSections.map((s) => (
                          <div key={s} className="flex items-center gap-1.5 text-[12px] text-[#991B1B]">
                            <span className="text-[10px]">✗</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* ATS */}
                <SectionCard
                  title="Kompatybilność ATS"
                  score={result.sections.ats.score}
                  max={result.sections.ats.max}
                >
                  {result.sections.ats.issues.length === 0 ? (
                    <p className="text-[12px] text-[#166534]">Brak problemów z formatem — świetnie!</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {result.sections.ats.issues.map((issue) => (
                        <div key={issue} className="flex items-start gap-1.5 text-[12px] text-[#991B1B]">
                          <span className="mt-0.5 shrink-0 text-[10px]">✗</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Achievements + Action verbs side by side */}
                <div className="flex flex-col gap-3">
                  <SectionCard
                    title="Mierzalne osiągnięcia"
                    score={result.sections.achievements.score}
                    max={result.sections.achievements.max}
                  >
                    <p className="text-[12px] text-[#57564F]">
                      {result.sections.achievements.count === 0
                        ? "Nie znaleziono liczb ani procentów — dodaj konkretne wyniki."
                        : `Wykryto ${result.sections.achievements.count} liczb i wartości (%, tys., mln...).`}
                    </p>
                  </SectionCard>

                  <SectionCard
                    title="Słowa akcji"
                    score={result.sections.actionVerbs.score}
                    max={result.sections.actionVerbs.max}
                  >
                    {result.sections.actionVerbs.found.length === 0 ? (
                      <p className="text-[12px] text-[#57564F]">
                        Brak słów akcji — zacznij opisy obowiązków od czasowników.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {result.sections.actionVerbs.found.map((v) => (
                          <Tag key={v} label={v} variant="neutral" />
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="bg-white border border-[#ECEAE3] rounded-2xl p-6">
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] mb-4">
                    Co poprawić
                  </h3>
                  <ol className="flex flex-col gap-3">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-[13px] text-[#57564F] leading-relaxed">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#F5F4EF] text-[#0A0A0A] text-[11px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3.5 rounded-2xl border border-[#ECEAE3] bg-white text-[#0A0A0A] font-semibold text-[14px] hover:bg-[#F5F4EF] transition-colors"
                >
                  ← Skanuj inne CV
                </button>
                <button
                  onClick={() => { setResult(null); setJobText(""); }}
                  className="flex-1 py-3.5 rounded-2xl bg-black text-white font-semibold text-[14px] hover:bg-[#1a1a1a] transition-colors"
                >
                  Dodaj ofertę pracy →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
