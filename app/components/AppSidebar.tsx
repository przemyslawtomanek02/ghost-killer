"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Analysis = {
  id: string;
  company: string | null;
  verdict: string;
  verdict_label: string | null;
  score: number | null;
  created_at: string;
};

type UserMeta = { nickname?: string; email?: string };

const verdictDot: Record<string, string> = {
  safe: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

const verdictBg: Record<string, string> = {
  safe: "#F0FDF4",
  warning: "#FFFBEB",
  danger: "#FEF2F2",
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "przed chwilą";
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  if (diff < 172800) return "wczoraj";
  return new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

interface AppSidebarProps {
  user: UserMeta;
  onNewAnalysis?: () => void;
  refreshKey?: number;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export default function AppSidebar({
  user,
  onNewAnalysis,
  refreshKey = 0,
  sidebarOpen,
  setSidebarOpen,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("analyses")
      .select("id, company, verdict, verdict_label, score, created_at")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setAnalyses(data ?? []));
  }, [refreshKey]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const isApp = pathname === "/app";
  const isHistoria = pathname === "/historia";
  const isCv = pathname === "/cv";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 flex flex-col bg-white border-r border-[#ECEAE3]
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#ECEAE3] shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[9px] text-white flex items-center justify-center font-black text-[17px]"
              style={{ background: "linear-gradient(135deg, #7C6FE8, #F27C5E)" }}
            >
              A
            </div>
            <span className="font-bold text-[19px] tracking-tight">Analyss</span>
          </Link>
        </div>

        {/* Nav + historia */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Przyciski nav */}
          <div className="px-3 pt-4 pb-2 shrink-0 flex flex-col gap-1">
            <Link
              href="/app"
              onClick={() => {
                onNewAnalysis?.();
                setSidebarOpen(false);
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[14px] transition-colors
                ${isApp
                  ? "bg-black text-white"
                  : "bg-[#F5F4EF] text-[#0A0A0A] hover:bg-[#ECEAE3]"}
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Nowa analiza
            </Link>

            <Link
              href="/historia"
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors
                ${isHistoria
                  ? "bg-[#F5F4EF] text-[#0A0A0A] font-semibold"
                  : "text-[#57564F] hover:bg-[#F5F4EF] hover:text-[#0A0A0A]"}
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="7" width="9" height="2" rx="1" fill="currentColor" />
                <rect x="2" y="11" width="6" height="2" rx="1" fill="currentColor" />
              </svg>
              Historia analiz
            </Link>

            <Link
              href="/cv"
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors
                ${isCv
                  ? "bg-[#F5F4EF] text-[#0A0A0A] font-semibold"
                  : "text-[#57564F] hover:bg-[#F5F4EF] hover:text-[#0A0A0A]"}
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Skaner CV
            </Link>
          </div>

          {/* Separator */}
          <div className="mx-3 border-t border-[#ECEAE3] shrink-0" />

          {/* Lista analiz */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {analyses.length === 0 ? (
              <p className="text-[12px] text-[#9C9B93] px-3 py-3">
                Brak analiz. Sprawdź pierwszą ofertę!
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {analyses.map((a) => (
                  <Link
                    key={a.id}
                    href={`/historia/${a.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
                    style={{ background: verdictBg[a.verdict] ?? "#F5F4EF" }}
                  >
                    {/* Verdict dot */}
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: verdictDot[a.verdict] ?? "#9C9B93" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-[#0A0A0A] truncate leading-snug">
                        {a.company || "Bez nazwy firmy"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-[#9C9B93]">
                          {a.verdict_label ?? a.verdict}
                          {a.score != null ? ` · ${a.score}/6` : ""}
                        </span>
                        <span className="text-[#BFBDB6] text-[10px]">·</span>
                        <span className="text-[11px] text-[#9C9B93]">
                          {timeAgo(a.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-[#ECEAE3] shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#ECEAE3] flex items-center justify-center text-[12px] font-bold text-[#57564F] shrink-0">
              {(user.nickname ?? user.email ?? "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold truncate">
                {user.nickname ?? "Użytkownik"}
              </div>
              <div className="text-[11px] text-[#9C9B93] truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#57564F] text-[13px] font-medium hover:bg-[#FEF2F2] hover:text-[#991B1B] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-3-3-3M13 7.5H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Wyloguj się
          </button>
        </div>
      </aside>
    </>
  );
}
