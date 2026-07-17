import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Markery sekcji "polecane" na popularnych polskich portalach z ofertami pracy.
// Tekst po pierwszym trafieniu tych fraz to już śmieci — nie ma sensu go wysyłać do Gemini.
const NOISE_MARKERS = [
  "REKOMENDOWANE OFERTY",
  "Rekomendowane oferty",
  "PODOBNE OFERTY",
  "Podobne oferty",
  "INNE OFERTY",
  "Inne oferty",
  "REKLAMA: ROCKETJOBS",
  "REKLAMA: JUSTJOIN",
  "REKLAMA: PRACUJ",
];

function truncateAtRecommended(text: string): string {
  let cutAt = text.length;
  for (const marker of NOISE_MARKERS) {
    const idx = text.indexOf(marker);
    if (idx !== -1 && idx < cutAt) cutAt = idx;
  }
  return text.slice(0, cutAt).trimEnd();
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
  }

  const { url } = await req.json();

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy URL." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "URL musi zaczynać się od http:// lub https://." },
      { status: 400 },
    );
  }

  // 1. Pobierz surowy tekst strony przez Jina Reader
  const jinaUrl = `https://r.jina.ai/${url}`;

  let rawText: string;
  try {
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "text",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Nie udało się wczytać strony. Sprawdź link." },
        { status: 502 },
      );
    }

    // Ucinamy przy pierwszym markerze sekcji "polecane" — zanim wyślemy do Gemini
    const fullText = (await res.text()).trim();
    rawText = truncateAtRecommended(fullText).slice(0, 20000);
  } catch {
    return NextResponse.json(
      { error: "Nie udało się wczytać strony. Sprawdź link i spróbuj ponownie." },
      { status: 502 },
    );
  }

  if (rawText.length < 80) {
    return NextResponse.json(
      { error: "Strona nie zawiera wystarczającej ilości tekstu." },
      { status: 422 },
    );
  }

  // 2. Gemini wyodrębnia ogłoszenie i metadane jako JSON
  const prompt = `Przeanalizuj poniższy tekst strony z ogłoszeniem o pracę i zwróć JSON z polami:

- "jobText": TYLKO treść głównego ogłoszenia (tytuł stanowiska, opis roli, wymagania, obowiązki, oferta pracodawcy, wynagrodzenie). Tekst powinien być ciągły i czytelny — usuń zbędne powtórzenia, przyciski ("Aplikuj", "Zapisz"), ikony i artefakty layoutu. NIE dołączaj żadnych innych ogłoszeń ani sekcji "polecane".
- "company": nazwa firmy rekrutującej (string lub null jeśli nie znaleziono)
- "postedDaysAgo": ile dni temu opublikowano ogłoszenie jako liczba całkowita (np. 3), lub null jeśli nie znaleziono. Jeśli widzisz "dzisiaj"/"today" zwróć 0. Jeśli "wczoraj"/"yesterday" zwróć 1.
- "openRoles": łączna liczba aktywnych ofert tej firmy widoczna na stronie jako liczba całkowita (np. 12), lub null jeśli nie znaleziono.

TEKST STRONY:
${rawText}`;

  async function callGemini(attempt = 1): Promise<Response> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
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
    return NextResponse.json({ text: rawText.slice(0, 8000) });
  }

  const data = await geminiRes.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: {
    jobText?: string;
    company?: string | null;
    postedDaysAgo?: number | null;
    openRoles?: number | null;
  } = {};
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    // Fallback: zwróć surowy tekst
  }

  return NextResponse.json({
    text: parsed.jobText?.trim() || rawText.slice(0, 8000),
    company: parsed.company ?? null,
    postedDaysAgo: parsed.postedDaysAgo ?? null,
    openRoles: parsed.openRoles ?? null,
  });
}
