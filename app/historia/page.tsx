"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  ClickableCard,
  EmptyState,
  Heading,
  HStack,
  Skeleton,
  Text,
  TextInput,
  VStack,
} from "@astryxdesign/core";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";

type Analysis = {
  id: string;
  company: string | null;
  verdict: string;
  verdict_label: string | null;
  score: number | null;
  summary: string | null;
  job_excerpt: string | null;
  created_at: string;
};

const verdictBadge: Record<string, "success" | "warning" | "error"> = {
  safe: "success",
  warning: "warning",
  danger: "error",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoriaPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ nickname?: string; email?: string }>({});
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }

      setUser({
        nickname: data.user.user_metadata?.nickname,
        email: data.user.email,
      });

      const { data: rows } = await supabase
        .from("analyses")
        .select("id, company, verdict, verdict_label, score, summary, job_excerpt, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      setAnalyses(rows ?? []);
      setLoading(false);
    });
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return analyses;
    return analyses.filter((a) =>
      [a.company, a.verdict_label, a.verdict]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [analyses, query]);

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
          <Text type="large" weight="bold">Historia analiz</Text>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-5 py-10 pb-16">
            <VStack gap={1} className="mb-8">
              <Heading level={1}>Historia analiz</Heading>
              <Text type="body" color="secondary">
                Twoje ostatnie sprawdzone oferty.
              </Text>
            </VStack>

            {loading && (
              <VStack gap={3}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height={104} radius={3} />
                ))}
              </VStack>
            )}

            {!loading && analyses.length === 0 && (
              <EmptyState
                title="Nie masz jeszcze żadnych analiz."
                actions={<Button label="Sprawdź pierwszą ofertę" href="/app" />}
              />
            )}

            {!loading && analyses.length > 0 && (
              <VStack gap={4}>
                <TextInput
                  label="Szukaj w historii"
                  isLabelHidden
                  placeholder="Szukaj po firmie lub werdykcie"
                  value={query}
                  onChange={setQuery}
                  width="100%"
                />

                {filtered.length === 0 ? (
                  <EmptyState title="Brak wyników dla tego wyszukiwania." isCompact />
                ) : (
                  <VStack gap={3}>
                    {filtered.map((a) => (
                      <ClickableCard
                        key={a.id}
                        label={`Zobacz analizę: ${a.company || "Bez nazwy firmy"}`}
                        href={`/historia/${a.id}`}
                        padding={5}
                      >
                        <VStack gap={2}>
                          <HStack justify="between" align="start" gap={3}>
                            <VStack gap={0}>
                              <Text type="label">
                                {a.company || "Bez nazwy firmy"}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {formatDate(a.created_at)}
                              </Text>
                            </VStack>
                            <Badge
                              variant={verdictBadge[a.verdict] ?? "neutral"}
                              label={`${a.verdict_label || a.verdict}${
                                a.score != null ? ` · ${a.score}/6` : ""
                              }`}
                            />
                          </HStack>
                          {a.summary && <Text type="body">{a.summary}</Text>}
                          {a.job_excerpt && (
                            <Text type="supporting" color="secondary" maxLines={2}>
                              {a.job_excerpt}…
                            </Text>
                          )}
                        </VStack>
                      </ClickableCard>
                    ))}
                  </VStack>
                )}
              </VStack>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
