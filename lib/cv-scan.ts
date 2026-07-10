// CV Scanner — algorytmiczna analiza CV (bez AI)
// Uruchamiana po stronie klienta — tekst CV nigdy nie opuszcza przeglądarki

// ─── Stopwords ─────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  // Polish
  "i", "w", "z", "na", "do", "że", "się", "to", "jest", "są", "być", "nie",
  "tak", "jak", "ale", "co", "przez", "po", "przy", "o", "za", "czy", "już",
  "też", "lub", "dla", "te", "ten", "ta", "go", "jej", "jego", "ich", "nam",
  "nas", "ja", "on", "ona", "oni", "my", "wy", "pan", "pani", "ze", "od",
  "ku", "np", "tzw", "itp", "itd", "oraz", "który", "która", "które", "tym",
  "tych", "tej", "tego", "roku", "lat", "lata", "roku", "pracy", "firmy",
  "które", "który", "która", "tego", "tej", "tych", "tym", "temu", "tej",
  "naszej", "naszego", "nasz", "nasza", "nasze", "twój", "twoja", "twoje",
  // English
  "the", "and", "or", "in", "of", "to", "a", "an", "is", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "must", "can", "with",
  "at", "by", "for", "on", "about", "as", "into", "through", "during", "its",
  "this", "that", "these", "those", "we", "they", "he", "she", "it", "who",
  "which", "what", "when", "where", "why", "how", "all", "each", "every",
  "both", "few", "more", "most", "other", "some", "such", "no", "not",
  "only", "same", "so", "than", "too", "very", "our", "your", "their",
]);

// ─── Action verbs ────────────────────────────────────────────────────────────

const ACTION_VERBS = new Set([
  // Polish (common forms)
  "zarządzał", "zarządzałem", "zarządzałam", "zarządzanie",
  "wdrożył", "wdrożyłem", "wdrożyłam", "wdrożenie", "wdrażał", "wdrażałem",
  "zwiększył", "zwiększyłem", "zwiększyłam", "zwiększenie",
  "zmniejszył", "zmniejszyłem", "zmniejszyłam", "zmniejszenie",
  "opracował", "opracowałem", "opracowałam", "opracowanie",
  "zaprojektował", "zaprojektowałem", "zaprojektowałam", "projektowanie",
  "koordynował", "koordynowałem", "koordynowałam", "koordynacja",
  "realizował", "realizowałem", "realizowałam", "realizacja",
  "optymalizował", "optymalizowałem", "optymalizowałam", "optymalizacja",
  "kierował", "kierowałem", "kierowałam", "kierowanie",
  "prowadził", "prowadziłem", "prowadziłam", "prowadzenie",
  "budował", "budowałem", "budowałam", "budowanie",
  "tworzył", "tworzyłem", "tworzyłam", "tworzenie",
  "rozwijał", "rozwijałem", "rozwijałam", "rozwijanie",
  "implementował", "implementowałem", "implementowałam", "implementacja",
  "analizował", "analizowałem", "analizowałam", "analiza",
  "monitorował", "monitorowałem", "monitorowałam", "monitorowanie",
  "raportował", "raportowałem", "raportowałam", "raportowanie",
  "negocjował", "negocjowałem", "negocjowałam", "negocjacje",
  "planował", "planowałem", "planowałam", "planowanie",
  "organizował", "organizowałem", "organizowałam", "organizacja",
  "nadzorował", "nadzorowałem", "nadzorowałam", "nadzorowanie",
  "szkolił", "szkoliłem", "szkoliłam", "szkolenie",
  "doradzał", "doradzałem", "doradzałam", "doradztwo",
  "wspierał", "wspierałem", "wspierałam", "wsparcie",
  "usprawniał", "usprawniałem", "usprawniałam", "usprawnienie",
  "automatyzował", "automatyzowałem", "automatyzowałam", "automatyzacja",
  "standaryzował", "standaryzowałem", "standaryzowałam", "standaryzacja",
  "przekształcił", "przekształciłem", "przekształciłam", "przekształcenie",
  "osiągnął", "osiągnęłam", "osiągnięcie", "zrealizował", "zrealizowałem",
  "zapewnił", "zapewniłem", "zapewniłam", "zapewnienie",
  "skrócił", "skróciłem", "skróciłam", "poprawa", "poprawił", "poprawiłem",
  "zdobył", "zdobyłem", "zdobyłam", "usprawnił", "usprawnił",
  "odpowiadał", "odpowiadałem", "odpowiadałam",
  // English
  "managed", "implemented", "developed", "led", "created", "designed",
  "optimized", "increased", "decreased", "improved", "built", "launched",
  "delivered", "achieved", "analyzed", "collaborated", "coordinated",
  "established", "executed", "generated", "initiated", "introduced",
  "maintained", "mentored", "negotiated", "organized", "planned", "reduced",
  "resolved", "streamlined", "supervised", "trained", "transformed", "drove",
  "spearheaded", "oversaw", "directed", "facilitated", "implemented",
  "accelerated", "boosted", "championed", "consolidated", "deployed",
]);

// ─── CV section patterns ─────────────────────────────────────────────────────

const SECTION_CHECKS: { key: string; label: string; patterns: RegExp[] }[] = [
  {
    key: "contact",
    label: "Dane kontaktowe",
    patterns: [
      /\b[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}\b/i,
      /\+?\d[\d\s\-()]{8,}/,
    ],
  },
  {
    key: "experience",
    label: "Doświadczenie zawodowe",
    patterns: [
      /do[śs]wiadczenie/i,
      /experience/i,
      /zatrudnienie/i,
      /employment/i,
      /praca zawodowa/i,
      /work history/i,
      /historia zawodowa/i,
    ],
  },
  {
    key: "education",
    label: "Wykształcenie",
    patterns: [
      /wykszta[łl]cenie/i,
      /education/i,
      /edukacja/i,
      /studia/i,
      /uczelnia/i,
      /university/i,
      /college/i,
      /szko[łl]a/i,
    ],
  },
  {
    key: "skills",
    label: "Umiejętności / Technologie",
    patterns: [
      /umiej[eę]tno[śs]ci/i,
      /skills/i,
      /technologie/i,
      /technologies/i,
      /kompetencje/i,
      /\bstack\b/i,
      /j[eę]zyki/i,
    ],
  },
  {
    key: "summary",
    label: "Podsumowanie / Profil",
    patterns: [
      /podsumowanie/i,
      /summary/i,
      /profil/i,
      /\bprofile\b/i,
      /o mnie/i,
      /about me/i,
      /cel zawodowy/i,
      /objective/i,
    ],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

export type CvScanResult = {
  totalScore: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  sections: {
    keywords: {
      score: number;
      max: number;
      hasJobDesc: boolean;
      matched: string[];
      missing: string[];
      matchRatio: number; // 0-1
    };
    structure: {
      score: number;
      max: number;
      foundSections: string[];
      missingSections: string[];
    };
    ats: {
      score: number;
      max: number;
      issues: string[];
    };
    achievements: {
      score: number;
      max: number;
      count: number;
    };
    actionVerbs: {
      score: number;
      max: number;
      found: string[];
    };
  };
  suggestions: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u024F-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Root matching for Polish inflection (use 75% prefix for words >= 7 chars)
  if (a.length >= 7 && b.length >= 7) {
    const root = b.slice(0, Math.ceil(b.length * 0.75));
    if (root.length >= 5 && a.startsWith(root)) return true;
    const rootA = a.slice(0, Math.ceil(a.length * 0.75));
    if (rootA.length >= 5 && b.startsWith(rootA)) return true;
  }
  return false;
}

// ─── Scoring functions ───────────────────────────────────────────────────────

function scoreKeywords(
  cvText: string,
  jobText?: string,
): CvScanResult["sections"]["keywords"] {
  const MAX = 35;

  if (!jobText || jobText.trim().length < 50) {
    return {
      score: MAX,
      max: MAX,
      hasJobDesc: false,
      matched: [],
      missing: [],
      matchRatio: 1,
    };
  }

  const cvTokens = tokenize(cvText);
  const jobTokens = [...new Set(tokenize(jobText))].filter((t) => t.length >= 4);

  if (jobTokens.length === 0) {
    return { score: MAX, max: MAX, hasJobDesc: true, matched: [], missing: [], matchRatio: 1 };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const jt of jobTokens) {
    const found = cvTokens.some((ct) => tokensMatch(ct, jt));
    if (found) matched.push(jt);
    else missing.push(jt);
  }

  const ratio = matched.length / jobTokens.length;
  const score = Math.round(ratio * MAX);

  return {
    score,
    max: MAX,
    hasJobDesc: true,
    matched: matched.slice(0, 12),
    missing: missing.slice(0, 15),
    matchRatio: ratio,
  };
}

function scoreStructure(cvText: string): CvScanResult["sections"]["structure"] {
  const MAX = 25;
  const foundSections: string[] = [];
  const missingSections: string[] = [];

  for (const { label, patterns } of SECTION_CHECKS) {
    const found = patterns.some((p) => p.test(cvText));
    if (found) foundSections.push(label);
    else missingSections.push(label);
  }

  const ratio = foundSections.length / SECTION_CHECKS.length;
  const score = Math.round(ratio * MAX);

  return { score, max: MAX, foundSections, missingSections };
}

function scoreAts(cvText: string): CvScanResult["sections"]["ats"] {
  const MAX = 20;
  const issues: string[] = [];

  // Tables
  if (/\|.*\|/.test(cvText)) {
    issues.push("Wykryto struktury tabelaryczne — wiele systemów ATS ich nie parsuje");
  }

  // Decorative icons/bullets
  if (/[★✦✓●◆▪▸►❯❮]{2,}/.test(cvText)) {
    issues.push("Ikony dekoracyjne mogą być nieczytelne dla parsera ATS");
  }

  // Excessive short lines → columnar layout
  const lines = cvText.split("\n").filter((l) => l.trim().length > 0);
  const shortLines = lines.filter((l) => {
    const t = l.trim();
    return t.length > 1 && t.length < 15;
  });
  if (lines.length > 10 && shortLines.length / lines.length > 0.45) {
    issues.push(
      "Dużo krótkich linii — może wskazywać na układ wielokolumnowy, który ATS parsuje błędnie",
    );
  }

  // Date format consistency
  const datePatterns = [
    /\d{2}\/\d{4}/,
    /\d{2}\.\d{4}/,
    /\d{4}-\d{2}/,
    /(styczeń|luty|marzec|kwiecień|maj|czerwiec|lipiec|sierpień|wrzesień|październik|listopad|grudzień)\s+\d{4}/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
  ];
  const foundDateFormats = datePatterns.filter((p) => p.test(cvText));
  if (foundDateFormats.length > 2) {
    issues.push("Niespójny format dat — ujednolicenie poprawia czytelność dla ATS");
  }

  // Length check
  const wordCount = cvText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 150) {
    issues.push(`CV jest bardzo krótkie (${wordCount} słów) — typowe CV ma 300-700 słów`);
  } else if (wordCount > 1500) {
    issues.push(`CV jest bardzo długie (${wordCount} słów) — rozważ skrócenie do 1-2 stron`);
  }

  // Contact info
  const hasEmail = /\b[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}\b/i.test(cvText);
  const hasPhone = /\+?\d[\d\s\-()]{8,}/.test(cvText);
  if (!hasEmail) issues.push("Brak adresu e-mail — wymagane w każdym CV");
  if (!hasPhone) issues.push("Brak numeru telefonu — rekruterzy oczekują kontaktu telefonicznego");

  const deduction = Math.min(issues.length * 4, MAX);
  return { score: Math.max(MAX - deduction, 0), max: MAX, issues };
}

function scoreAchievements(cvText: string): CvScanResult["sections"]["achievements"] {
  const MAX = 10;

  // Count numeric achievements: percentages, large numbers, abbreviations
  const patterns = [
    /\d+\s*%/g,
    /\d+\s*(mln|tys\.?|k\b)/gi,
    /\d+\s*(milion|tysiąc|milionów|tysięcy)/gi,
    /\b\d{2,}\b/g, // any 2+ digit number
  ];

  const allMatches = new Set<string>();
  for (const p of patterns) {
    const m = cvText.match(new RegExp(p.source, "gi"));
    if (m) m.forEach((x) => allMatches.add(x.trim()));
  }

  const count = allMatches.size;
  const score =
    count === 0 ? 0 :
    count === 1 ? 3 :
    count === 2 ? 6 :
    count <= 4 ? 8 : MAX;

  return { score, max: MAX, count };
}

function scoreActionVerbs(cvText: string): CvScanResult["sections"]["actionVerbs"] {
  const MAX = 10;
  const lower = cvText.toLowerCase();
  const found: string[] = [];

  for (const verb of ACTION_VERBS) {
    if (lower.includes(verb)) found.push(verb);
  }

  // 5+ verbs = full score
  const score = Math.min(found.length * 2, MAX);

  return { score, max: MAX, found: found.slice(0, 10) };
}

function buildSuggestions(r: Omit<CvScanResult, "suggestions">): string[] {
  const s: string[] = [];

  if (r.sections.structure.missingSections.length > 0) {
    s.push(
      `Dodaj brakujące sekcje: ${r.sections.structure.missingSections.join(", ")}`,
    );
  }

  if (!r.sections.ats.issues.find((i) => i.includes("e-mail"))) {
    // email found, skip
  }
  for (const issue of r.sections.ats.issues) {
    s.push(issue);
  }

  if (r.sections.achievements.count < 3) {
    s.push(
      "Dodaj mierzalne osiągnięcia z liczbami (np. \"zwiększyłem sprzedaż o 30%\", \"zredukowałem czas deployu o 2 min\") — to silnie wyróżnia CV w ATS",
    );
  }

  if (r.sections.actionVerbs.found.length < 3) {
    s.push(
      "Zacznij opisy obowiązków od słów akcji (np. wdrożyłem, zarządzałem, zwiększyłem, zoptymalizowałem) — pasywny styl obniża ocenę ATS",
    );
  }

  if (r.sections.keywords.hasJobDesc && r.sections.keywords.missing.length > 0) {
    s.push(
      `Uwzględnij w CV kluczowe słowa z oferty (np. ${r.sections.keywords.missing.slice(0, 4).join(", ")}) — ATS filtruje kandydatów właśnie po tych frazach`,
    );
  }

  if (!r.sections.keywords.hasJobDesc) {
    s.push(
      "Wklej treść ogłoszenia pracy, aby sprawdzić dopasowanie słów kluczowych — to najważniejsza optymalizacja pod ATS",
    );
  }

  if (r.totalScore >= 85 && s.length === 0) {
    s.push(
      "Twoje CV jest bardzo dobrze zoptymalizowane. Pamiętaj, żeby dopasowywać słowa kluczowe do każdej oferty osobno.",
    );
  }

  return s;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function scanCv(cvText: string, jobText?: string): CvScanResult {
  const keywords = scoreKeywords(cvText, jobText);
  const structure = scoreStructure(cvText);
  const ats = scoreAts(cvText);
  const achievements = scoreAchievements(cvText);
  const actionVerbs = scoreActionVerbs(cvText);

  const totalScore = keywords.score + structure.score + ats.score + achievements.score + actionVerbs.score;

  const grade: CvScanResult["grade"] =
    totalScore >= 85 ? "A" :
    totalScore >= 70 ? "B" :
    totalScore >= 50 ? "C" :
    totalScore >= 30 ? "D" : "F";

  const partial = { totalScore, grade, sections: { keywords, structure, ats, achievements, actionVerbs } };

  return { ...partial, suggestions: buildSuggestions(partial) };
}
