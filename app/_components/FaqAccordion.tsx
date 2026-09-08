"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Czy Analyss na pewno wykryje wszystkie ghost joby?",
    a: "Nie ma stuprocentowej metody, ale nasza analiza 6 kryteriów wykrywa większość klasycznych wzorców. Traktuj wynik jak drugą opinię, nie wyrocznię.",
  },
  {
    q: "Skąd dane o firmie i LinkedIn?",
    a: "Te dane podajesz sam w formularzu (opcjonalnie). Analyss nie skanuje LinkedIna automatycznie — respektujemy prywatność i regulaminy platform.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Analizy zapisujemy tylko dla Ciebie, w bazie chronionej. Nie sprzedajemy danych, nie trenujemy na nich modeli.",
  },
  {
    q: "Co jeśli 3 analizy miesięcznie to za mało?",
    a: "Plan Pro znosi limit za 29 zł/mies. Możesz zrezygnować w każdej chwili.",
  },
  {
    q: "Kto stoi za Analyss?",
    a: "Niezależny polski projekt — narzędzie stworzone przez osoby, które same trafiały na ghost joby i miały dość.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {faqs.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--hero-card-bg)" }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
          >
            <span className="font-semibold text-[15px] text-white">
              {item.q}
            </span>
            <span
              className="shrink-0 transition-transform duration-200"
              style={{
                color: "var(--hero-muted)",
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 6l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--hero-muted)" }}>
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
