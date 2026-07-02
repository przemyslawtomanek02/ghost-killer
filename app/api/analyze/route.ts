import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt, FREE_LIMIT, type AnalysisResult } from "@/lib/analyze";

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1. wymagamy zalogowania
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Zaloguj się, aby analizować." },
      { status: 401 },
    );
  }

  // 2. limit freemium — liczymy analizy w tym miesiącu
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString());

  // (Później: jeśli profiles.is_pro === true, pomiń limit)
  const used = count ?? 0;
  if (used >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "Limit darmowych analiz wyczerpany.", limitReached: true },
      { status: 402 },
    );
  }

  // 3. dane wejściowe
  const { jobText, company, ext } = await req.json();
  if (!jobText || !jobText.trim()) {
    return NextResponse.json(
      { error: "Brak treści ogłoszenia." },
      { status: 400 },
    );
  }

  // 4. wywołanie Gemini — klucz tylko po stronie serwera
  const prompt = buildPrompt(jobText, company, ext);

  async function callGemini(attempt = 1): Promise<Response> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    // 503/429 = przejściowe; ponów z odczekaniem
    if ((res.status === 503 || res.status === 429) && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
      return callGemini(attempt + 1);
    }
    return res;
  }

  const geminiRes = await callGemini();

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error("GEMINI ERROR:", geminiRes.status, errText);
    return NextResponse.json(
      { error: "Model chwilowo przeciążony, spróbuj ponownie za chwilę." },
      { status: 503 },
    );
  }

  const data = await geminiRes.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let result: AnalysisResult;
  try {
    result = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json(
      { error: "Nie udało się przetworzyć wyniku." },
      { status: 502 },
    );
  }

  // 5. zapis analizy (do liczenia limitu i historii)
  const row = {
    user_id: user.id,
    verdict: result.verdict,
    score: result.score,
    company: company || null,
    job_excerpt: jobText.slice(0, 200),
    verdict_label: result.verdictLabel,
    summary: result.summary,
    criteria: result.criteria,
  };

  const { error: insertErr } = await supabase.from("analyses").insert(row);
  if (insertErr) {
    // Kolumna criteria może nie istnieć — spróbuj bez niej
    console.error("INSERT error (retrying without criteria):", insertErr.message);
    const { criteria: _, ...rowWithout } = row;
    const { error: retryErr } = await supabase.from("analyses").insert(rowWithout);
    if (retryErr) {
      console.error("INSERT retry error:", retryErr.message);
    }
  }

  return NextResponse.json({ result, usesLeft: FREE_LIMIT - (used + 1) });
}
