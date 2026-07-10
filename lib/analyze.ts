// Wspólna logika analizy — używana przez backend (route.ts)

export const FREE_LIMIT = 3; // darmowe analizy / miesiąc

export type CriterionStatus = "red" | "yellow" | "green";

export type Criterion = {
  name: string;
  status: CriterionStatus;
  reason: string;
};

export type AnalysisResult = {
  verdict: "safe" | "warning" | "danger";
  score: number;
  verdictLabel: string;
  summary: string;
  criteria: Criterion[];
};

export type ExternalSignals = {
  postedDaysAgo?: string;
  openRoles?: string;
  linkedinActivity?: string;
};

export function buildPrompt(
  jobText: string,
  company?: string,
  ext?: ExternalSignals,
): string {
  const extBlock = `
Dodatkowe sygnały zewnętrzne (jeśli puste = nieznane, NIE zgaduj):
- Ogłoszenie opublikowane/odnowione ile dni temu: ${ext?.postedDaysAgo || "nieznane"}
- Liczba otwartych ofert w tej firmie: ${ext?.openRoles || "nieznane"}
- Aktywność firmy na LinkedIn (nowi pracownicy): ${ext?.linkedinActivity || "nieznane"}`;

  return `Jesteś ekspertem od polskiego rynku pracy. Przeanalizuj ogłoszenie i oceń, czy to "ghost job" (oferta bez realnego zamiaru zatrudnienia).

WAŻNE: Bądź sceptyczny. Sama dobra treść ogłoszenia (ładny opis, stack, benefity) NIE wystarcza do oceny "realne" — wiele wydmuszek ma profesjonalny opis. Przy ocenie kryteriów dotyczących czasu wiszenia, liczby ofert i LinkedIna opieraj się WYŁĄCZNIE na sygnałach zewnętrznych poniżej. Jeśli sygnał jest "nieznane", oznacz to kryterium jako "yellow" (nie da się ocenić), a NIE "green".

ZASADY OCENY:
- "score" = liczba kryteriów ze statusem "red". Kryteria "yellow" NIE liczą się do score — oznaczają brak danych, nie podejrzaność.
- Kryterium "Za dużo otwartych ról" — duże firmy, agencje rekrutacyjne, outsourcing i body-leasing (np. ITDS, Hays, Randstad, Sii, Capgemini) naturalnie mają dziesiątki lub setki ofert — to NIE jest sygnał ghost job. Oznacz "red" TYLKO gdy mała/średnia firma ma nieproporcjonalnie dużo ofert (np. 20-osobowa firma z 50 ofertami). Jeśli firma jest duża lub to agencja — oznacz "green" z odpowiednim wyjaśnieniem.
- verdict: "safe" gdy score 0-1, "warning" gdy score 2-3, "danger" gdy score 4-6.

Oceń każde z 6 kryteriów. Odpowiedz TYLKO czystym JSON-em, bez markdown, bez backticków:
{
  "verdict": "safe" | "warning" | "danger",
  "score": liczba 0-6 (TYLKO czerwone kryteria),
  "verdictLabel": "krótki werdykt, max 5 słów",
  "summary": "2-3 zdania rekomendacji",
  "criteria": [
    {"name": "Ogłoszenie wisi długo / odnawia się", "status": "red"|"yellow"|"green", "reason": "1 zdanie"},
    {"name": "Opis bez konkretów", "status": "red"|"yellow"|"green", "reason": "1 zdanie"},
    {"name": "Brak widełek wynagrodzenia", "status": "red"|"yellow"|"green", "reason": "1 zdanie"},
    {"name": "Za dużo otwartych ról w firmie", "status": "red"|"yellow"|"green", "reason": "1 zdanie"},
    {"name": "Brak nowych pracowników na LinkedIn", "status": "red"|"yellow"|"green", "reason": "1 zdanie"},
    {"name": "Styl sugeruje pozorną rekrutację", "status": "red"|"yellow"|"green", "reason": "1 zdanie"}
  ]
}

Firma: ${company || "(nie podano)"}
${extBlock}

Ogłoszenie:
${jobText}`;
}
