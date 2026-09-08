"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";
import { scanCv, type CvScanResult } from "@/lib/cv-scan";
import {
  Badge,
  Banner,
  Button,
  Card,
  Heading,
  HStack,
  ProgressBar,
  Spinner,
  StatusDot,
  Text,
  TextArea,
  VStack,
  type BadgeVariant,
  type ProgressBarVariant,
} from "@astryxdesign/core";

type UserMeta = { nickname?: string; email?: string };

const gradeRingColor: Record<string, string> = {
  A: "var(--color-text-green)",
  B: "var(--color-text-blue)",
  C: "var(--color-text-yellow)",
  D: "var(--color-text-orange)",
  F: "var(--color-text-red)",
};

const gradeBadgeVariant: Record<string, BadgeVariant> = {
  A: "success",
  B: "blue",
  C: "warning",
  D: "orange",
  F: "error",
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
  const ring = gradeRingColor[grade] ?? gradeRingColor["C"];
  const r = 52;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;

  return (
    <VStack gap={3} align="center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={ring} strokeWidth="10"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight" style={{ color: "var(--color-text-primary)" }}>{score}</span>
          <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>/ 100</span>
        </div>
      </div>
      <Badge variant={gradeBadgeVariant[grade] ?? "warning"} label={`${grade} — ${gradeLabel[grade]}`} />
    </VStack>
  );
}

function SectionCard({
  title, score, max, children,
}: { title: string; score: number; max: number; children?: React.ReactNode }) {
  const pct = Math.round((score / max) * 100);
  const variant: ProgressBarVariant = pct >= 80 ? "success" : pct >= 55 ? "warning" : "error";

  return (
    <Card padding={5}>
      <VStack gap={3}>
        <ProgressBar
          label={title}
          value={score}
          max={max}
          variant={variant}
          hasValueLabel
          formatValueLabel={(v, m) => `${v} / ${m}`}
        />
        {children}
      </VStack>
    </Card>
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
  const dotVariant = status === "ok" ? "success" : status === "warn" ? "warning" : "neutral";

  return (
    <Card padding={5}>
      <VStack gap={3}>
        <HStack gap={2} align="center">
          <StatusDot variant={dotVariant} label={status} />
          <Text type="label" weight="bold">{title}</Text>
        </HStack>
        {ok && status === "ok" && !children ? (
          <Text type="supporting" style={{ color: "var(--color-success)" }}>{ok}</Text>
        ) : (
          children
        )}
        {ok && status === "ok" && children}
      </VStack>
    </Card>
  );
}

function Tag({ label, variant }: { label: string; variant: "green" | "red" | "neutral" }) {
  const map: Record<string, BadgeVariant> = { green: "success", red: "error", neutral: "neutral" };
  return <Badge variant={map[variant]} label={label} />;
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
      <div className="min-h-screen bg-body flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-body">
      <AppSidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {/* Mobile topbar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-10 bg-body"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--color-text-primary)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Text type="large" weight="bold">Skaner CV</Text>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
          {/* Header */}
          <VStack gap={1} className="mb-8">
            <Heading level={1}>Skaner CV</Heading>
            <Text color="secondary">
              Sprawdź, jak Twoje CV wypadnie w systemie ATS. Wgraj PDF lub wklej tekst i opcjonalnie
              dodaj ogłoszenie pracy, żeby zobaczyć dopasowanie słów kluczowych.
            </Text>
          </VStack>

          {!result ? (
            /* ─── Input form ─────────────────────────────────────────── */
            <VStack gap={5}>

              {/* PDF drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-2 px-6 py-7 border-2 border-dashed rounded-2xl cursor-pointer transition-colors select-none"
                style={{
                  borderColor: dragOver ? "var(--color-accent)" : "var(--color-border)",
                  background: dragOver ? "var(--color-accent-muted)" : "var(--color-background-card)",
                }}
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
                    <Spinner size="md" />
                    <Text type="supporting" weight="medium" color="secondary">Czytam PDF...</Text>
                  </>
                ) : cvText.length > 0 ? (
                  <>
                    <StatusDot variant="success" label="wczytano" />
                    <Text type="supporting" weight="medium" style={{ color: "var(--color-success)" }}>
                      Tekst wczytany ({cvText.length} znaków) — możesz wgrać inny PDF
                    </Text>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2v6h6M12 12v6M9 15l3-3 3 3" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <Text type="supporting" weight="medium" color="secondary">
                      Przeciągnij PDF tutaj lub <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>kliknij, żeby wybrać</span>
                    </Text>
                    <Text type="supporting" color="secondary">PDF, max 10 MB</Text>
                  </>
                )}
              </div>

              {pdfError && (
                <Text type="supporting" style={{ color: "var(--color-error)" }}>{pdfError}</Text>
              )}

              {/* CV textarea */}
              <TextArea
                label="Tekst CV (lub wklej ręcznie po wgraniu PDF)"
                value={cvText}
                onChange={setCvText}
                placeholder={"Jan Kowalski\njan.kowalski@email.com | +48 123 456 789\n\nDOŚWIADCZENIE ZAWODOWE\nSenior Frontend Developer — Firma XYZ (2021–obecnie)\n— Wdrożyłem nową architekturę komponentów w React, skracając czas ładowania o 40%\n..."}
                rows={12}
                description={`${cvText.length} znaków`}
              />

              {/* Job textarea */}
              <TextArea
                label="Ogłoszenie pracy (opcjonalnie — sprawdza dopasowanie słów kluczowych)"
                value={jobText}
                onChange={setJobText}
                placeholder="Wklej tutaj treść ogłoszenia pracy, na które aplikujesz..."
                rows={6}
              />

              {error && (
                <Text type="supporting" style={{ color: "var(--color-error)" }}>{error}</Text>
              )}

              <Button
                label={scanning ? "Analizuję..." : "Skanuj CV →"}
                onClick={scan}
                isDisabled={scanning || pdfLoading}
                isLoading={scanning}
                size="lg"
                width="100%"
              />

              <Banner
                status="info"
                title="Prywatność"
                description="Cała analiza odbywa się lokalnie w przeglądarce — treść CV nigdzie nie jest wysyłana."
              />
            </VStack>
          ) : (
            /* ─── Results ────────────────────────────────────────────── */
            <VStack gap={6}>
              {/* Score overview */}
              <Card padding={6}>
                <VStack align="center">
                  <ScoreRing score={result.totalScore} grade={result.grade} />
                </VStack>
              </Card>

              {/* RODO badge */}
              <Banner
                status={result.sections.rodo.present ? "success" : "warning"}
                title={`Klauzula RODO: ${result.sections.rodo.present ? "znaleziona" : "brak"}`}
                description={
                  result.sections.rodo.present && result.sections.rodo.clause
                    ? `„${result.sections.rodo.clause}…"`
                    : !result.sections.rodo.present
                    ? 'Wiele firm wymaga klauzuli zgody na przetwarzanie danych osobowych. Dodaj ją na końcu CV: „Wyrażam zgodę na przetwarzanie moich danych osobowych dla celów rekrutacji zgodnie z art. 6 ust. 1 lit. a RODO."'
                    : undefined
                }
              />

              {/* ── Scored categories ────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Keywords */}
                <SectionCard
                  title={result.sections.keywords.hasJobDesc ? "Dopasowanie do oferty" : "Słowa kluczowe"}
                  score={result.sections.keywords.score}
                  max={result.sections.keywords.max}
                >
                  {result.sections.keywords.hasJobDesc ? (
                    <VStack gap={2}>
                      {result.sections.keywords.matched.length > 0 && (
                        <VStack gap={1}>
                          <Text type="supporting" weight="medium" color="secondary">
                            Znalezione ({result.sections.keywords.matched.length})
                          </Text>
                          <div className="flex flex-wrap gap-1">
                            {result.sections.keywords.matched.map((k) => (
                              <Tag key={k} label={k} variant="green" />
                            ))}
                          </div>
                        </VStack>
                      )}
                      {result.sections.keywords.missing.length > 0 && (
                        <VStack gap={1}>
                          <Text type="supporting" weight="medium" color="secondary">
                            Brakujące ({result.sections.keywords.missing.length})
                          </Text>
                          <div className="flex flex-wrap gap-1">
                            {result.sections.keywords.missing.map((k) => (
                              <Tag key={k} label={k} variant="red" />
                            ))}
                          </div>
                        </VStack>
                      )}
                    </VStack>
                  ) : (
                    <Text type="supporting" color="secondary">
                      Wklej ogłoszenie pracy, żeby sprawdzić dopasowanie słów kluczowych.
                    </Text>
                  )}
                </SectionCard>

                {/* Structure */}
                <SectionCard title="Struktura CV" score={result.sections.structure.score} max={result.sections.structure.max}>
                  {result.sections.structure.foundSections.length > 0 && (
                    <VStack gap={1}>
                      <Text type="supporting" weight="medium" color="secondary">Znalezione sekcje</Text>
                      <VStack gap={0.5}>
                        {result.sections.structure.foundSections.map((s) => (
                          <HStack key={s} gap={1.5} align="center">
                            <StatusDot variant="success" label="ok" />
                            <Text type="supporting" style={{ color: "var(--color-success)" }}>{s}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  )}
                  {result.sections.structure.missingSections.length > 0 && (
                    <VStack gap={1}>
                      <Text type="supporting" weight="medium" color="secondary">Brakujące sekcje</Text>
                      <VStack gap={0.5}>
                        {result.sections.structure.missingSections.map((s) => (
                          <HStack key={s} gap={1.5} align="center">
                            <StatusDot variant="error" label="brak" />
                            <Text type="supporting" style={{ color: "var(--color-error)" }}>{s}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  )}
                </SectionCard>

                {/* ATS */}
                <SectionCard title="Kompatybilność ATS" score={result.sections.ats.score} max={result.sections.ats.max}>
                  {result.sections.ats.issues.length === 0 ? (
                    <Text type="supporting" style={{ color: "var(--color-success)" }}>Brak problemów z formatem — świetnie!</Text>
                  ) : (
                    <VStack gap={1.5}>
                      {result.sections.ats.issues.map((issue) => (
                        <HStack key={issue} gap={1.5} align="start">
                          <div className="pt-0.5"><StatusDot variant="error" label="problem" /></div>
                          <Text type="supporting" style={{ color: "var(--color-error)" }}>{issue}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </SectionCard>

                <VStack gap={3}>
                  <SectionCard title="Mierzalne osiągnięcia" score={result.sections.achievements.score} max={result.sections.achievements.max}>
                    <Text type="supporting" color="secondary">
                      {result.sections.achievements.count === 0
                        ? "Nie znaleziono liczb ani procentów — dodaj konkretne wyniki."
                        : `Wykryto ${result.sections.achievements.count} wartości liczbowych (%, tys., mln...).`}
                    </Text>
                  </SectionCard>
                  <SectionCard title="Słowa akcji" score={result.sections.actionVerbs.score} max={result.sections.actionVerbs.max}>
                    {result.sections.actionVerbs.found.length === 0 ? (
                      <Text type="supporting" color="secondary">Brak słów akcji — zacznij opisy obowiązków od czasowników.</Text>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {result.sections.actionVerbs.found.map((v) => (
                          <Tag key={v} label={v} variant="neutral" />
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </VStack>
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
                    <VStack gap={2}>
                      <Text type="supporting" style={{ color: "var(--color-warning)" }}>
                        Rekruterzy i ATS negatywnie oceniają te frazy. Zastąp je konkretnymi osiągnięciami.
                      </Text>
                      <div className="flex flex-wrap gap-1">
                        {result.sections.buzzwords.found.map((b) => (
                          <Tag key={b} label={b} variant="red" />
                        ))}
                      </div>
                    </VStack>
                  )}
                </InfoCard>

                {/* Online presence */}
                <InfoCard
                  title="Obecność online"
                  status={result.sections.onlinePresence.linkedin ? "ok" : "warn"}
                >
                  <VStack gap={1.5}>
                    {[
                      { label: "LinkedIn", ok: result.sections.onlinePresence.linkedin, tip: "Rekruterzy zawsze sprawdzają profil" },
                      { label: "GitHub / Portfolio", ok: result.sections.onlinePresence.github || result.sections.onlinePresence.portfolio, tip: "Ważne szczególnie w IT i designie" },
                      { label: "Telefon z kierunkowym (+48)", ok: result.sections.onlinePresence.phoneInternational, tip: "Wymagane przy rekrutacjach zagranicznych" },
                    ].map(({ label, ok, tip }) => (
                      <HStack key={label} gap={2} align="start">
                        <div className="pt-0.5"><StatusDot variant={ok ? "success" : "error"} label={ok ? "ok" : "brak"} /></div>
                        <Text type="supporting">
                          {label}
                          {!ok && <Text type="supporting" color="secondary" display="inline"> — {tip}</Text>}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </InfoCard>

                {/* Languages */}
                <InfoCard
                  title="Języki obce"
                  status={!result.sections.languages.hasSection ? "warn" : result.sections.languages.hasStandardLevels ? "ok" : "warn"}
                >
                  {!result.sections.languages.hasSection ? (
                    <Text type="supporting" style={{ color: "var(--color-warning)" }}>
                      Brak sekcji językowej — dodaj ją z poziomami wg skali CEFR (A1–C2).
                    </Text>
                  ) : (
                    <VStack gap={1.5}>
                      {result.sections.languages.detected.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.sections.languages.detected.map((l) => (
                            <Tag key={l} label={l} variant="neutral" />
                          ))}
                        </div>
                      )}
                      {!result.sections.languages.hasStandardLevels && (
                        <Text type="supporting" style={{ color: "var(--color-warning)" }}>
                          Podaj poziom wg skali CEFR (A1–C2) lub opisowo (native, fluent, communicative).
                        </Text>
                      )}
                      {result.sections.languages.hasStandardLevels && (
                        <Text type="supporting" style={{ color: "var(--color-success)" }}>Poziomy języków podane poprawnie.</Text>
                      )}
                    </VStack>
                  )}
                </InfoCard>

                {/* Certifications */}
                <InfoCard
                  title="Certyfikaty"
                  status={result.sections.certifications.found.length > 0 ? "ok" : "neutral"}
                >
                  {result.sections.certifications.found.length === 0 ? (
                    <Text type="supporting" color="secondary">
                      Nie wykryto znanych certyfikatów (AWS, Azure, PMP, Scrum, ISTQB...). Jeśli je posiadasz — dodaj do CV.
                    </Text>
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
                  <Text type="supporting" color="secondary">
                    Średnia długość zdania: <Text type="supporting" weight="bold" display="inline">{result.sections.readability.avgWordsPerSentence} słów</Text>
                    {result.sections.readability.verdict === "good" && " — świetnie, krótkie zdania są łatwiejsze do parsowania."}
                    {result.sections.readability.verdict === "ok" && " — w porządku, choć warto skracać złożone punkty."}
                    {result.sections.readability.verdict === "complex" && " — za długie. Skróć zdania do maks. 18–20 słów."}
                  </Text>
                </InfoCard>

                {/* Career gaps */}
                <InfoCard
                  title="Luki w historii zatrudnienia"
                  status={result.sections.careerGaps.detected ? "warn" : "ok"}
                  ok={!result.sections.careerGaps.detected ? "Brak wykrytych luk — historia ciągła." : undefined}
                >
                  {result.sections.careerGaps.detected && (
                    <VStack gap={1.5}>
                      <Text type="supporting" style={{ color: "var(--color-warning)" }}>
                        Wykryto potencjalne luki w zatrudnieniu. Warto je wyjaśnić (np. freelance, nauka, opieka).
                      </Text>
                      {result.sections.careerGaps.gaps.map((g) => (
                        <HStack key={g} gap={1.5} align="center">
                          <StatusDot variant="warning" label="luka" />
                          <Text type="supporting" style={{ color: "var(--color-warning)" }}>{g}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </InfoCard>
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <Card padding={6}>
                  <VStack gap={4}>
                    <Heading level={3}>Co poprawić</Heading>
                    <VStack gap={3}>
                      {result.suggestions.map((s, i) => (
                        <HStack key={i} gap={3} align="start">
                          <div
                            className="shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5"
                            style={{ background: "var(--color-background-muted)", color: "var(--color-text-primary)" }}
                          >
                            {i + 1}
                          </div>
                          <Text type="supporting" color="secondary">{s}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Card>
              )}

              {/* Actions */}
              <HStack gap={3}>
                <Button label="← Skanuj inne CV" onClick={reset} variant="secondary" width="100%" />
                <Button
                  label="Dodaj ofertę pracy →"
                  onClick={() => { setResult(null); setJobText(""); }}
                  width="100%"
                />
              </HStack>
            </VStack>
          )}
        </div>
      </main>
    </div>
  );
}
