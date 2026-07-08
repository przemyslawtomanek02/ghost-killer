"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const verdictStyle: Record<string, { bg: string; border: string; text: string }> = {
  safe: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  danger: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
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
          <span className="font-bold text-[17px] tracking-tight">Historia analiz</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-5 py-10 pb-16">
            <h1 className="text-[32px] font-black tracking-tight mb-1">Historia analiz</h1>
            <p className="text-[#57564F] mb-8">Twoje ostatnie sprawdzone oferty.</p>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && analyses.length === 0 && (
              <div className="bg-white border border-[#ECEAE3] rounded-3xl p-10 text-center">
                <p className="text-[#57564F] mb-5">Nie masz jeszcze żadnych analiz.</p>
                <a
                  href="/app"
                  className="inline-block py-3 px-6 rounded-xl bg-black text-white font-bold text-[15px] hover:bg-[#1a1a1a] transition-colors"
                >
                  Sprawdź pierwszą ofertę
                </a>
              </div>
            )}

            {!loading && analyses.length > 0 && (
              <div className="flex flex-col gap-3">
                {analyses.map((a) => {
                  const vs = verdictStyle[a.verdict] ?? verdictStyle.warning;
                  return (
                    <Link key={a.id} href={`/historia/${a.id}`} className="block bg-white border border-[#ECEAE3] rounded-2xl p-5 hover:border-[#C9C7BF] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-[15px] truncate">
                            {a.company || "Bez nazwy firmy"}
                          </div>
                          <div className="text-[13px] text-[#9C9B93] mt-0.5">
                            {formatDate(a.created_at)}
                          </div>
                        </div>
                        <div
                          className="shrink-0 text-[13px] font-bold rounded-full px-3 py-1"
                          style={{ background: vs.bg, border: `1px solid ${vs.border}`, color: vs.text }}
                        >
                          {a.verdict_label || a.verdict}{a.score != null ? ` · ${a.score}/6` : ""}
                        </div>
                      </div>
                      {a.summary && (
                        <p className="text-[13.5px] text-[#57564F] leading-snug mb-2">{a.summary}</p>
                      )}
                      {a.job_excerpt && (
                        <p className="text-[12.5px] text-[#9C9B93] leading-snug line-clamp-2">
                          {a.job_excerpt}…
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
