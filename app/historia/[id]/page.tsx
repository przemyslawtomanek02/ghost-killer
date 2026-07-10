"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AppSidebar from "@/app/components/AppSidebar";
import type { Criterion } from "@/lib/analyze";

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

const verdictColor: Record<string, { bg: string; border: string; text: string }> = {
  safe: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  danger: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
};

const statusColor: Record<string, string> = {
  red: "#DC2626",
  yellow: "#D97706",
  green: "#16A34A",
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

  const vc = analysis ? (verdictColor[analysis.verdict] ?? verdictColor.warning) : null;

  return (
    <div
      className="flex h-screen bg-[#FAFAF7] text-[#0A0A0A] overflow-hidden"
    >
      <AppSidebar
        user={user}
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
          <span className="font-bold text-[17px] tracking-tight">Analiza</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-5 py-10 pb-16">

            {/* Back */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] text-[#6B6A63] font-medium mb-6 hover:text-[#0A0A0A] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Wróć
            </button>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {notFound && (
              <div className="bg-white border border-[#ECEAE3] rounded-3xl p-10 text-center">
                <p className="text-[#57564F] mb-5">Nie znaleziono analizy.</p>
                <Link href="/historia" className="inline-block py-3 px-6 rounded-xl bg-black text-white font-bold text-[15px]">
                  Wróć do historii
                </Link>
              </div>
            )}

            {analysis && vc && (
              <div>
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-[28px] font-black tracking-tight leading-tight">
                    {analysis.company || "Bez nazwy firmy"}
                  </h1>
                  <p className="text-[13px] text-[#9C9B93] mt-1 capitalize">
                    {formatDate(analysis.created_at)}
                  </p>
                </div>

                {/* Verdict card */}
                <div
                  className="rounded-3xl p-6 mb-4"
                  style={{ background: vc.bg, border: `1px solid ${vc.border}` }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-2xl font-black tracking-tight" style={{ color: vc.text }}>
                      {analysis.verdict_label ?? analysis.verdict}
                    </div>
                    {analysis.score != null && (
                      <div className="text-sm font-bold whitespace-nowrap" style={{ color: vc.text }}>
                        {analysis.score} / 6 red flags
                      </div>
                    )}
                  </div>
                  {analysis.summary && (
                    <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: vc.text }}>
                      {analysis.summary}
                    </p>
                  )}
                </div>

                {/* Criteria */}
                {analysis.criteria && analysis.criteria.length > 0 && (
                  <div className="bg-white border border-[#ECEAE3] rounded-3xl overflow-hidden mb-5">
                    {analysis.criteria.map((c, i) => (
                      <div
                        key={i}
                        className="flex gap-3 px-5 py-4"
                        style={{
                          borderBottom:
                            i < (analysis.criteria?.length ?? 0) - 1
                              ? "1px solid #F2F0EA"
                              : "none",
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: statusColor[c.status] ?? "#9C9B93" }}
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
                )}

                {/* Excerpt */}
                {analysis.job_excerpt && (
                  <div className="bg-white border border-[#ECEAE3] rounded-2xl px-5 py-4">
                    <div className="text-[12px] font-bold text-[#9C9B93] uppercase tracking-wider mb-2">
                      Fragment ogłoszenia
                    </div>
                    <p className="text-[13.5px] text-[#57564F] leading-relaxed">
                      {analysis.job_excerpt}…
                    </p>
                  </div>
                )}

                {/* New analysis CTA */}
                <div className="mt-6">
                  <a
                    href="/app"
                    className="block w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] text-center hover:bg-[#1a1a1a] transition-colors"
                  >
                    Sprawdź kolejną ofertę →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
