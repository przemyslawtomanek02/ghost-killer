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
  "zdobył", "zdobyłem", "zdobyłam", "usprawnił",
  "odpowiadał", "odpowiadałem", "odpowiadałam",
  // English
  "managed", "implemented", "developed", "led", "created", "designed",
  "optimized", "increased", "decreased", "improved", "built", "launched",
  "delivered", "achieved", "analyzed", "collaborated", "coordinated",
  "established", "executed", "generated", "initiated", "introduced",
  "maintained", "mentored", "negotiated", "organized", "planned", "reduced",
  "resolved", "streamlined", "supervised", "trained", "transformed", "drove",
  "spearheaded", "oversaw", "directed", "facilitated",
  "accelerated", "boosted", "championed", "consolidated", "deployed",
]);

// ─── Buzzwords / clichés ──────────────────────────────────────────────────────

// [display label, regex pattern]
const BUZZWORD_DEFS: [string, RegExp][] = [
  ["team player", /\bteam[- ]?player\b/i],
  ["gracz zespołowy", /\bgracz\s+zesp[oó][łl]owy\b/i],
  ["pasjonat", /\bpasjonat\b/i],
  ["passion for", /\bpassion\s+for\b/i],
  ["proaktywny", /\bproaktywn\w*/i],
  ["proactive", /\bproactive\b/i],
  ["dynamiczny", /\bdynamiczn\w*/i],
  ["dynamic", /\bdynamic\b/i],
  ["kreatywny", /\bkreatywn\w*/i],
  ["creative thinker", /\bcreative\s+thinker\b/i],
  ["innowacyjny", /\binnowacyjn\w*/i],
  ["innovative", /\binnovative\b/i],
  ["zorientowany na wyniki", /\bzorientowany\s+na\s+wyniki\b/i],
  ["results-driven", /\bresults[- ]driven\b/i],
  ["results-oriented", /\bresults[- ]oriented\b/i],
  ["thinking outside the box", /thinking\s+outside\s+the\s+box/i],
  ["myślenie poza schematami", /my[śs]lenie\s+poza\s+schematami/i],
  ["fast learner", /\bfast\s+learner\b/i],
  ["szybko się uczę", /szybko\s+si[eę]\s+ucz[eę]\b/i],
  ["multitasking", /\bmultitask\w*/i],
  ["self-starter", /\bself[- ]starter\b/i],
  ["synergy", /\bsynerg\w*/i],
  ["synergia", /\bsynergi\w*/i],
  ["hardworking", /\bhardwork\w*/i],
  ["pracowity", /\bpracowit\w*/i],
  ["motivated", /\bmotivated\b/i],
  ["zmotywowany", /\bzmotywowany\b/i],
  ["responsible for", /\bresponsible\s+for\b/i],
  ["odpowiedzialny za (pasywnie)", /\bodpowiedzialn\w+\s+za\b/i],
  ["komunikatywny", /\bkomunikatywn\w*/i],
  ["communication skills", /\bcommunication\s+skills\b/i],
  ["out-of-the-box", /\bout[- ]of[- ]the[- ]box\b/i],
  ["go-getter", /\bgo[- ]getter\b/i],
  ["driven", /\bdriven\b/i],
  ["detail-oriented", /\bdetail[- ]oriented\b/i],
];

// ─── Certifications ───────────────────────────────────────────────────────────

const CERT_DEFS: [string, RegExp][] = [
  // Cloud
  ["AWS", /\bAWS\b/],
  ["Google Cloud / GCP", /\b(GCP|Google Cloud)\b/i],
  ["Azure", /\bAzure\b/i],
  // PM / Agile
  ["PMP", /\bPMP\b/],
  ["Prince2", /\bPRINCE2\b/i],
  ["Scrum Master", /\bScrum\s*Master\b/i],
  ["PSM", /\bPSM[- ]?[I]{1,3}\b/],
  ["SAFe", /\bSAFe\b/],
  ["ITIL", /\bITIL\b/],
  // Security / QA
  ["CISSP", /\bCISSP\b/],
  ["CEH", /\bCEH\b/],
  ["ISTQB", /\bISTQB\b/],
  ["CompTIA", /\bCompTIA\b/i],
  // Data / Finance
  ["CFA", /\bCFA\b/],
  ["ACCA", /\bACCA\b/],
  ["Google Analytics", /\bGoogle\s+Analytics\b/i],
  ["Tableau", /\bTableau\b/i],
  ["Power BI", /\bPower\s*BI\b/i],
  // Dev
  ["Kubernetes (CKA/CKAD)", /\bCK[AD]D?\b/],
  ["Oracle", /\bOCA|OCP|Oracle\s+Certified\b/i],
  ["Salesforce", /\bSalesforce\s+(Admin|Developer|Certified)\b/i],
  // HR / Marketing
  ["HubSpot", /\bHubSpot\s+Certified\b/i],
  ["Google Ads", /\bGoogle\s+Ads\s+Certified\b/i],
];

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
      /do[śs]wiadczenie/i, /experience/i, /zatrudnienie/i,
      /employment/i, /praca zawodowa/i, /work history/i, /historia zawodowa/i,
    ],
  },
  {
    key: "education",
    label: "Wykształcenie",
    patterns: [
      /wykszta[łl]cenie/i, /education/i, /edukacja/i,
      /studia/i, /uczelnia/i, /university/i, /college/i, /szko[łl]a/i,
    ],
  },
  {
    key: "skills",
    label: "Umiejętności / Technologie",
    patterns: [
      /umiej[eę]tno[śs]ci/i, /skills/i, /technologie/i,
      /technologies/i, /kompetencje/i, /\bstack\b/i, /j[eę]zyki/i,
    ],
  },
  {
    key: "summary",
    label: "Podsumowanie / Profil",
    patterns: [
      /podsumowanie/i, /summary/i, /profil/i, /\bprofile\b/i,
      /o mnie/i, /about me/i, /cel zawodowy/i, /objective/i,
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
      matchRatio: number;
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
    rodo: {
      present: boolean;
      clause: string | null;
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
    // ─── Informational sections (no score impact) ─────────────────────
    buzzwords: {
      found: string[]; // display labels of detected clichés
    };
    onlinePresence: {
      linkedin: boolean;
      github: boolean;
      portfolio: boolean;
      phoneInternational: boolean; // has +48 or similar
    };
    languages: {
      hasSection: boolean;
      hasStandardLevels: boolean; // A1–C2 / native / fluent
      detected: string[]; // e.g. ["Angielski C1", "Niemiecki B2"]
    };
    certifications: {
      found: string[]; // display labels
    };
    readability: {
      avgWordsPerSentence: number;
      verdict: "good" | "ok" | "complex";
    };
    careerGaps: {
      detected: boolean;
      gaps: string[]; // e.g. ["2019–2021 (ok. 18 mies.)"]
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
  if (a.length >= 7 && b.length >= 7) {
    const root = b.slice(0, Math.ceil(b.length * 0.75));
    if (root.length >= 5 && a.startsWith(root)) return true;
    const rootA = a.slice(0, Math.ceil(a.length * 0.75));
    if (rootA.length >= 5 && b.startsWith(rootA)) return true;
  }
  return false;
}

// ─── Scored sections ─────────────────────────────────────────────────────────

function scoreKeywords(cvText: string, jobText?: string): CvScanResult["sections"]["keywords"] {
  const MAX = 35;
  if (!jobText || jobText.trim().length < 50) {
    return { score: MAX, max: MAX, hasJobDesc: false, matched: [], missing: [], matchRatio: 1 };
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
  return {
    score: Math.round(ratio * MAX), max: MAX, hasJobDesc: true,
    matched: matched.slice(0, 12), missing: missing.slice(0, 15), matchRatio: ratio,
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
  return { score: Math.round((foundSections.length / SECTION_CHECKS.length) * MAX), max: MAX, foundSections, missingSections };
}

function scoreAts(cvText: string): CvScanResult["sections"]["ats"] {
  const MAX = 20;
  const issues: string[] = [];
  if (/\|.*\|/.test(cvText))
    issues.push("Wykryto struktury tabelaryczne — wiele systemów ATS ich nie parsuje");
  if (/[★✦✓●◆▪▸►❯❮]{2,}/.test(cvText))
    issues.push("Ikony dekoracyjne mogą być nieczytelne dla parsera ATS");
  const lines = cvText.split("\n").filter((l) => l.trim().length > 0);
  const shortLines = lines.filter((l) => { const t = l.trim(); return t.length > 1 && t.length < 15; });
  if (lines.length > 10 && shortLines.length / lines.length > 0.45)
    issues.push("Dużo krótkich linii — może wskazywać na układ wielokolumnowy, który ATS parsuje błędnie");
  const datePatterns = [
    /\d{2}\/\d{4}/, /\d{2}\.\d{4}/, /\d{4}-\d{2}/,
    /(styczeń|luty|marzec|kwiecień|maj|czerwiec|lipiec|sierpień|wrzesień|październik|listopad|grudzień)\s+\d{4}/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
  ];
  if (datePatterns.filter((p) => p.test(cvText)).length > 2)
    issues.push("Niespójny format dat — ujednolicenie poprawia czytelność dla ATS");
  const wordCount = cvText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 150) issues.push(`CV jest bardzo krótkie (${wordCount} słów) — typowe CV ma 300–700 słów`);
  else if (wordCount > 1500) issues.push(`CV jest bardzo długie (${wordCount} słów) — rozważ skrócenie do 1–2 stron`);
  if (!/\b[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}\b/i.test(cvText))
    issues.push("Brak adresu e-mail — wymagane w każdym CV");
  if (!/\+?\d[\d\s\-()]{8,}/.test(cvText))
    issues.push("Brak numeru telefonu — rekruterzy oczekują kontaktu telefonicznego");
  return { score: Math.max(MAX - Math.min(issues.length * 4, MAX), 0), max: MAX, issues };
}

function scoreAchievements(cvText: string): CvScanResult["sections"]["achievements"] {
  const MAX = 10;
  const patterns = [/\d+\s*%/g, /\d+\s*(mln|tys\.?|k\b)/gi, /\d+\s*(milion|tysiąc|milionów|tysięcy)/gi, /\b\d{2,}\b/g];
  const allMatches = new Set<string>();
  for (const p of patterns) {
    const m = cvText.match(new RegExp(p.source, "gi"));
    if (m) m.forEach((x) => allMatches.add(x.trim()));
  }
  const count = allMatches.size;
  const score = count === 0 ? 0 : count === 1 ? 3 : count === 2 ? 6 : count <= 4 ? 8 : MAX;
  return { score, max: MAX, count };
}

function scoreActionVerbs(cvText: string): CvScanResult["sections"]["actionVerbs"] {
  const MAX = 10;
  const lower = cvText.toLowerCase();
  const found: string[] = [];
  for (const verb of ACTION_VERBS) {
    if (lower.includes(verb)) found.push(verb);
  }
  return { score: Math.min(found.length * 2, MAX), max: MAX, found: found.slice(0, 10) };
}

// ─── RODO ─────────────────────────────────────────────────────────────────────

function detectRodo(cvText: string): CvScanResult["sections"]["rodo"] {
  const rodoPatterns = [
    /wyra[żz]am\s+zgod[ęe]\s+na\s+przetwarzanie/i,
    /przetwarzanie\s+(moich\s+)?danych\s+osobowych/i,
    /\bRODO\b/,
    /\bGDPR\b/i,
    /rozporz[ąa]dzeni[au]\s+(parlamentu|UE|o ochronie)/i,
    /art\.?\s*6\s+(ust\.?)?\s*1?\s*(lit\.?)?\s*[a-cA-C]/,
    /administrator\s+danych\s+osobowych/i,
    /ochrona\s+danych\s+osobowych/i,
    /cel[eó]w?\s+rekrutacji/i,
  ];
  const hits = rodoPatterns.filter((p) => p.test(cvText));
  if (hits.length < 2) return { present: false, clause: null };
  const mainMatch =
    cvText.match(/wyra[żz]am\s+zgod[ęe][^.]{0,200}/i) ??
    cvText.match(/przetwarzanie\s+(moich\s+)?danych\s+osobowych[^.]{0,150}/i) ??
    cvText.match(/\bRODO\b.{0,150}/i);
  return { present: true, clause: mainMatch ? mainMatch[0].trim().slice(0, 180) : null };
}

// ─── Buzzwords ────────────────────────────────────────────────────────────────

function detectBuzzwords(cvText: string): CvScanResult["sections"]["buzzwords"] {
  const found: string[] = [];
  for (const [label, pattern] of BUZZWORD_DEFS) {
    if (pattern.test(cvText)) found.push(label);
  }
  return { found };
}

// ─── Online presence ──────────────────────────────────────────────────────────

function detectOnlinePresence(cvText: string): CvScanResult["sections"]["onlinePresence"] {
  return {
    linkedin: /linkedin\.com\/(in|pub)\//i.test(cvText),
    github: /github\.com\//i.test(cvText),
    portfolio: /(portfolio|behance\.net|dribbble\.com|figma\.com\/file)/i.test(cvText),
    phoneInternational: /\+\d{1,3}[\s\-]?\d/.test(cvText),
  };
}

// ─── Languages ────────────────────────────────────────────────────────────────

function detectLanguages(cvText: string): CvScanResult["sections"]["languages"] {
  const hasSection = /(j[eę]zyki|languages?|znajomo[śs][ćc]\s+j[eę]zyk)/i.test(cvText);

  const levelPatterns = [
    /\b[ABC][12]\b/,
    /\bnative\b/i,
    /\bfluent\b/i,
    /\bbiegły\b/i,
    /\bwybiegły\b/i,
    /\bkomunikatywn\w+\s+(poziom|znajomo[śs][ćc])/i,
    /\bbasic\b/i,
    /\bzaawansowany\b/i,
    /\bśrednio\s*zaawansowany\b/i,
    /\bpodstawowy\b/i,
    /\brodowit\w+\s+m[oó]wc\w+/i,
  ];
  const hasStandardLevels = levelPatterns.some((p) => p.test(cvText));

  // Try to extract language + level pairs
  const detected: string[] = [];
  const langRegex = /(angielski|angielskiego|english|niemiecki|german|francuski|french|hiszpański|spanish|włoski|italian|rosyjski|russian|czeski|czech|niderlandzki|dutch|japoński|japanese|chiński|chinese|arabski|arabic|koreański|korean|szwedzki|swedish|norweski|norwegian|duński|danish|fiński|finnish|ukraiński|ukrainian|turecki|turkish|polski|polish)\s*[-–—:·]?\s*([A-C][12]|native|fluent|bieg[łl]y|zaawansowany|komunikatywny|podstawowy|elementary|intermediate|advanced|conversational|mother\s*tongue|j[eę]zyk\s+ojczysty)?/gi;
  let m: RegExpExecArray | null;
  while ((m = langRegex.exec(cvText)) !== null) {
    const lang = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    const level = m[2] ? ` ${m[2].trim()}` : "";
    const entry = lang + level;
    if (!detected.includes(entry)) detected.push(entry);
  }

  return { hasSection, hasStandardLevels, detected };
}

// ─── Certifications ───────────────────────────────────────────────────────────

function detectCertifications(cvText: string): CvScanResult["sections"]["certifications"] {
  const found: string[] = [];
  for (const [label, pattern] of CERT_DEFS) {
    if (pattern.test(cvText)) found.push(label);
  }
  return { found };
}

// ─── Readability ─────────────────────────────────────────────────────────────

function analyzeReadability(cvText: string): CvScanResult["sections"]["readability"] {
  const sentences = cvText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  if (sentences.length === 0) return { avgWordsPerSentence: 0, verdict: "good" };
  const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
  const avg = Math.round(totalWords / sentences.length);
  const verdict: "good" | "ok" | "complex" = avg <= 18 ? "good" : avg <= 25 ? "ok" : "complex";
  return { avgWordsPerSentence: avg, verdict };
}

// ─── Career gaps ─────────────────────────────────────────────────────────────

function detectCareerGaps(cvText: string): CvScanResult["sections"]["careerGaps"] {
  // Extract years from the CV (4-digit years between 1980–2030)
  const yearPattern = /\b(19[89]\d|20[012]\d)\b/g;
  const allYears: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = yearPattern.exec(cvText)) !== null) {
    allYears.push(parseInt(m[1]));
  }
  if (allYears.length < 4) return { detected: false, gaps: [] };

  const sorted = [...new Set(allYears)].sort((a, b) => a - b);
  const gaps: string[] = [];

  // Look for year jumps > 1 year between consecutive mentions
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i + 1] - sorted[i];
    if (diff >= 2) {
      gaps.push(`${sorted[i]}–${sorted[i + 1]} (ok. ${diff} lat${diff === 1 ? "" : diff < 5 ? "a" : ""})`);
    }
  }

  return { detected: gaps.length > 0, gaps };
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

function buildSuggestions(r: Omit<CvScanResult, "suggestions">): string[] {
  const s: string[] = [];

  if (r.sections.structure.missingSections.length > 0)
    s.push(`Dodaj brakujące sekcje: ${r.sections.structure.missingSections.join(", ")}`);

  for (const issue of r.sections.ats.issues) s.push(issue);

  if (r.sections.achievements.count < 3)
    s.push("Dodaj mierzalne osiągnięcia z liczbami (np. \"zwiększyłem sprzedaż o 30%\") — to silnie wyróżnia CV w ATS");

  if (r.sections.actionVerbs.found.length < 3)
    s.push("Zacznij opisy obowiązków od słów akcji (np. wdrożyłem, zarządzałem, zoptymalizowałem) — pasywny styl obniża ocenę ATS");

  if (r.sections.keywords.hasJobDesc && r.sections.keywords.missing.length > 0)
    s.push(`Uwzględnij słowa kluczowe z oferty (np. ${r.sections.keywords.missing.slice(0, 4).join(", ")}) — ATS filtruje kandydatów właśnie po tych frazach`);

  if (!r.sections.keywords.hasJobDesc)
    s.push("Wklej treść ogłoszenia pracy, aby sprawdzić dopasowanie słów kluczowych — to najważniejsza optymalizacja pod ATS");

  if (r.sections.buzzwords.found.length > 0)
    s.push(`Usuń lub zastąp okrągłe sformułowania konkretnymi osiągnięciami: ${r.sections.buzzwords.found.slice(0, 3).join(", ")}`);

  if (!r.sections.onlinePresence.linkedin)
    s.push("Dodaj link do profilu LinkedIn — rekruterzy zawsze go sprawdzają");

  if (r.sections.languages.hasSection && !r.sections.languages.hasStandardLevels)
    s.push("W sekcji językowej podaj poziom wg skali CEFR (A1–C2) lub opisowy (native, fluent, communicative)");

  if (r.sections.readability.verdict === "complex")
    s.push(`Średnia długość zdania to ${r.sections.readability.avgWordsPerSentence} słów — skróć zdania do maks. 20 słów dla lepszej czytelności`);

  if (r.totalScore >= 85 && s.length === 0)
    s.push("Twoje CV jest bardzo dobrze zoptymalizowane. Pamiętaj, żeby dopasowywać słowa kluczowe do każdej oferty osobno.");

  return s;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function scanCv(cvText: string, jobText?: string): CvScanResult {
  const keywords = scoreKeywords(cvText, jobText);
  const structure = scoreStructure(cvText);
  const ats = scoreAts(cvText);
  const rodo = detectRodo(cvText);
  const achievements = scoreAchievements(cvText);
  const actionVerbs = scoreActionVerbs(cvText);
  const buzzwords = detectBuzzwords(cvText);
  const onlinePresence = detectOnlinePresence(cvText);
  const languages = detectLanguages(cvText);
  const certifications = detectCertifications(cvText);
  const readability = analyzeReadability(cvText);
  const careerGaps = detectCareerGaps(cvText);

  const totalScore =
    keywords.score + structure.score + ats.score + achievements.score + actionVerbs.score;

  const grade: CvScanResult["grade"] =
    totalScore >= 85 ? "A" :
    totalScore >= 70 ? "B" :
    totalScore >= 50 ? "C" :
    totalScore >= 30 ? "D" : "F";

  const partial = {
    totalScore, grade,
    sections: { keywords, structure, ats, rodo, achievements, actionVerbs, buzzwords, onlinePresence, languages, certifications, readability, careerGaps },
  };

  return { ...partial, suggestions: buildSuggestions(partial) };
}
