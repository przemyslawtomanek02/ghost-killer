"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// ─── PDF extraction ───────────────────────────────────────────────────────────

async function extractTextFromPdf(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    text += pageText + "\n";
  }

  return text.trim();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function InfoCard({
  title, status, ok, children,
}: {
  title: string;
  status: "ok" | "warn" | "neutral";
  ok?: string;
  children?: React.ReactNode;
}) {
  const styles = {
    ok: { border: "border-[#BBF7D0]", bg: "bg-[#F0FDF4]", dot: "bg-[#16A34A]" },
    warn: { border: "border-[#FDE68A]", bg: "bg-[#FFFBEB]", dot: "bg-[#D97706]" },
    neutral: { border: "border-[#ECEAE3]", bg: "bg-white", dot: "bg-[#9C9B93]" },
  }[status];

  return (
    <div className={`border ${styles.border} ${styles.bg} rounded-2xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
        <span className="text-[13px] font-semibold text-[#0A0A0A]">{title}</span>
      </div>
      {ok && status === "ok" && !children ? (
        <p className="text-[12px] text-[#166534]">{ok}</p>
      ) : (
        children
      )}
      {ok && status === "ok" && children}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CvPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserMeta>({});
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<CvScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setAuthed(true);
      setUser({ nickname: data.user.user_metadata?.nickname, email: data.user.email });
    });
  }, [router]);

  const handlePdfFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf") && !file.name.endsWith(".pdf")) {
      setPdfError("Obsługiwany jest tylko format PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfError("Plik jest za duży (max 10 MB).");
      return;
    }

    setPdfError("");
    setPdfLoading(true);
    try {
      const text = await extractTextFromPdf(file);
      if (text.length < 50) {
        setPdfError("Nie udało się odczytać tekstu z PDF. Spróbuj wkleić tekst ręcznie.");
      } else {
        setCvText(text);
      }
    } catch {
      setPdfError("Błąd odczytu PDF. Sprawdź czy plik nie jest zaszyfrowany i spróbuj ponownie.");
    } finally {
      setPdfLoading(false);
    }
  }, []);

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handlePdfFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFile(file);
  }

  function scan() {
    setError("");
    const cv = cvText.trim();
    if (cv.length < 100) {
      setError("Wklej pełny tekst CV (minimum 100 znaków).");
      return;
    }
    setScanning(true);
    setTimeout(() => {
      const r = scanCv(cv, jobText.trim() || undefined);
      setResult(r);
      setScanning(false);
      setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }, 300);
  }

  function reset() {
    setResult(null);
    setError("");
    setCvText("");
    setJobText("");
    setPdfError("");
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
      <AppSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
          <span className="font-bold text-[16px] tracking-tight text-[#0A0A0A]">Skaner CV</span>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-black tracking-tight text-[#0A0A0A] mb-1.5">
              Skaner CV
            </h1>
            <p className="text-[15px] text-[#57564F] leading-relaxed">
              Sprawdź, jak Twoje CV wypadnie w systemie ATS. Wgraj PDF lub wklej tekst i opcjonalnie
              dodaj ogłoszenie pracy, żeby zobaczyć dopasowanie słów kluczowych.
            </p>
          </div>

          {!result ? (
            /* ─── Input form ─────────────────────────────────────────── */
            <div className="flex flex-col gap-5">

              {/* PDF drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center gap-2 px-6 py-7
                  border-2 border-dashed rounded-2xl cursor-pointer transition-colors select-none
                  ${dragOver
                    ? "border-[#7C6FE8] bg-[#E9E5FE]/30"
                    : "border-[#ECEAE3] bg-white hover:border-[#9C9B93] hover:bg-[#FAFAF7]"}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={onFileInput}
                  className="hidden"
                />
                {pdfLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-[#7C6FE8] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] text-[#57564F] font-medium">Czytam PDF...</span>
                  </>
                ) : cvText.length > 0 ? (
                  <>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="10" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
                      <path d="M7 11l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13px] text-[#166534] font-medium">
                      Tekst wczytany ({cvText.length} znaków) — możesz wgrać inny PDF
                    </span>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#9C9B93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2v6h6M12 12v6M9 15l3-3 3 3" stroke="#9C9B93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13px] text-[#57564F] font-medium">
                      Przeciągnij PDF tutaj lub <span className="text-[#7C6FE8] font-semibold">kliknij, żeby wybrać</span>
                    </span>
                    <span className="text-[11px] text-[#9C9B93]">PDF, max 10 MB</span>
                  </>
                )}
              </div>

              {pdfError && (
                <p className="text-[13px] text-red-600 font-medium -mt-2">{pdfError}</p>
              )}

              {/* CV textarea */}
              <div>
                <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                  Tekst CV{" "}
                  <span className="text-[11px] font-normal text-[#9C9B93]">
                    (lub wklej ręcznie po wgraniu PDF)
                  </span>
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={"Jan Kowalski\njan.kowalski@email.com | +48 123 456 789\n\nDOŚWIADCZENIE ZAWODOWE\nSenior Frontend Developer — Firma XYZ (2021–obecnie)\n— Wdrożyłem nową architekturę komponentów w React, skracając czas ładowania o 40%\n..."}
                  rows={12}
                  className="w-full border border-[#ECEAE3] rounded-2xl px-5 py-4 text-[14px] text-[#0A0A0A] bg-white outline-none focus:border-[#9C9B93] transition-colors resize-none font-mono leading-relaxed placeholder:text-[#BFBDB6]"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px] text-[#9C9B93]">{cvText.length} znaków</span>
                </div>
              </div>

              {/* Job textarea */}
              <div>
                <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                  Ogłoszenie pracy{" "}
                  <span className="text-[11px] font-normal text-[#9C9B93]">
                    (opcjonalnie — sprawdza dopasowanie słów kluczowych)
                  </span>
                </label>
                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Wklej tutaj treść ogłoszenia pracy, na które aplikujesz..."
                  rows={6}
                  className="w-full border border-[#ECEAE3] rounded-2xl px-5 py-4 text-[14px] text-[#0A0A0A] bg-white outline-none focus:border-[#9C9B93] transition-colors resize-none leading-relaxed placeholder:text-[#BFBDB6]"
                />
              </div>

              {error && (
                <p className="text-red-600 text-[13px] font-medium">{error}</p>
              )}

              <button
                onClick={scan}
                disabled={scanning || pdfLoading}
                className="w-full py-4 rounded-2xl bg-black text-white font-bold text-[15px] disabled:opacity-60 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
              >
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analizuję...
                  </>
                ) : "Skanuj CV →"}
              </button>

              <div className="bg-[#F5F4EF] border border-[#ECEAE3] rounded-2xl px-5 py-4 text-[13px] text-[#57564F] leading-relaxed">
                <strong className="text-[#0A0A0A]">Prywatność:</strong>{" "}
                Cała analiza odbywa się lokalnie w przeglądarce — treść CV nigdzie nie jest wysyłana.
              </div>
            </div>
          ) : (
            /* ─── Results ────────────────────────────────────────────── */
            <div className="flex flex-col gap-6">
              {/* Score overview */}
              <div className="bg-white border border-[#ECEAE3] rounded-3xl p-7 flex flex-col items-center gap-2">
                <ScoreRing score={result.totalScore} grade={result.grade} />
              </div>

              {/* RODO badge */}
              <div
                className={`flex items-start gap-3 px-5 py-4 rounded-2xl border text-[13px] leading-relaxed ${
                  result.sections.rodo.present
                    ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                    : "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                }`}
              >
                <span className="text-[18px] leading-none mt-0.5">
                  {result.sections.rodo.present ? "✓" : "⚠"}
                </span>
                <div>
                  <p className="font-semibold mb-0.5">
                    Klauzula RODO: {result.sections.rodo.present ? "znaleziona" : "brak"}
                  </p>
                  {result.sections.rodo.present && result.sections.rodo.clause ? (
                    <p className="text-[12px] opacity-80 italic">&ldquo;{result.sections.rodo.clause}&hellip;&rdquo;</p>
                  ) : (
                    <p className="text-[12px] opacity-80">
                      Wiele firm wymaga klauzuli zgody na przetwarzanie danych osobowych. Dodaj ją na końcu CV:{" "}
                      <em>„Wyrażam zgodę na przetwarzanie moich danych osobowych dla celów rekrutacji zgodnie z art. 6 ust. 1 lit. a RODO."</em>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Scored categories ────────────────────────────────── */}
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
                <SectionCard title="Struktura CV" score={result.sections.structure.score} max={result.sections.structure.max}>
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
                <SectionCard title="Kompatybilność ATS" score={result.sections.ats.score} max={result.sections.ats.max}>
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

                <div className="flex flex-col gap-3">
                  <SectionCard title="Mierzalne osiągnięcia" score={result.sections.achievements.score} max={result.sections.achievements.max}>
                    <p className="text-[12px] text-[#57564F]">
                      {result.sections.achievements.count === 0
                        ? "Nie znaleziono liczb ani procentów — dodaj konkretne wyniki."
                        : `Wykryto ${result.sections.achievements.count} wartości liczbowych (%, tys., mln...).`}
                    </p>
                  </SectionCard>
                  <SectionCard title="Słowa akcji" score={result.sections.actionVerbs.score} max={result.sections.actionVerbs.max}>
                    {result.sections.actionVerbs.found.length === 0 ? (
                      <p className="text-[12px] text-[#57564F]">Brak słów akcji — zacznij opisy obowiązków od czasowników.</p>
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

              {/* ── Informational checks ─────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Buzzwords */}
                <InfoCard
                  title="Klisze i buzzwordy"
                  status={result.sections.buzzwords.found.length === 0 ? "ok" : "warn"}
                  ok={result.sections.buzzwords.found.length === 0 ? "Brak okrągłych sformułowań — dobrze!" : undefined}
                >
                  {result.sections.buzzwords.found.length > 0 && (
                    <>
                      <p className="text-[12px] text-[#92400E] mb-2">
                        Rekruterzy i ATS negatywnie oceniają te frazy. Zastąp je konkretnymi osiągnięciami.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.sections.buzzwords.found.map((b) => (
                          <Tag key={b} label={b} variant="red" />
                        ))}
                      </div>
                    </>
                  )}
                </InfoCard>

                {/* Online presence */}
                <InfoCard
                  title="Obecność online"
                  status={result.sections.onlinePresence.linkedin ? "ok" : "warn"}
                >
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "LinkedIn", ok: result.sections.onlinePresence.linkedin, tip: "Rekruterzy zawsze sprawdzają profil" },
                      { label: "GitHub / Portfolio", ok: result.sections.onlinePresence.github || result.sections.onlinePresence.portfolio, tip: "Ważne szczególnie w IT i designie" },
                      { label: "Telefon z kierunkowym (+48)", ok: result.sections.onlinePresence.phoneInternational, tip: "Wymagane przy rekrutacjach zagranicznych" },
                    ].map(({ label, ok, tip }) => (
                      <div key={label} className="flex items-start gap-2">
                        <span className={`text-[12px] mt-0.5 shrink-0 ${ok ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {ok ? "✓" : "✗"}
                        </span>
                        <div>
                          <span className="text-[12px] font-medium text-[#0A0A0A]">{label}</span>
                          {!ok && <span className="text-[11px] text-[#9C9B93] ml-1">— {tip}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </InfoCard>

                {/* Languages */}
                <InfoCard
                  title="Języki obce"
                  status={!result.sections.languages.hasSection ? "warn" : result.sections.languages.hasStandardLevels ? "ok" : "warn"}
                >
                  {!result.sections.languages.hasSection ? (
                    <p className="text-[12px] text-[#92400E]">
                      Brak sekcji językowej — dodaj ją z poziomami wg skali CEFR (A1–C2).
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {result.sections.languages.detected.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {result.sections.languages.detected.map((l) => (
                            <Tag key={l} label={l} variant="neutral" />
                          ))}
                        </div>
                      )}
                      {!result.sections.languages.hasStandardLevels && (
                        <p className="text-[12px] text-[#92400E]">
                          Podaj poziom wg skali CEFR (A1–C2) lub opisowo (native, fluent, communicative).
                        </p>
                      )}
                      {result.sections.languages.hasStandardLevels && (
                        <p className="text-[12px] text-[#166534]">Poziomy języków podane poprawnie.</p>
                      )}
                    </div>
                  )}
                </InfoCard>

                {/* Certifications */}
                <InfoCard
                  title="Certyfikaty"
                  status={result.sections.certifications.found.length > 0 ? "ok" : "neutral"}
                >
                  {result.sections.certifications.found.length === 0 ? (
                    <p className="text-[12px] text-[#9C9B93]">
                      Nie wykryto znanych certyfikatów (AWS, Azure, PMP, Scrum, ISTQB...). Jeśli je posiadasz — dodaj do CV.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {result.sections.certifications.found.map((c) => (
                        <Tag key={c} label={c} variant="green" />
                      ))}
                    </div>
                  )}
                </InfoCard>

                {/* Readability */}
                <InfoCard
                  title="Czytelność zdań"
                  status={result.sections.readability.verdict === "good" ? "ok" : result.sections.readability.verdict === "ok" ? "neutral" : "warn"}
                >
                  <p className="text-[12px] text-[#57564F]">
                    Średnia długość zdania: <strong className="text-[#0A0A0A]">{result.sections.readability.avgWordsPerSentence} słów</strong>
                    {result.sections.readability.verdict === "good" && " — świetnie, krótkie zdania są łatwiejsze do parsowania."}
                    {result.sections.readability.verdict === "ok" && " — w porządku, choć warto skracać złożone punkty."}
                    {result.sections.readability.verdict === "complex" && " — za długie. Skróć zdania do maks. 18–20 słów."}
                  </p>
                </InfoCard>

                {/* Career gaps */}
                <InfoCard
                  title="Luki w historii zatrudnienia"
                  status={result.sections.careerGaps.detected ? "warn" : "ok"}
                  ok={!result.sections.careerGaps.detected ? "Brak wykrytych luk — historia ciągła." : undefined}
                >
                  {result.sections.careerGaps.detected && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[12px] text-[#92400E] mb-1">
                        Wykryto potencjalne luki w zatrudnieniu. Warto je wyjaśnić (np. freelance, nauka, opieka).
                      </p>
                      {result.sections.careerGaps.gaps.map((g) => (
                        <div key={g} className="flex items-center gap-1.5 text-[12px] text-[#92400E]">
                          <span className="text-[10px]">⚠</span> {g}
                        </div>
                      ))}
                    </div>
                  )}
                </InfoCard>
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="bg-white border border-[#ECEAE3] rounded-2xl p-6">
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] mb-4">Co poprawić</h3>
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
