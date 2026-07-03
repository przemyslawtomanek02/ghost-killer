import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności – Analyss",
  description: "Polityka prywatności serwisu Analyss — jak zbieramy i przetwarzamy Twoje dane.",
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

export default function PrywatnoPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]">
      <nav className="max-w-3xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="text-sm text-[#57564F] hover:text-[#0A0A0A] transition-colors">
          ← Wróć
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 pb-24">
        <h1 className="text-[36px] font-black tracking-tight mb-2">Polityka prywatności</h1>
        <p className="text-[14px] text-[#9C9B93] mb-12">Ostatnia aktualizacja: 3 lipca 2025</p>

        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-[#0A0A0A] [&_h2]:text-[20px] [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-[#57564F] [&_p]:mb-4 [&_ul]:text-[#57564F] [&_ul]:mb-4 [&_ul]:pl-5 [&_li]:mb-1.5">

          <h2>1. Administrator danych</h2>
          <p>
            Administratorem Twoich danych osobowych jest osoba fizyczna prowadząca serwis
            <strong> Analyss</strong> (dalej: „Administrator"), kontakt:{" "}
            <a href="mailto:kontakt@analyss.pl" className="text-[#0A0A0A] font-semibold underline underline-offset-2">
              kontakt@analyss.pl
            </a>.
          </p>

          <h2>2. Jakie dane zbieramy</h2>
          <ul>
            <li><strong>Dane rejestracyjne:</strong> adres e-mail, nickname, zaszyfrowane hasło.</li>
            <li><strong>Dane analiz:</strong> fragmenty wklejonych ogłoszeń (pierwsze 200 znaków) oraz wynik analizy — przechowywane w celu wyświetlania historii.</li>
            <li><strong>Dane techniczne:</strong> adres IP (do rate-limitingu demo), logi błędów serwera niezbędne do utrzymania bezpieczeństwa i stabilności usługi.</li>
          </ul>
          <p>
            Nie zbieramy danych wrażliwych (art. 9 RODO). Nie profilujemy użytkowników
            w celach marketingowych. Nie sprzedajemy danych osobom trzecim.
          </p>

          <h2>3. Cel i podstawa prawna przetwarzania</h2>
          <ul>
            <li>
              <strong>Wykonanie umowy (art. 6 ust. 1 lit. b RODO):</strong> świadczenie usługi
              analizy ogłoszeń, zarządzanie kontem, wyświetlanie historii analiz.
            </li>
            <li>
              <strong>Uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO):</strong>
              {" "}bezpieczeństwo serwisu, wykrywanie nadużyć, rate-limiting.
            </li>
            <li>
              <strong>Obowiązek prawny (art. 6 ust. 1 lit. c RODO):</strong> przechowywanie
              danych wymagane przepisami prawa (np. księgowego w przypadku płatnych planów).
            </li>
          </ul>

          <h2>4. Okres przechowywania danych</h2>
          <ul>
            <li>Dane konta: do momentu usunięcia konta przez użytkownika lub przez Administratora.</li>
            <li>Historia analiz: 24 miesiące od daty analizy, chyba że konto zostanie wcześniej usunięte.</li>
            <li>Logi techniczne: do 90 dni.</li>
          </ul>

          <h2>5. Odbiorcy danych</h2>
          <p>
            Twoje dane mogą być przekazywane wyłącznie zaufanym podprocesorom, z którymi
            Administrator zawarł umowy powierzenia przetwarzania:
          </p>
          <ul>
            <li><strong>Supabase Inc.</strong> — baza danych i uwierzytelnianie (serwery w UE).</li>
            <li><strong>Google LLC (Gemini API)</strong> — model AI do analizy tekstu. Treść ogłoszenia jest przekazywana do API Google w celu wykonania analizy. Google przetwarza te dane zgodnie ze swoją polityką prywatności dla usług Google Cloud.</li>
            <li><strong>Vercel Inc.</strong> — hosting aplikacji.</li>
          </ul>

          <h2>6. Twoje prawa</h2>
          <p>Na podstawie RODO przysługują Ci następujące prawa:</p>
          <ul>
            <li><strong>Dostęp</strong> — możesz poprosić o kopię danych, które przechowujemy.</li>
            <li><strong>Sprostowanie</strong> — możesz poprosić o korektę nieprawidłowych danych.</li>
            <li><strong>Usunięcie</strong> — możesz zażądać usunięcia konta i powiązanych danych.</li>
            <li><strong>Ograniczenie przetwarzania</strong> — możesz zażądać wstrzymania przetwarzania w określonych sytuacjach.</li>
            <li><strong>Przenoszenie danych</strong> — możesz otrzymać dane w ustrukturyzowanym formacie.</li>
            <li><strong>Sprzeciw</strong> — możesz sprzeciwić się przetwarzaniu opartemu na uzasadnionym interesie.</li>
            <li><strong>Skarga do organu nadzorczego</strong> — możesz wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa.</li>
          </ul>
          <p>
            Aby skorzystać z powyższych praw, napisz na adres:{" "}
            <a href="mailto:kontakt@analyss.pl" className="text-[#0A0A0A] font-semibold underline underline-offset-2">
              kontakt@analyss.pl
            </a>. Odpowiemy w ciągu 30 dni.
          </p>

          <h2>7. Pliki cookie</h2>
          <p>
            Serwis używa wyłącznie technicznych plików cookie niezbędnych do działania
            sesji użytkownika (uwierzytelnianie Supabase). Nie używamy cookies śledzących
            ani marketingowych.
          </p>

          <h2>8. Bezpieczeństwo</h2>
          <p>
            Hasła są przechowywane wyłącznie w postaci zaszyfrowanego hasha (bcrypt).
            Połączenia z serwisem są szyfrowane protokołem TLS. Dostęp do bazy danych
            jest ograniczony regułami Row Level Security (RLS).
          </p>

          <h2>9. Zmiany polityki prywatności</h2>
          <p>
            O istotnych zmianach w polityce prywatności poinformujemy użytkowników
            posiadających konta drogą e-mailową na co najmniej 14 dni przed wprowadzeniem zmian.
          </p>

          <h2>10. Kontakt</h2>
          <p>
            Wszelkie pytania dotyczące przetwarzania danych osobowych prosimy kierować na:{" "}
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
            <Link href="/regulamin" className="hover:text-[#0A0A0A] transition-colors">Regulamin</Link>
            <Link href="/prywatnosc" className="font-semibold text-[#0A0A0A]">Prywatność</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
