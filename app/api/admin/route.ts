import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function checkAdmin(): Promise<{ ok: boolean; email?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false };
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const userEmail = user.email.trim().toLowerCase();
  return { ok: adminEmail !== "" && userEmail === adminEmail, email: user.email };
}

// GET /api/admin — statystyki wszystkich użytkowników
export async function GET() {
  const auth = await checkAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Brak dostępu.", yourEmail: auth.email ?? null }, { status: 403 });
  }

  const adminDb = createAdminClient();

  const [
    { data: { users } },
    { data: profiles },
    { data: analyses },
  ] = await Promise.all([
    adminDb.auth.admin.listUsers({ perPage: 1000 }),
    adminDb.from("profiles").select("id, nickname, is_blocked, created_at"),
    adminDb.from("analyses").select("user_id, total_tokens, created_at"),
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
  const auth = await checkAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  }

  const { userId, is_blocked } = await req.json();
  if (!userId || typeof is_blocked !== "boolean") {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("profiles")
    .update({ is_blocked })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
