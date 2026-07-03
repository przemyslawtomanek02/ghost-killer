import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/analyze";

// In-memory rate limiting: IP → { count, resetAt }
// Prosta implementacja — bez Redis, reset co 24h
const ipLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipLimits.get(ip);
  if (!entry || entry.resetAt < now) {
    ipLimits.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 1) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error:
          "Wykorzystałeś bezpłatną analizę demo. Zarejestruj się, aby otrzymać 3 analizy miesięcznie.",
        limitReached: true,
      },
      { status: 429 },
    );
  }

  let body: { jobText?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const jobText = typeof body.jobText === "string" ? body.jobText.trim() : "";

  if (jobText.length < 80) {
    return NextResponse.json(
      { error: "Ogłoszenie jest za krótkie (min. 80 znaków)." },
      { status: 400 },
    );
  }
  if (jobText.length > 8000) {
    return NextResponse.json(
      { error: "Ogłoszenie jest za długie (max 8000 znaków)." },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(jobText);

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
    if ((res.status === 503 || res.status === 429) && attempt < 3) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
      return callGemini(attempt + 1);
    }
    return res;
  }

  const geminiRes = await callGemini();

  if (!geminiRes.ok) {
    console.error("GEMINI DEMO ERROR:", geminiRes.status);
    return NextResponse.json(
      { error: "Model chwilowo przeciążony, spróbuj za chwilę." },
      { status: 503 },
    );
  }

  const data = await geminiRes.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: {
    verdict: string;
    score: number;
    verdictLabel: string;
    summary: string;
  };
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json(
      { error: "Nie udało się przetworzyć wyniku." },
      { status: 502 },
    );
  }

  // Zwracamy tylko podstawowy werdykt — bez criteria, bez zapisu
  return NextResponse.json({
    verdict: parsed.verdict,
    score: parsed.score,
    verdictLabel: parsed.verdictLabel,
    summary: parsed.summary,
  });
}
