import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analyss – sprawdź czy oferta pracy to ghost job",
  description:
    "Wklej ogłoszenie o pracę i dowiedz się w kilka sekund, czy to autentyczna rekrutacja czy ghost job. AI analizuje 6 sygnałów.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
