import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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

export default async function HistoriaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]"
      style={{ fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif" }}
    >
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-black text-white flex items-center justify-center font-black text-[17px]">
            W
          </div>
          <span className="font-bold text-[19px] tracking-tight">Wydmuszka</span>
        </Link>
        <Link
          href="/app"
          className="text-sm font-semibold border border-[#ECEAE3] bg-white rounded-full px-4 py-2"
        >
          Nowa analiza
        </Link>
      </nav>

      <main className="max-w-[760px] mx-auto px-6 pt-6 pb-20">
        <h1 className="text-[32px] font-black tracking-tight mb-1">Historia analiz</h1>
        <p className="text-[#57564F] mb-8">Twoje ostatnie sprawdzone oferty.</p>

        {!analyses || analyses.length === 0 ? (
          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-10 text-center">
            <p className="text-[#57564F] mb-5">
              Nie masz jeszcze żadnych analiz.
            </p>
            <Link
              href="/app"
              className="inline-block py-3 px-6 rounded-xl bg-black text-white font-bold text-[15px]"
            >
              Sprawdź pierwszą ofertę
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {analyses.map((a) => {
              const vs = verdictStyle[a.verdict] || verdictStyle.warning;
              return (
                <div
                  key={a.id}
                  className="bg-white border border-[#ECEAE3] rounded-2xl p-5"
                >
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
                      {a.verdict_label || a.verdict} · {a.score}/6
                    </div>
                  </div>
                  {a.summary && (
                    <p className="text-[13.5px] text-[#57564F] leading-snug mb-2">
                      {a.summary}
                    </p>
                  )}
                  {a.job_excerpt && (
                    <p className="text-[12.5px] text-[#9C9B93] leading-snug line-clamp-2">
                      {a.job_excerpt}…
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
