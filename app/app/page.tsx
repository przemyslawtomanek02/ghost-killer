"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";
import devConfig from "@/lib/devConfig";
import type { AnalysisResult } from "@/lib/analyze";
import { FREE_LIMIT } from "@/lib/analyze";
import {
  Badge,
  Banner,
  Button,
  Card,
  ClickableCard,
  Heading,
  HStack,
  Link as AstryxLink,
  Selector,
  Spinner,
  StatusDot,
  Text,
  TextArea,
  TextInput,
  VStack,
  type BannerStatus,
  type StatusDotVariant,
} from "@astryxdesign/core";

const tileIconProps = { width: 22, height: 22, viewBox: "0 0 16 16", fill: "none" as const };

function HistoriaTileIcon() {
  return (
    <svg {...tileIconProps}>
      <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="7" width="9" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="11" width="6" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function CvTileIcon() {
  return (
    <svg {...tileIconProps}>
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type TokenUsage = { promptTokens: number; responseTokens: number; totalTokens: number };

const statusDotVariant: Record<string, StatusDotVariant> = {
  red: "error",
  yellow: "warning",
  green: "success",
};
const verdictBannerStatus: Record<string, BannerStatus> = {
  safe: "success",
  warning: "warning",
  danger: "error",
};

const LINKEDIN_OPTIONS = [
  { value: "brak nowych pracowników od miesięcy", label: "Brak nowych" },
  { value: "firma regularnie zatrudnia", label: "Zatrudniają" },
  { value: "nie sprawdzałem", label: "Nie wiem" },
];

export default function AppPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ nickname?: string; email?: string }>({});
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [company, setCompany] = useState("");
  const [postedDaysAgo, setPostedDaysAgo] = useState("");
  const [openRoles, setOpenRoles] = useState("");
  const [linkedinActivity, setLinkedinActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [usesLeft, setUsesLeft] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setAuthed(true);
      setUser({ nickname: data.user.user_metadata?.nickname, email: data.user.email });

      // Pobierz liczbę analiz w tym miesiącu
      const since = new Date();
      since.setDate(1);
      since.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("analyses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.user.id)
        .gte("created_at", since.toISOString());
      setUsesLeft(FREE_LIMIT - (count ?? 0));
    });
  }, [router]);

  function resetAnalysis() {
    setResult(null);
    setTokenUsage(null);
    setError("");
    setJobText("");
    setJobUrl("");
    setUrlError("");
    setCompany("");
    setPostedDaysAgo("");
    setOpenRoles("");
    setLinkedinActivity("");
    setLimitReached(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function analyze() {
    if (jobText.trim().length < 80) { setError("Ogłoszenie jest za krótkie (min. 80 znaków)."); return; }
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
    if (res.status === 403) { setBlocked(true); return; }
    if (!res.ok) { setError("Nie udało się przeanalizować. Spróbuj ponownie."); return; }

    const data = await res.json();
    setResult(data.result);
    setTokenUsage(data.tokenUsage ?? null);
    setUsesLeft(data.usesLeft ?? null);
    setRefreshKey((k) => k + 1); // odśwież listę w sidebarze
    setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  async function fetchFromUrl() {
    if (!jobUrl.trim()) return;
    setFetchingUrl(true);
    setUrlError("");

    const res = await fetch("/api/fetch-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: jobUrl.trim() }),
    });

    setFetchingUrl(false);

    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setUrlError((d as { error?: string }).error ?? "Nie udało się wczytać linku.");
      return;
    }

    const data = await res.json();
    setJobText(data.text);
    if (data.company) setCompany(data.company);
    if (data.postedDaysAgo !== null && data.postedDaysAgo !== undefined) setPostedDaysAgo(String(data.postedDaysAgo));
    if (data.openRoles !== null && data.openRoles !== undefined) setOpenRoles(String(data.openRoles));
    setJobUrl("");
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
        <AppSidebar
          user={user}
          onNewAnalysis={resetAnalysis}
          refreshKey={refreshKey}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden accent-glow-bg">
          {/* Mobile topbar */}
          <div
            className="md:hidden flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--color-text-primary)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Text type="large" weight="bold">Analyss</Text>
          </div>

          {/* Content */}
          <div ref={mainRef} className="flex-1 overflow-y-auto">
            <div className="max-w-[720px] mx-auto px-5 py-10 pb-16">

              {/* Nav tiles */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <ClickableCard href="/historia" label="Przejdź do historii analiz" padding={5}>
                  <VStack gap={3}>
                    <div style={{ color: "var(--color-accent)" }}>
                      <HistoriaTileIcon />
                    </div>
                    <VStack gap={0}>
                      <Text type="label" weight="bold">Historia analiz</Text>
                      <Text type="supporting" color="secondary">Twoje poprzednie sprawdzenia</Text>
                    </VStack>
                  </VStack>
                </ClickableCard>
                <ClickableCard href="/cv" label="Przejdź do skanera CV" padding={5}>
                  <VStack gap={3}>
                    <div style={{ color: "var(--color-accent)" }}>
                      <CvTileIcon />
                    </div>
                    <VStack gap={0}>
                      <Text type="label" weight="bold">Skaner CV</Text>
                      <Text type="supporting" color="secondary">Sprawdź swoje CV pod ATS</Text>
                    </VStack>
                  </VStack>
                </ClickableCard>
              </div>

              {blocked && (
          <div className="mb-6">
            <Banner
              status="error"
              title="Konto zablokowane"
              description={
                <>
                  Twoje konto zostało tymczasowo zablokowane. Skontaktuj się z nami:{" "}
                  <AstryxLink href="mailto:kontakt@analyss.pl">kontakt@analyss.pl</AstryxLink>
                </>
              }
            />
          </div>
        )}

        {limitReached && (
          <Card padding={6} className="mb-6">
            <VStack gap={3} align="center">
              <Heading level={2}>Limit darmowych analiz</Heading>
              <Text color="secondary" justify="center">
                Wykorzystałeś 3 darmowe analizy w tym miesiącu. Limit odnowi się 1. dnia następnego miesiąca.
              </Text>
              <Card variant="muted" width="100%">
                <VStack gap={1}>
                  <Text type="display-2" weight="bold">
                    29 zł
                    <Text type="body" color="secondary" display="inline"> /mies.</Text>
                  </Text>
                  <Text type="supporting" color="secondary">Nielimitowane analizy + historia</Text>
                </VStack>
              </Card>
              <Button
                label="Przejdź na Pro — napisz do nas"
                href="mailto:kontakt@analyss.pl?subject=Zainteresowanie%20planem%20Pro&body=Cześć%2C%20chcę%20dowiedzieć%20się%20więcej%20o%20planie%20Pro."
                width="100%"
              />
            </VStack>
          </Card>
        )}

        {result && (
          <VStack gap={4} className="mb-6">
            <Banner
              status={verdictBannerStatus[result.verdict] ?? "warning"}
              title={result.verdictLabel}
              description={result.summary}
              endContent={<Text weight="bold" wordBreak="break-word">{result.score} / 6</Text>}
            />

            <Card padding={0}>
              {result.criteria.map((c, i) => (
                <HStack
                  key={i}
                  gap={3}
                  align="start"
                  className="px-5 py-4"
                  style={{
                    borderBottom:
                      i < result.criteria.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <div className="pt-1.5">
                    <StatusDot variant={statusDotVariant[c.status] ?? "neutral"} label={c.status} />
                  </div>
                  <VStack gap={0}>
                    <Text type="label">{c.name}</Text>
                    <Text type="supporting" color="secondary">{c.reason}</Text>
                  </VStack>
                </HStack>
              ))}
            </Card>

            <Button label="Sprawdź kolejną ofertę" variant="secondary" onClick={resetAnalysis} width="100%" />

            {/* Dev: Token usage */}
            {devConfig.showTokenUsage && tokenUsage && (
              <Card
                padding={4}
                style={{
                  background: "#1e1e1e",
                  color: "#d4d4d4",
                  fontFamily: "var(--font-family-code)",
                  fontSize: "12px",
                }}
              >
                <Text
                  type="supporting"
                  weight="bold"
                  style={{ color: "#6B6A63", textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Dev — Token usage
                </Text>
                <HStack gap={6} className="mt-2">
                  <span>
                    <span style={{ color: "#9C9B93" }}>prompt </span>
                    <span style={{ color: "#4EC9B0" }}>{tokenUsage.promptTokens.toLocaleString()}</span>
                  </span>
                  <span>
                    <span style={{ color: "#9C9B93" }}>response </span>
                    <span style={{ color: "#4EC9B0" }}>{tokenUsage.responseTokens.toLocaleString()}</span>
                  </span>
                  <span>
                    <span style={{ color: "#9C9B93" }}>total </span>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{tokenUsage.totalTokens.toLocaleString()}</span>
                  </span>
                </HStack>
              </Card>
            )}
          </VStack>
        )}

        {!result && !limitReached && (
          <>
            {!loading && (
              <VStack gap={2} align="center" className="mb-8">
                <Heading level={1}>Sprawdź ofertę pracy</Heading>
                <Text color="secondary">Wklej ogłoszenie — AI oceni 6 sygnałów ghost joba.</Text>
              </VStack>
            )}

            {loading && (
              <VStack gap={3} align="center" className="mb-8 py-4">
                <Spinner size="lg" />
                <Text color="secondary" weight="medium">Analizuję ogłoszenie...</Text>
              </VStack>
            )}

            <div
              className="relative p-px overflow-hidden"
              style={{ borderRadius: "calc(var(--radius-container) + 1px)", background: "var(--color-border-emphasized)" }}
            >
              {/* Chasing light sweep around the border, same technique as the hero's textarea */}
              <motion.div
                className="absolute inset-[-60%] pointer-events-none"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, transparent 85%, rgba(255,255,255,0.95) 90%, var(--color-accent) 95%, transparent 100%)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <Card padding={6} className="relative">
              <VStack gap={3}>
                <TextInput
                  label="Nazwa firmy"
                  isLabelHidden
                  placeholder="Nazwa firmy (opcjonalnie)"
                  value={company}
                  onChange={setCompany}
                />

                <div className="grid grid-cols-3 gap-2">
                  <TextInput
                    label="Dni temu"
                    isLabelHidden
                    placeholder="Dni temu"
                    value={postedDaysAgo}
                    onChange={setPostedDaysAgo}
                  />
                  <TextInput
                    label="Ile ofert firmy"
                    isLabelHidden
                    placeholder="Ile ofert firmy"
                    value={openRoles}
                    onChange={setOpenRoles}
                  />
                  <Selector
                    label="LinkedIn"
                    isLabelHidden
                    placeholder="LinkedIn?"
                    options={LINKEDIN_OPTIONS}
                    value={linkedinActivity || undefined}
                    onChange={(v) => setLinkedinActivity(v)}
                  />
                </div>

                {/* URL input — BETA */}
                <VStack gap={1}>
                  <HStack gap={2} align="center">
                    <Text type="supporting" color="secondary">Wczytaj z linku</Text>
                    <Badge variant="info" label="BETA" />
                  </HStack>
                  <HStack gap={2} align="start">
                    <div className="flex-1">
                      <TextInput
                        label="Link do ogłoszenia"
                        isLabelHidden
                        value={jobUrl}
                        onChange={(v) => { setJobUrl(v); setUrlError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && fetchFromUrl()}
                        placeholder="https://linkedin.com/jobs/view/..."
                      />
                    </div>
                    <Button
                      label={fetchingUrl ? "Wczytuję" : "Wczytaj"}
                      onClick={fetchFromUrl}
                      isDisabled={fetchingUrl || !jobUrl.trim()}
                      isLoading={fetchingUrl}
                      variant="secondary"
                    />
                  </HStack>
                  {urlError && (
                    <Text type="supporting" style={{ color: "var(--color-error)" }}>{urlError}</Text>
                  )}
                </VStack>

                <TextArea
                  label="Treść ogłoszenia"
                  isLabelHidden
                  value={jobText}
                  onChange={setJobText}
                  placeholder="Wklej tutaj całą treść ogłoszenia o pracę..."
                  rows={7}
                />
                {jobText.trim().length > 0 && jobText.trim().length < 80 && (
                  <Text type="supporting" color="secondary">
                    {jobText.trim().length} / 80 znaków minimum
                  </Text>
                )}
                {error && <Text type="supporting" style={{ color: "var(--color-error)" }}>{error}</Text>}

                <Button
                  label={loading ? "Analizuję..." : "Sprawdź ofertę →"}
                  onClick={analyze}
                  isDisabled={loading || jobText.trim().length < 80}
                  isLoading={loading}
                  size="lg"
                  width="100%"
                />

                {usesLeft !== null && (
                  <Text type="supporting" color="secondary" justify="center">
                    {usesLeft > 0
                      ? `Pozostało ${usesLeft} z ${FREE_LIMIT} darmowych analiz w tym miesiącu`
                      : "Wykorzystano wszystkie darmowe analizy w tym miesiącu"}
                  </Text>
                )}
              </VStack>
              </Card>
            </div>
          </>
        )}

            </div>
          </div>
        </div>
      </div>
  );
}
