"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[9px] bg-black text-white flex items-center justify-center font-black text-[17px]">
        W
      </div>
      <span className="font-bold text-[19px] tracking-tight">Wydmuszka</span>
    </div>
  );
}

function Nav({ authed }: { authed: boolean | null }) {
  return (
    <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <Link href="/">
        <Logo />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#57564F]">
        <a href="#jak-to-dziala" className="hover:text-[#0A0A0A] transition-colors">
          Jak to działa
        </a>
        <a href="#cennik" className="hover:text-[#0A0A0A] transition-colors">
          Cennik
        </a>
      </div>

      <div className="flex items-center gap-3">
        {authed === true ? (
          <Link
            href="/app"
            className="text-sm font-semibold bg-black text-white rounded-full px-5 py-2.5"
          >
            Przejdź do analizy
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold border border-[#ECEAE3] bg-white rounded-full px-4 py-2 hover:bg-[#F5F4EF] transition-colors"
            >
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-black text-white rounded-full px-4 py-2 hover:bg-[#1a1a1a] transition-colors"
            >
              Zarejestruj się
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const criteria = [
  {
    icon: "⏳",
    name: "Czas wiszenia ogłoszenia",
    desc: "Oferty odświeżane co kilka tygodni bez postępów rekrutacji to klasyczny sygnał wydmuszki.",
  },
  {
    icon: "📋",
    name: "Opis bez konkretów",
    desc: "Ogólnikowe wymagania i benefity copy-paste zamiast realnych oczekiwań projektu.",
  },
  {
    icon: "💰",
    name: "Brak widełek wynagrodzenia",
    desc: "Ukryta płaca często oznacza, że firma nie planuje realnie zatrudniać.",
  },
  {
    icon: "📊",
    name: "Nadmiar otwartych ról",
    desc: "Kilkadziesiąt aktywnych ofert naraz? To częsty patent na budowanie bazy CV.",
  },
  {
    icon: "🔗",
    name: "Aktywność na LinkedIn",
    desc: "Brak nowych pracowników przy dziesiątkach ofert to poważna czerwona flaga.",
  },
  {
    icon: "🎭",
    name: "Styl sugeruje pozorność",
    desc: "AI wychwytuje wzorce językowe charakterystyczne dla pozornych rekrutacji.",
  },
];

const steps = [
  {
    num: "01",
    title: "Wklej ogłoszenie",
    desc: "Skopiuj całą treść oferty pracy z dowolnego portalu.",
  },
  {
    num: "02",
    title: "AI analizuje 6 sygnałów",
    desc: "Gemini sprawdza każde kryterium i ocenia prawdopodobieństwo wydmuszki.",
  },
  {
    num: "03",
    title: "Dostajesz werdykt",
    desc: "Jasna ocena: bezpieczne, uwaga lub niebezpieczne — w kilka sekund.",
  },
];

export default function LandingPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setAuthed(!!data.user));
  }, []);

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]"
      style={{ fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif" }}
    >
      <Nav authed={authed} />

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-block text-[13px] font-semibold text-[#6B6A63] bg-white border border-[#ECEAE3] rounded-full px-3.5 py-1.5 mb-6">
          AI-powered detekcja ghost jobów
        </div>

        <h1 className="text-[56px] md:text-[72px] font-black tracking-tight leading-[1.02] mb-6 max-w-3xl mx-auto">
          Nie trać czasu
          <br />
          na wydmuszki
        </h1>

        <p className="text-[19px] text-[#57564F] leading-relaxed max-w-[560px] mx-auto mb-10">
          Sprawdź w kilka sekund, czy oferta pracy jest autentyczna — zanim
          wyślesz CV i zaczniesz się ekscytować.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={authed ? "/app" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black text-white font-bold text-[16px] hover:bg-[#1a1a1a] transition-colors"
          >
            Zacznij za darmo →
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#ECEAE3] bg-white font-semibold text-[16px] hover:bg-[#F5F4EF] transition-colors"
          >
            Zaloguj się
          </Link>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[#ECEAE3] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#ECEAE3]">
          {[
            { stat: "1 na 5", label: "ofert to wydmuszka" },
            { stat: "6 sygnałów", label: "AI analizuje jednocześnie" },
            { stat: "< 5 sek.", label: "czas do werdyktu" },
          ].map((item) => (
            <div key={item.stat} className="text-center px-6 py-4 sm:py-0">
              <div className="text-[28px] font-black tracking-tight">{item.stat}</div>
              <div className="text-[14px] text-[#6B6A63] mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── JAK TO DZIAŁA ── */}
      <section id="jak-to-dziala" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
            Jak to działa
          </div>
          <h2 className="text-[38px] md:text-[48px] font-black tracking-tight leading-tight">
            Trzy kroki do werdyktu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white border border-[#ECEAE3] rounded-3xl p-7"
            >
              <div className="text-[13px] font-black tracking-widest text-[#BFBDB6] mb-4">
                {step.num}
              </div>
              <h3 className="text-[20px] font-black tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="text-[15px] text-[#57564F] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6 KRYTERIÓW ── */}
      <section className="bg-white border-y border-[#ECEAE3]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
              Co sprawdzamy
            </div>
            <h2 className="text-[38px] md:text-[48px] font-black tracking-tight leading-tight">
              6 sygnałów ghost joba
            </h2>
            <p className="text-[17px] text-[#57564F] mt-4 max-w-lg mx-auto">
              AI analizuje każde kryterium osobno i wystawia werdykt dla całej
              oferty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {criteria.map((c) => (
              <div
                key={c.name}
                className="border border-[#ECEAE3] rounded-2xl p-6 hover:bg-[#FAFAF7] transition-colors"
              >
                <div className="text-[28px] mb-3">{c.icon}</div>
                <h3 className="text-[16px] font-bold mb-1.5">{c.name}</h3>
                <p className="text-[14px] text-[#57564F] leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CENNIK ── */}
      <section id="cennik" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
            Cennik
          </div>
          <h2 className="text-[38px] md:text-[48px] font-black tracking-tight leading-tight">
            Prosto i uczciwie
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8">
            <div className="text-[13px] font-bold text-[#6B6A63] mb-2">
              Darmowy
            </div>
            <div className="text-[42px] font-black tracking-tight mb-1">
              0 zł
            </div>
            <div className="text-[14px] text-[#6B6A63] mb-7">na zawsze</div>
            <ul className="space-y-3 mb-8 text-[15px]">
              {[
                "3 analizy miesięcznie",
                "Wszystkie 6 kryteriów",
                "Werdykt + podsumowanie",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[#57564F]">
                  <span className="text-[#16A34A] font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full py-3.5 rounded-xl border border-[#ECEAE3] font-semibold text-center text-[15px] hover:bg-[#F5F4EF] transition-colors"
            >
              Zacznij za darmo
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-black text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[11px] font-bold bg-white text-black rounded-full px-2.5 py-1">
              WKRÓTCE
            </div>
            <div className="text-[13px] font-bold text-[#9C9B93] mb-2">Pro</div>
            <div className="text-[42px] font-black tracking-tight mb-1">
              29 zł
            </div>
            <div className="text-[14px] text-[#9C9B93] mb-7">/miesiąc</div>
            <ul className="space-y-3 mb-8 text-[15px]">
              {[
                "Nielimitowane analizy",
                "Historia wszystkich analiz",
                "Priorytetowa kolejka AI",
                "Wsparcie e-mail",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[#D4D3CC]">
                  <span className="text-[#4ADE80] font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="block w-full py-3.5 rounded-xl bg-white/10 font-semibold text-center text-[15px] cursor-not-allowed opacity-60"
            >
              Niedługo dostępne
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-[38px] md:text-[52px] font-black tracking-tight leading-tight mb-5">
            Przestań strzelać w ciemno
          </h2>
          <p className="text-[17px] text-[#9C9B93] mb-10 max-w-md mx-auto">
            Dołącz do osób, które sprawdzają oferty zanim wyślą CV. Pierwsze 3
            analizy za darmo.
          </p>
          <Link
            href={authed ? "/app" : "/register"}
            className="inline-block px-10 py-4 rounded-xl bg-white text-black font-bold text-[16px] hover:bg-[#F5F4EF] transition-colors"
          >
            Zacznij za darmo →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#ECEAE3] bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="text-[13px] text-[#9C9B93]">
            © 2025 Wydmuszka. Wszystkie prawa zastrzeżone.
          </div>
          <div className="flex items-center gap-5 text-[13px] text-[#6B6A63]">
            <Link href="/login" className="hover:text-[#0A0A0A] transition-colors">
              Zaloguj się
            </Link>
            <Link href="/register" className="hover:text-[#0A0A0A] transition-colors">
              Zarejestruj się
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
