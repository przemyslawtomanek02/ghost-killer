import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_stats");

  if (error || !data) {
    console.error("get_public_stats error:", error?.message);
    return NextResponse.json(
      { total: 0, ghostPercent: 0, companies: 0 },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  }

  const { total, ghost, companies } = data as {
    total: number;
    ghost: number;
    companies: number;
  };

  const t = total ?? 0;
  const g = ghost ?? 0;

  return NextResponse.json(
    {
      total: t,
      ghostPercent: t > 0 ? Math.round((g / t) * 100) : 0,
      companies: companies ?? 0,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
