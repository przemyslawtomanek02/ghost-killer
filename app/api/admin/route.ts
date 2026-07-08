import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user && user.email === process.env.ADMIN_EMAIL;
}

// GET /api/admin — statystyki wszystkich użytkowników
export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const admin = createAdminClient();

  const [
    { data: { users } },
    { data: profiles },
    { data: analyses },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, nickname, is_blocked, created_at"),
    admin.from("analyses").select("user_id, total_tokens, created_at"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const userStats = users.map((u) => {
    const profile = profileMap.get(u.id);
    const userAnalyses = (analyses ?? []).filter((a) => a.user_id === u.id);
    const monthAnalyses = userAnalyses.filter(
      (a) => new Date(a.created_at) >= monthStart,
    );
    const totalTokens = userAnalyses.reduce(
      (sum, a) => sum + (a.total_tokens ?? 0),
      0,
    );

    return {
      id: u.id,
      email: u.email ?? "",
      nickname: profile?.nickname ?? null,
      is_blocked: profile?.is_blocked ?? false,
      created_at: u.created_at,
      analyses_total: userAnalyses.length,
      analyses_this_month: monthAnalyses.length,
      total_tokens: totalTokens,
    };
  });

  const grandTotalTokens = (analyses ?? []).reduce(
    (sum, a) => sum + (a.total_tokens ?? 0),
    0,
  );

  return NextResponse.json({ users: userStats, grandTotalTokens });
}

// PATCH /api/admin — blokuj / odblokuj użytkownika
export async function PATCH(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const { userId, is_blocked } = await req.json();
  if (!userId || typeof is_blocked !== "boolean") {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_blocked })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
