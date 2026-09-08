"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";
import type { Criterion } from "@/lib/analyze";
import {
  Banner,
  Button,
  Card,
  Heading,
  HStack,
  Spinner,
  StatusDot,
  Text,
  VStack,
  type BannerStatus,
  type StatusDotVariant,
} from "@astryxdesign/core";

type Analysis = {
  id: string;
  company: string | null;
  verdict: string;
  verdict_label: string | null;
  score: number | null;
  summary: string | null;
  job_excerpt: string | null;
  criteria: Criterion[] | null;
  created_at: string;
};

const verdictBannerStatus: Record<string, BannerStatus> = {
  safe: "success",
  warning: "warning",
  danger: "error",
};

const statusDotVariant: Record<string, StatusDotVariant> = {
  red: "error",
  yellow: "warning",
  green: "success",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<{ nickname?: string; email?: string }>({});
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      setUser({
        nickname: data.user.user_metadata?.nickname,
        email: data.user.email,
      });

      const { data: row } = await supabase
        .from("analyses")
        .select("id, company, verdict, verdict_label, score, summary, job_excerpt, criteria, created_at")
        .eq("id", id)
        .single();

      if (!row) {
        setNotFound(true);
      } else {
        setAnalysis(row);
      }
      setLoading(false);
    });
  }, [id, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-body">
      <AppSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
          <Text type="large" weight="bold">Analiza</Text>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-5 py-10 pb-16">

            {/* Back */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-secondary)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Wróć
            </button>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            )}

            {notFound && (
              <Card padding={6} style={{ textAlign: "center" }}>
                <VStack gap={4} align="center">
                  <Text color="secondary">Nie znaleziono analizy.</Text>
                  <Button label="Wróć do historii" href="/historia" />
                </VStack>
              </Card>
            )}

            {analysis && (
              <VStack gap={4}>
                {/* Header */}
                <VStack gap={0.5}>
                  <Heading level={1}>{analysis.company || "Bez nazwy firmy"}</Heading>
                  <Text type="supporting" color="secondary" style={{ textTransform: "capitalize" }}>
                    {formatDate(analysis.created_at)}
                  </Text>
                </VStack>

                {/* Verdict card */}
                <Banner
                  status={verdictBannerStatus[analysis.verdict] ?? "warning"}
                  title={analysis.verdict_label ?? analysis.verdict}
                  description={analysis.summary ?? undefined}
                  endContent={
                    analysis.score != null ? (
                      <Text weight="bold" wordBreak="break-word">{analysis.score} / 6</Text>
                    ) : undefined
                  }
                />

                {/* Criteria */}
                {analysis.criteria && analysis.criteria.length > 0 && (
                  <Card padding={0}>
                    {analysis.criteria.map((c, i) => (
                      <HStack
                        key={i}
                        gap={3}
                        align="start"
                        className="px-5 py-4"
                        style={{
                          borderBottom:
                            i < (analysis.criteria?.length ?? 0) - 1
                              ? "1px solid var(--color-border)"
                              : "none",
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
                )}

                {/* Excerpt */}
                {analysis.job_excerpt && (
                  <Card padding={5}>
                    <VStack gap={2}>
                      <Text
                        type="supporting"
                        weight="bold"
                        color="secondary"
                        style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        Fragment ogłoszenia
                      </Text>
                      <Text type="supporting" color="secondary">{analysis.job_excerpt}…</Text>
                    </VStack>
                  </Card>
                )}

                {/* New analysis CTA */}
                <Button label="Sprawdź kolejną ofertę →" href="/app" width="100%" />
              </VStack>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
