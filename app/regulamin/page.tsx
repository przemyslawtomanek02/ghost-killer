import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin – Analyss",
  description: "Regulamin korzystania z serwisu Analyss.",
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-[9px] text-white flex items-center justify-center font-black text-[17px]"
        style={{ background: "linear-gradient(135deg, #7C6FE8, #F27C5E)" }}
      >
        A
      </div>
      <span className="font-bold text-[19px] tracking-tight">Analyss</span>
    </div>
  );
}

export default function ReguaminPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]">
      <nav className="max-w-3xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="text-sm text-[#57564F] hover:text-[#0A0A0A] transition-colors">
          ← Wróć
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 pb-24">
        <h1 className="text-[36px] font-black tracking-tight mb-2">Regulamin</h1>
        <p className="text-[14px] text-[#9C9B93] mb-12">Ostatnia aktualizacja: 3 lipca 2025</p>

        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-[#0A0A0A] [&_h2]:text-[20px] [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-[#57564F] [&_p]:mb-4 [&_ul]:text-[#57564F] [&_ul]:mb-4 [&_ul]:pl-5 [&_li]:mb-1.5">

          <h2>§1 Postanowienia ogólne</h2>
          <p>
            Niniejszy Regulamin określa zasady korzystania z serwisu internetowego <strong>Analyss</strong>
            {" "}dostępnego pod adresem analyss.pl (dalej: „Serwis"), prowadzonego przez osobę fizyczną
            prowadzącą działalność na terenie Rzeczypospolitej Polskiej (dalej: „Operator").
          </p>
          <p>
            Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu w całości.
            Jeżeli nie akceptujesz któregokolwiek z postanowień, zaprzestań korzystania z Serwisu.
          </p>

          <h2>§2 Opis usługi</h2>
          <p>
            Serwis Analyss umożliwia analizę ogłoszeń o pracę pod kątem cech charakterystycznych
            dla tzw. „ghost jobów" — ofert publikowanych bez realnego procesu rekrutacyjnego.
            Analiza jest przeprowadzana przy użyciu modelu językowego (AI) i ma charakter
            <strong> wyłącznie informacyjny</strong>. Nie stanowi porady prawnej, zawodowej ani
            gwarancji co do charakteru danego ogłoszenia.
          </p>

          <h2>§3 Konto użytkownika</h2>
          <ul>
            <li>Rejestracja konta jest dobrowolna, lecz wymagana do korzystania z pełnej funkcjonalności Serwisu.</li>
            <li>Użytkownik zobowiązuje się podać prawdziwe dane przy rejestracji.</li>
            <li>Użytkownik jest odpowiedzialny za poufność danych logowania i wszelkie działania podjęte na jego koncie.</li>
            <li>Operator zastrzega sobie prawo do zablokowania konta w przypadku naruszenia Regulaminu.</li>
          </ul>

          <h2>§4 Plan darmowy i limity</h2>
          <p>
            Bezpłatny plan obejmuje 3 analizy w każdym miesiącu kalendarzowym. Licznik resetuje się
            pierwszego dnia każdego miesiąca. Operator zastrzega sobie prawo do zmiany liczby
            bezpłatnych analiz z zachowaniem 14-dniowego okresu powiadomienia użytkowników.
          </p>

          <h2>§5 Zakazy i ograniczenia</h2>
          <p>Zabrania się:</p>
          <ul>
            <li>Używania Serwisu do celów niezgodnych z prawem polskim lub unijnym.</li>
            <li>Automatycznego wysyłania zapytań (botów, scraperów) bez zgody Operatora.</li>
            <li>Próby obejścia limitów analiz (np. przez tworzenie wielu kont).</li>
            <li>Udostępniania konta osobom trzecim.</li>
          </ul>

          <h2>§6 Prawa własności intelektualnej</h2>
          <p>
            Wszelkie elementy graficzne, kody źródłowe, logotypy i treści Serwisu stanowią własność
            Operatora i podlegają ochronie prawnoautorskiej. Wyniki analiz wygenerowane dla
            konkretnego użytkownika należą do tego użytkownika.
          </p>

          <h2>§7 Wyłączenie odpowiedzialności</h2>
          <p>
            Operator nie ponosi odpowiedzialności za decyzje podjęte przez użytkownika na podstawie
            wyników analizy. Serwis nie zastępuje oceny własnej użytkownika ani porady specjalisty
            ds. rekrutacji. Wyniki mogą zawierać błędy wynikające z ograniczeń modeli AI.
          </p>
          <p>
            Operator nie gwarantuje nieprzerwanej dostępności Serwisu i zastrzega prawo do
            przerw technicznych.
          </p>

          <h2>§8 Zmiany Regulaminu</h2>
          <p>
            Operator zastrzega sobie prawo do zmiany niniejszego Regulaminu. O zmianach
            użytkownicy posiadający konta zostaną poinformowani e-mailem na co najmniej 14 dni
            przed wejściem zmian w życie. Dalsze korzystanie z Serwisu po tej dacie oznacza
            akceptację nowego Regulaminu.
          </p>

          <h2>§9 Prawo właściwe</h2>
          <p>
            Regulamin podlega prawu polskiemu. Wszelkie spory będą rozstrzygane przez sąd właściwy
            dla siedziby Operatora.
          </p>

          <h2>§10 Kontakt</h2>
          <p>
            W sprawach dotyczących Regulaminu prosimy o kontakt pod adresem:{" "}
            <a href="mailto:kontakt@analyss.pl" className="text-[#0A0A0A] font-semibold underline underline-offset-2">
              kontakt@analyss.pl
            </a>
          </p>
        </div>
      </main>

      <footer className="border-t border-[#ECEAE3] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-[#9C9B93]">© 2025 Analyss</p>
          <nav className="flex items-center gap-5 text-[13px] text-[#6B6A63]">
            <Link href="/regulamin" className="font-semibold text-[#0A0A0A]">Regulamin</Link>
            <Link href="/prywatnosc" className="hover:text-[#0A0A0A] transition-colors">Prywatność</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
