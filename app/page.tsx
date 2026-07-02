import Link from "next/link";
import LiveDemo from "@/app/_components/LiveDemo";
import FaqAccordion from "@/app/_components/FaqAccordion";

// ── Shared ──────────────────────────────────────────────────────────────────

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

// ── 1. Nawigacja ─────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#ECEAE3]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#57564F]">
          <a href="#jak-dziala" className="hover:text-[#0A0A0A] transition-colors">Jak działa</a>
          <a href="#cennik" className="hover:text-[#0A0A0A] transition-colors">Cennik</a>
          <a href="#faq" className="hover:text-[#0A0A0A] transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[14px] font-medium text-[#57564F] hover:text-[#0A0A0A] transition-colors"
          >
            Zaloguj się
          </Link>
          <Link
            href="/register"
            className="text-[14px] font-semibold bg-black text-white rounded-full px-4 py-2 hover:bg-[#1a1a1a] transition-colors"
          >
            Wypróbuj za darmo
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── 2. Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
      <div className="inline-block text-[13px] font-semibold text-[#6B6A63] bg-white border border-[#ECEAE3] rounded-full px-4 py-1.5 mb-7">
        Co 5. oferta pracy w sieci to ghost job
      </div>

      <h1 className="text-[56px] md:text-[68px] font-black tracking-tight leading-[1.02] mb-6 max-w-3xl mx-auto">
        Nie trać czasu na oferty, których nie ma
      </h1>

      <p className="text-[18px] text-[#57564F] leading-relaxed max-w-[540px] mx-auto mb-10">
        Wydmuszka analizuje ogłoszenia w kilka sekund i mówi Ci wprost — warto
        aplikować czy to strata czasu.
      </p>

      <div className="flex flex-col items-center gap-3">
        <a
          href="#demo"
          className="inline-block px-8 py-4 rounded-xl bg-black text-white font-bold text-[16px] hover:bg-[#1a1a1a] transition-colors"
        >
          Sprawdź ofertę za darmo
        </a>
        <p className="text-[13px] text-[#9C9B93]">
          3 darmowe analizy miesięcznie · Bez karty
        </p>
      </div>
    </section>
  );
}

// ── 3. Statystyki ─────────────────────────────────────────────────────────────

function Stats() {
  const items = [
    {
      stat: "18–27%",
      desc: "ofert online to ghost joby",
      source: "Clarify Capital, 2024",
    },
    {
      stat: "43 dni",
      desc: "średni czas rekrutacji marnowany na fałszywe oferty w Polsce",
      source: "dane rynkowe",
    },
    {
      stat: "1 na 5",
      desc: "kandydatów aplikuje bez świadomości, że oferta nie prowadzi do zatrudnienia",
      source: "",
    },
  ];

  return (
    <section className="border-y border-[#ECEAE3] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-[32px] md:text-[40px] font-black tracking-tight mb-3">
            Ghost joby to nie mit
          </h2>
          <p className="text-[16px] text-[#57564F]">
            Badania rynku pracy pokazują skalę problemu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.stat} className="bg-[#FAFAF7] border border-[#ECEAE3] rounded-3xl p-7">
              <div className="text-[42px] font-black tracking-tight mb-2">{item.stat}</div>
              <p className="text-[15px] text-[#0A0A0A] font-medium leading-snug mb-2">{item.desc}</p>
              {item.source && (
                <p className="text-[12px] text-[#9C9B93]">{item.source}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 4. Live demo ──────────────────────────────────────────────────────────────

function DemoSection() {
  return (
    <section id="demo" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
          Live demo
        </div>
        <h2 className="text-[32px] md:text-[42px] font-black tracking-tight mb-3">
          Sprawdź teraz — bez rejestracji
        </h2>
        <p className="text-[16px] text-[#57564F] max-w-md mx-auto">
          Wklej treść ogłoszenia i zobacz jak działa Wydmuszka
        </p>
      </div>
      <LiveDemo />
    </section>
  );
}

// ── 5. Funkcje ────────────────────────────────────────────────────────────────

function Features() {
  const items = [
    {
      icon: "⏱️",
      title: "Wykrywa oferty-widma",
      desc: "Ogłoszenia, które wiszą miesiącami i wracają, mimo że nikt nie jest zatrudniany.",
    },
    {
      icon: "🔍",
      title: "Analizuje treść",
      desc: "Sprawdza konkrety: opis stanowiska, zespół, zadania. Wykrywa ogólniki i frazy szablonowe.",
    },
    {
      icon: "💬",
      title: "Ocenia transparentność",
      desc: "Widełki, forma zatrudnienia, informacje o rekruterze — czy firma niczego nie ukrywa.",
    },
    {
      icon: "📊",
      title: "Waży sygnały zewnętrzne",
      desc: "Aktywność firmy na LinkedIn, liczba jednoczesnych ofert, historia publikacji.",
    },
    {
      icon: "⚠️",
      title: "Wykrywa nierealne wymagania",
      desc: "5 lat doświadczenia w technologii istniejącej 3 lata? To znak.",
    },
    {
      icon: "📋",
      title: "Historia analiz",
      desc: "Wszystkie sprawdzone oferty w jednym miejscu — wracaj do nich kiedy chcesz.",
    },
  ];

  return (
    <section id="jak-dziala" className="bg-white border-y border-[#ECEAE3]">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
            Co potrafi Wydmuszka
          </div>
          <h2 className="text-[32px] md:text-[42px] font-black tracking-tight mb-3">
            6 sygnałów, 1 werdykt
          </h2>
          <p className="text-[16px] text-[#57564F] max-w-md mx-auto">
            Analiza oparta na najczęstszych wzorcach ghost jobów
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="border border-[#ECEAE3] rounded-3xl p-7 hover:bg-[#FAFAF7] transition-colors"
            >
              <div className="text-[30px] mb-4">{item.icon}</div>
              <h3 className="text-[16px] font-bold mb-2">{item.title}</h3>
              <p className="text-[14px] text-[#57564F] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 6. Cennik ─────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="cennik" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
          Cennik
        </div>
        <h2 className="text-[32px] md:text-[42px] font-black tracking-tight mb-3">
          Cena, która się zwraca
        </h2>
        <p className="text-[16px] text-[#57564F] max-w-md mx-auto">
          Jedna zaoszczędzona godzina na fałszywej aplikacji pokrywa miesiąc
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8 flex flex-col">
          <div className="text-[13px] font-bold text-[#6B6A63] mb-2">Darmowy</div>
          <div className="text-[44px] font-black tracking-tight leading-none mb-1">0 zł</div>
          <div className="text-[14px] text-[#9C9B93] mb-8">na zawsze</div>
          <ul className="flex flex-col gap-3 mb-8 flex-1">
            {[
              "3 analizy miesięcznie",
              "Pełen werdykt i 6 kryteriów",
              "Historia analiz",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#57564F]">
                <span className="text-[#16A34A] font-bold text-[16px]">✓</span>
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
        <div className="bg-[#FAFAF7] border-2 border-[#0A0A0A] rounded-3xl p-8 flex flex-col relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-black text-white text-[11px] font-bold rounded-full px-3 py-1 whitespace-nowrap">
              WKRÓTCE
            </span>
          </div>
          <div className="text-[13px] font-bold text-[#6B6A63] mb-2">Pro</div>
          <div className="text-[44px] font-black tracking-tight leading-none mb-1">29 zł</div>
          <div className="text-[14px] text-[#9C9B93] mb-8">/miesiąc</div>
          <ul className="flex flex-col gap-3 mb-8 flex-1">
            {[
              "Nielimitowane analizy",
              "Pełen werdykt i 6 kryteriów",
              "Historia analiz + eksport",
              "Priorytetowa analiza AI",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#57564F]">
                <span className="text-[#16A34A] font-bold text-[16px]">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register?plan=pro"
            className="block w-full py-3.5 rounded-xl bg-black text-white font-bold text-center text-[15px] hover:bg-[#1a1a1a] transition-colors"
          >
            Wybierz Pro
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── 7. FAQ ────────────────────────────────────────────────────────────────────

function Faq() {
  return (
    <section id="faq" className="bg-white border-y border-[#ECEAE3]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
            FAQ
          </div>
          <h2 className="text-[32px] md:text-[42px] font-black tracking-tight">
            Częste pytania
          </h2>
        </div>
        <FaqAccordion />
      </div>
    </section>
  );
}

// ── 8. CTA końcowe ────────────────────────────────────────────────────────────

function CtaFinal() {
  return (
    <section className="bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-[36px] md:text-[52px] font-black tracking-tight leading-tight mb-5">
          Przestań tracić czas
          <br />
          na ghost joby
        </h2>
        <p className="text-[17px] text-[#9C9B93] mb-10 max-w-md mx-auto">
          Sprawdź pierwsze ogłoszenie za darmo — bez karty, bez zobowiązań
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 rounded-xl bg-white text-black font-bold text-[16px] hover:bg-[#F5F4EF] transition-colors"
        >
          Zacznij za darmo →
        </Link>
      </div>
    </section>
  );
}

// ── 9. Stopka ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#ECEAE3] bg-[#FAFAF7]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-[13px] text-[#9C9B93]">© 2025 Wydmuszka</p>
        <nav className="flex items-center gap-5 text-[13px] text-[#6B6A63]">
          <a href="#" className="hover:text-[#0A0A0A] transition-colors">Regulamin</a>
          <a href="#" className="hover:text-[#0A0A0A] transition-colors">Prywatność</a>
          <a href="#" className="hover:text-[#0A0A0A] transition-colors">Kontakt</a>
        </nav>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="bg-[#FAFAF7] text-[#0A0A0A]"
      style={{ fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif" }}
    >
      <Nav />
      <Hero />
      <Stats />
      <DemoSection />
      <Features />
      <Pricing />
      <Faq />
      <CtaFinal />
      <Footer />
    </div>
  );
}
