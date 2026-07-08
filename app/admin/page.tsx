"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FREE_LIMIT } from "@/lib/analyze";

type UserStat = {
  id: string;
  email: string;
  nickname: string | null;
  is_blocked: boolean;
  created_at: string;
  analyses_total: number;
  analyses_this_month: number;
  total_tokens: number;
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStat[]>([]);
  const [grandTotalTokens, setGrandTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [blocking, setBlocking] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setUsers(data.users);
        setGrandTotalTokens(data.grandTotalTokens);
        setLoading(false);
      });
  }, []);

  async function toggleBlock(userId: string, currentlyBlocked: boolean) {
    setBlocking(userId);
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, is_blocked: !currentlyBlocked }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_blocked: !currentlyBlocked } : u,
      ),
    );
    setBlocking(null);
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <p className="text-[#57564F] font-medium">Brak dostępu.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalAnalyses = users.reduce((s, u) => s + u.analyses_total, 0);
  const totalThisMonth = users.reduce((s, u) => s + u.analyses_this_month, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[32px] font-black tracking-tight">Admin</h1>
            <p className="text-[#57564F] text-[14px] mt-0.5">Panel zarządzania Analyss</p>
          </div>
          <button
            onClick={() => router.push("/app")}
            className="text-[13px] font-medium text-[#57564F] hover:text-[#0A0A0A] transition-colors"
          >
            ← Wróć do apki
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Tokeny łącznie", value: fmt(grandTotalTokens) },
            { label: "Użytkownicy", value: users.length },
            { label: "Analizy łącznie", value: totalAnalyses },
            { label: "Analizy ten miesiąc", value: totalThisMonth },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#ECEAE3] rounded-2xl px-5 py-4">
              <div className="text-[26px] font-black tracking-tight">{s.value}</div>
              <div className="text-[12px] text-[#9C9B93] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#ECEAE3] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#ECEAE3]">
            <h2 className="font-bold text-[15px]">Użytkownicy</h2>
          </div>

          {users.length === 0 ? (
            <p className="px-5 py-8 text-[#9C9B93] text-sm">Brak użytkowników.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#ECEAE3] text-[#9C9B93] text-left">
                    <th className="px-5 py-3 font-semibold">Użytkownik</th>
                    <th className="px-5 py-3 font-semibold">Analizy (mies. / łącznie)</th>
                    <th className="px-5 py-3 font-semibold">Tokeny</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-b border-[#F2F0EA] last:border-0"
                      style={{ background: u.is_blocked ? "#FEF2F2" : undefined }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[13px]">
                          {u.nickname ?? <span className="text-[#9C9B93]">—</span>}
                        </div>
                        <div className="text-[11px] text-[#9C9B93] mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold">{u.analyses_this_month}</span>
                        <span className="text-[#9C9B93]">/{FREE_LIMIT}</span>
                        <span className="text-[#BFBDB6] mx-1.5">·</span>
                        <span className="text-[#57564F]">{u.analyses_total} łącznie</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {fmt(u.total_tokens)}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.is_blocked ? (
                          <span className="text-[12px] font-bold text-[#991B1B] bg-[#FEE2E2] px-2.5 py-1 rounded-full">
                            Zablokowany
                          </span>
                        ) : (
                          <span className="text-[12px] font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                            Aktywny
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleBlock(u.id, u.is_blocked)}
                          disabled={blocking === u.id}
                          className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            u.is_blocked
                              ? "border-[#BBF7D0] text-[#166534] hover:bg-[#F0FDF4]"
                              : "border-[#FECACA] text-[#991B1B] hover:bg-[#FEF2F2]"
                          }`}
                        >
                          {blocking === u.id ? "..." : u.is_blocked ? "Odblokuj" : "Zablokuj"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
