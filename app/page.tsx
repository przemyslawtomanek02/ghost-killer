"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { createClient } from "@/lib/supabase/client";
import LiveDemo from "@/app/_components/LiveDemo";
import FaqAccordion from "@/app/_components/FaqAccordion";

// ── Shared ──────────────────────────────────────────────────────────────────

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

// ── 1. Nawigacja (nowy dark hero — test screena) ─────────────────────────────

// Wspólny styl przycisków CTA: 6px radius, Helvetica Bold 16px, tracking -5%
const ctaBtnClass =
  "font-bold text-[16px] tracking-[-0.05em] text-white rounded-[6px] hover:brightness-110 transition-all";

function HeroNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setLoggedIn(true);
      });
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    setLoggedIn(false);
    router.refresh();
  }

  return (
    <header className="relative z-20 px-6 md:px-10 py-7">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-bold text-[21px] tracking-tight text-white"
        >
          Analyss
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#B4B4BC]">
          <a href="#jak-dziala" className="hover:text-white transition-colors">
            Jak to działa?
          </a>
          <a href="#cennik" className="hover:text-white transition-colors">
            Cennik
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {loggedIn ? (
            <>
              <Link
                href="/app"
                className={`${ctaBtnClass} px-5 py-2.5`}
                style={{ background: "var(--color-accent)" }}
              >
                Otwórz apkę
              </Link>
              <button
                onClick={logout}
                className="text-[15px] font-medium text-[#B4B4BC] hover:text-white transition-colors"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[15px] font-medium text-[#B4B4BC] hover:text-white transition-colors"
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className={`${ctaBtnClass} px-5 py-2.5`}
                style={{ background: "var(--color-accent)" }}
              >
                Wypróbuj za darmo
              </Link>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          className="md:hidden flex flex-col items-center justify-center gap-[5px] w-9 h-9 shrink-0 rounded-xl hover:bg-white/5 transition-colors"
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0, y: open ? 6.5 : 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="block w-[18px] h-[1.5px] bg-white rounded-full origin-center"
          />
          <motion.span
            animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
            transition={{ duration: 0.18 }}
            className="block w-[18px] h-[1.5px] bg-white rounded-full"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? -6.5 : 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="block w-[18px] h-[1.5px] bg-white rounded-full origin-center"
          />
        </button>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="md:hidden mt-4 max-w-6xl mx-auto rounded-2xl overflow-hidden border"
            style={{
              background: "var(--hero-card-bg)",
              borderColor: "var(--hero-border)",
            }}
          >
            <nav className="flex flex-col p-3 gap-1">
              {[
                { href: "#jak-dziala", label: "Jak to działa?" },
                { href: "#cennik", label: "Cennik" },
                { href: "#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-[15px] font-medium text-[#B4B4BC] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  {label}
                </a>
              ))}

              <div className="h-px bg-white/10 mx-1 my-1" />

              {loggedIn ? (
                <>
                  <Link
                    href="/app"
                    onClick={() => setOpen(false)}
                    className={`${ctaBtnClass} mt-1 mx-1 px-4 py-3.5 text-center`}
                    style={{ background: "var(--color-accent)" }}
                  >
                    Otwórz apkę
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="px-4 py-3 text-[15px] font-medium text-[#B4B4BC] hover:text-white rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-[#B4B4BC] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className={`${ctaBtnClass} mt-1 mx-1 px-4 py-3.5 text-center`}
                    style={{ background: "var(--color-accent)" }}
                  >
                    Wypróbuj za darmo
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Floating Job Card (dark) — przeniesiona w obszar gradientu ───────────────

function FloatingCardDark({
  title,
  badge,
  badgeStyle,
  ghostBadge,
  width,
  height,
  rotate,
  duration,
  delay,
  style,
}: {
  title: string;
  badge: string;
  badgeStyle?: React.CSSProperties;
  ghostBadge?: boolean;
  width: number;
  height: number;
  rotate: number;
  duration: number;
  delay: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute hidden md:block rounded-2xl p-4 border"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotate}deg)`,
        background: "var(--hero-card-bg)",
        borderColor: "var(--hero-border)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        opacity: 0.92,
        zIndex: 1,
        ...style,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="font-bold text-[13px] text-white">{title}</div>
        {ghostBadge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 shrink-0 ml-2">
            Ghost job?
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="h-2 bg-white/10 rounded-full w-full" />
        <div className="h-2 bg-white/10 rounded-full w-[80%]" />
        <div className="h-2 bg-white/10 rounded-full w-[60%]" />
      </div>
      <div className="absolute bottom-3.5 left-4">
        <span
          className="text-[10px] font-semibold px-2 py-1 rounded-full"
          style={
            badgeStyle ?? {
              background: "rgba(255,255,255,0.08)",
              color: "#B4B4BC",
            }
          }
        >
          {badge}
        </span>
      </div>
    </motion.div>
  );
}

// ── 2. Hero (nowy dark styl — test screena) ──────────────────────────────────

type HeroDemoResult = {
  verdict: "safe" | "warning" | "danger";
  score: number;
  verdictLabel: string;
  summary: string;
};

const heroVerdictColor: Record<string, string> = {
  safe: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

function HeroDark() {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HeroDemoResult | null>(null);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  async function analyze() {
    const text = jobText.trim();
    if (text.length < 80) {
      setError("Wklej dłuższe ogłoszenie (min. 80 znaków).");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setLimitReached(false);

    try {
      const res = await fetch("/api/analyze-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText: text }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setLimitReached(true);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak. Spróbuj ponownie.");
        return;
      }
      setResult(data);
    } catch {
      setError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden hero-dark-bg">
      <HeroNav />

      {/* Pływające karty — przeniesione w dolną część, tam gdzie jest gradient */}
      <FloatingCardDark
        title="Senior Developer"
        badge="TechCorp • Warszawa"
        width={260}
        height={170}
        rotate={-4}
        duration={4}
        delay={0}
        style={{ left: "calc(50% - 660px)", bottom: "260px" }}
      />
      <FloatingCardDark
        title="UX Designer"
        badge="UXLab • Kraków"
        ghostBadge
        width={210}
        height={135}
        rotate={3}
        duration={3}
        delay={0.5}
        style={{ right: "calc(50% - 640px)", bottom: "300px" }}
      />
      <FloatingCardDark
        title="Product Manager"
        badge="Remote"
        width={260}
        height={170}
        rotate={-2}
        duration={5}
        delay={1}
        style={{ left: "calc(50% - 600px)", bottom: "20px" }}
      />
      <FloatingCardDark
        title="Sales Representative"
        badge="42 dni temu"
        badgeStyle={{ background: "var(--hero-blue)", color: "white" }}
        width={210}
        height={135}
        rotate={5}
        duration={3.5}
        delay={1.5}
        style={{ right: "calc(50% - 580px)", bottom: "40px" }}
      />

      {/* Main content */}
      <div
        className="relative w-full max-w-3xl mx-auto px-6 pt-6 pb-48 md:pb-64 text-center"
        style={{ zIndex: 2 }}
      >
        <div
          className="text-[12px] font-bold uppercase tracking-[0.14em] mb-6"
          style={{ color: "var(--hero-blue)" }}
        >
          Co 5. oferta pracy w sieci może być ghost jobem
        </div>

        <h1 className="text-[38px] sm:text-[46px] md:text-[52px] font-normal tracking-[-0.05em] leading-[1.05] text-white mb-6">
          Nie trać czasu na oferty,
          <br />
          które nie ma
        </h1>

        <p
          className="text-[16px] md:text-[17px] leading-relaxed max-w-[500px] mx-auto mb-10"
          style={{ color: "var(--hero-muted)" }}
        >
          Analyss analizuje ogłoszenia w kilka sekund i mówi Ci wprost: warto
          aplikować czy to strata czasu.
        </p>

        <div
          className="relative max-w-xl mx-auto rounded-2xl p-px overflow-hidden"
          style={{ background: "var(--hero-border)" }}
        >
          {/* Jeżdżący błysk światła — obraca się pod treścią, prześwituje tylko na 1px ramce */}
          <motion.div
            className="absolute inset-[-60%] pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, transparent 85%, rgba(255,255,255,0.95) 90%, var(--hero-blue) 95%, transparent 100%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Treść */}
          <div
            className="relative rounded-[15px] text-left"
            style={{ background: "var(--hero-card-bg)" }}
          >
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Wklej treść ogłoszenia"
              rows={5}
              disabled={loading}
              className="w-full bg-transparent text-white placeholder:text-[#5C5C66] text-[14px] resize-none outline-none p-4 pb-14"
            />
            <button
              onClick={analyze}
              disabled={loading}
              className={`${ctaBtnClass} absolute bottom-3 right-3 px-4 py-2 disabled:opacity-50`}
              style={{ background: "var(--color-accent)" }}
            >
              {loading ? "Analizuję…" : "Sprawdź ofertę"}
            </button>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-400 mt-3">{error}</p>}

        {limitReached && (
          <div
            className="max-w-xl mx-auto mt-4 rounded-2xl border p-5 text-left"
            style={{
              background: "var(--hero-card-bg)",
              borderColor: "var(--hero-border)",
            }}
          >
            <p className="text-[14px] text-white font-semibold mb-1">
              Limit demo wyczerpany
            </p>
            <p
              className="text-[13px] mb-4"
              style={{ color: "var(--hero-muted)" }}
            >
              Zarejestruj się, aby otrzymać 3 analizy miesięcznie.
            </p>
            <Link
              href="/register"
              className={`${ctaBtnClass} inline-block px-4 py-2.5`}
              style={{ background: "var(--color-accent)" }}
            >
              Załóż darmowe konto
            </Link>
          </div>
        )}

        {result && (
          <div
            className="max-w-xl mx-auto mt-4 rounded-2xl border p-5 text-left"
            style={{
              background: "var(--hero-card-bg)",
              borderColor: "var(--hero-border)",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[15px] font-bold text-white">
                {result.verdictLabel}
              </span>
              <span
                className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: heroVerdictColor[result.verdict] ?? "#fff",
                }}
              >
                {result.score}/6
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed mb-4"
              style={{ color: "var(--hero-muted)" }}
            >
              {result.summary}
            </p>
            <Link
              href="/register"
              className={`${ctaBtnClass} inline-block px-4 py-2`}
              style={{ background: "var(--color-accent)" }}
            >
              Załóż darmowe konto
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 3. Statystyki ─────────────────────────────────────────────────────────────

const statsItems = [
  {
    stat: "18–27%",
    label: "ofert to ghost joby",
    desc: "ofert online to ogłoszenia bez realnego procesu rekrutacji",
    source: "Clarify Capital, 2024",
  },
  {
    stat: "43 dni",
    label: "marnowane na szukanie",
    desc: "tyle traci przeciętny kandydat aplikując na fałszywe oferty w Polsce",
    source: "dane rynkowe",
  },
  {
    stat: "1 na 5",
    label: "kandydatów nie wie",
    desc: "osób wysyła CV nie świadomych, że oferta nie prowadzi do zatrudnienia",
    source: "",
  },
];

function Stats() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        {/* Header row — split layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase mb-4"
              style={{ color: "var(--hero-muted)" }}
            >
              <span
                className="w-4 h-[1.5px] rounded-full inline-block"
                style={{ background: "var(--color-accent)" }}
              />
              Skala problemu
            </div>
            <h2 className="text-[42px] md:text-[60px] font-black tracking-[-0.03em] leading-[1.02] text-white">
              Ghost joby
              <br />
              to nie mit
            </h2>
          </div>
          <p
            className="text-[15px] leading-relaxed max-w-[260px] md:text-right md:pb-1"
            style={{ color: "var(--hero-muted)" }}
          >
            Badania rynku pracy
            <br className="hidden md:block" /> pokazują skalę problemu
          </p>
        </div>

        {/* Thin rule */}
        <div className="h-px mb-14" style={{ background: "var(--hero-border)" }} />

        {/* Big stat columns */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {statsItems.map((item, i) => (
            <div
              key={item.stat}
              className={[
                "py-10 md:py-0",
                i === 0 ? "md:pr-14 border-b md:border-b-0 md:border-r" : "",
                i === 1 ? "md:px-14 border-b md:border-b-0 md:border-r" : "",
                i === 2 ? "md:pl-14" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ borderColor: "var(--hero-border)" }}
            >
              {/* The giant number */}
              <div className="text-[80px] md:text-[104px] lg:text-[120px] font-black tracking-[-0.04em] leading-[0.82] mb-3 text-white">
                {item.stat}
              </div>

              {/* Accent underbar */}
              <div
                className="w-14 h-[3px] rounded-full mb-5"
                style={{ background: "var(--color-accent)" }}
              />

              {/* Label */}
              <div
                className="text-[11px] font-bold tracking-[0.09em] uppercase mb-3"
                style={{ color: "var(--color-accent)" }}
              >
                {item.label}
              </div>

              {/* Description */}
              <p
                className="text-[14px] leading-[1.65] max-w-[220px]"
                style={{ color: "var(--hero-muted)" }}
              >
                {item.desc}
              </p>

              {/* Source */}
              {item.source && (
                <p
                  className="text-[11px] font-medium mt-3 tracking-wide"
                  style={{ color: "var(--hero-muted)", opacity: 0.7 }}
                >
                  {item.source}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ── 4. Live demo ──────────────────────────────────────────────────────────────

function DemoSection() {
  return (
    <motion.section
      id="demo"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{ opacity: 0.9 }}
      />

      {/* Content */}
      <div
        className="relative max-w-6xl mx-auto px-6 py-20"
        style={{ zIndex: 1 }}
      >
        <div className="text-center mb-12">
          <div
            className="inline-block text-[12px] font-bold tracking-widest uppercase mb-4 rounded-full px-4 py-1.5"
            style={{
              background: "rgba(255,255,255,0.7)",
              color: "#57564F",
              backdropFilter: "blur(8px)",
            }}
          >
            Live demo
          </div>
          <h2 className="text-[36px] md:text-[54px] font-black tracking-[-0.02em] leading-[1.08] mb-3 text-[#0A0A0A]">
            Sprawdź teraz — bez rejestracji
          </h2>
          <p className="text-[16px] text-[#57564F] max-w-md mx-auto">
            Wklej treść ogłoszenia i zobacz jak działa Analyss
          </p>
        </div>
        <LiveDemo />
      </div>
    </motion.section>
  );
}

// ── 5. Funkcje ────────────────────────────────────────────────────────────────

// SVG icons — Heroicons stroke style, 20×20 in 24-unit viewBox
function IcoGhost() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a8 8 0 0 1 8 8v10l-3-2.5-2.5 2-2.5-2-2.5 2L9 17.5 6 20V10A8 8 0 0 1 12 2z" />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoFileSearch() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <circle cx="11" cy="15" r="2.5" />
      <path d="m13 17 1.5 1.5" />
    </svg>
  );
}
function IcoEye() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IcoActivity() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IcoCircleX() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}
function IcoHistory() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 2.7-6.4L3 3v6h6" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

// Icon container
function IconPill({
  children,
  bg,
  color,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: bg, color }}
    >
      {children}
    </div>
  );
}

// Small feature card
function FeatureCard({
  tag,
  tagColor,
  title,
  desc,
  icon,
  iconBg,
  iconColor,
}: {
  tag: string;
  tagColor: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="lg:col-span-2 rounded-2xl p-7 flex flex-col gap-4 transition-colors duration-300"
      style={{ background: "var(--hero-card-bg)" }}
    >
      <IconPill bg={iconBg} color={iconColor}>
        {icon}
      </IconPill>
      <div>
        <div
          className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1.5"
          style={{ color: tagColor }}
        >
          {tag}
        </div>
        <h3 className="text-[15px] font-bold tracking-tight text-white mb-1.5 leading-snug">
          {title}
        </h3>
        <p className="text-[13px] leading-[1.65]" style={{ color: "var(--hero-muted)" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

// Ghost jobs detected in the hero card — mini UI mock
const ghostJobsMock = [
  {
    role: "Senior Developer",
    company: "TechCorp",
    days: "127 dni",
    ghost: true,
  },
  { role: "Marketing Lead", company: "BrandCo", days: "4 dni", ghost: false },
  { role: "QA Engineer", company: "Allegro", days: "91 dni", ghost: true },
  { role: "UX Designer", company: "UXLab", days: "12 dni", ghost: false },
];

// History rows for the last card — mini UI mock
const historyMock = [
  {
    role: "Senior Developer • TechCorp",
    verdict: "danger",
    label: "Widmo",
    date: "wczoraj",
  },
  {
    role: "UX Designer • UXLab",
    verdict: "safe",
    label: "OK",
    date: "2 dni temu",
  },
  {
    role: "PM • StartupXYZ",
    verdict: "warning",
    label: "Uwaga",
    date: "5 dni temu",
  },
];
const historyColor: Record<string, { bg: string; text: string }> = {
  danger: { bg: "rgba(220,38,38,0.14)", text: "#F87171" },
  safe: { bg: "rgba(22,163,74,0.14)", text: "#4ADE80" },
  warning: { bg: "rgba(217,119,6,0.14)", text: "#FBBF24" },
};

function Features() {
  return (
    <motion.section
      id="jak-dziala"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Section header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase mb-5"
            style={{ color: "var(--hero-muted)" }}
          >
            <span
              className="w-4 h-[1.5px] rounded-full inline-block"
              style={{ background: "var(--color-accent)" }}
            />
            Co potrafi Analyss
            <span
              className="w-4 h-[1.5px] rounded-full inline-block"
              style={{ background: "var(--color-accent)" }}
            />
          </div>
          <h2 className="text-[36px] md:text-[56px] font-black tracking-[-0.02em] leading-[1.05] mb-4 text-white">
            6 sygnałów, <span style={{ color: "var(--color-accent)" }}>1 werdykt</span>
          </h2>
          <p
            className="text-[16px] max-w-[400px] mx-auto leading-relaxed"
            style={{ color: "var(--hero-muted)" }}
          >
            Analiza oparta na najczęstszych wzorcach ghost jobów
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* ── Card 1 — large hero card ────────────────────────────────── */}
          <div
            className="lg:col-span-4 rounded-2xl p-8 relative overflow-hidden"
            style={{ background: "var(--hero-card-bg)" }}
          >
            {/* Background glow */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(24,119,242,0.16) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <IconPill bg="var(--color-accent-muted)" color="var(--color-accent)">
                <IcoGhost />
              </IconPill>
              <div>
                <div
                  className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  Detekcja
                </div>
                <h3 className="text-[20px] font-bold tracking-tight text-white leading-snug">
                  Wykrywa oferty-widma
                </h3>
              </div>
            </div>

            <p className="text-[14px] leading-[1.65] mb-7 max-w-xs" style={{ color: "var(--hero-muted)" }}>
              Ogłoszenia, które wiszą miesiącami i wracają, mimo że nikt nie
              jest zatrudniany.
            </p>

            {/* Mini job list mock */}
            <div className="flex flex-col gap-2">
              {ghostJobsMock.map((job) => (
                <div
                  key={job.role}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: job.ghost ? "#F87171" : "#4ADE80" }}
                    />
                    <span className="text-[12px] font-medium text-white">
                      {job.role}
                    </span>
                    <span
                      className="text-[11px] hidden sm:inline"
                      style={{ color: "var(--hero-muted)" }}
                    >
                      · {job.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px]" style={{ color: "var(--hero-muted)" }}>
                      {job.days}
                    </span>
                    {job.ghost && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide"
                        style={{ background: "rgba(220,38,38,0.16)", color: "#F87171" }}
                      >
                        WIDMO
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Card 2 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Analiza"
            tagColor="var(--color-accent)"
            title="Analizuje treść ogłoszenia"
            desc="Sprawdza konkrety: opis stanowiska, zespół, zadania. Wykrywa ogólniki i frazy szablonowe."
            icon={<IcoFileSearch />}
            iconBg="var(--color-accent-muted)"
            iconColor="var(--color-accent)"
          />

          {/* ── Card 3 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Transparentność"
            tagColor="var(--color-accent)"
            title="Ocenia otwartość firmy"
            desc="Widełki, forma zatrudnienia, dane rekrutera — czy firma niczego nie ukrywa."
            icon={<IcoEye />}
            iconBg="var(--color-accent-muted)"
            iconColor="var(--color-accent)"
          />

          {/* ── Card 4 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Sygnały"
            tagColor="var(--color-accent)"
            title="Waży sygnały zewnętrzne"
            desc="Aktywność na LinkedIn, liczba jednoczesnych ofert, historia rotacji ogłoszenia."
            icon={<IcoActivity />}
            iconBg="var(--color-accent-muted)"
            iconColor="var(--color-accent)"
          />

          {/* ── Card 5 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Weryfikacja"
            tagColor="var(--color-accent)"
            title="Wykrywa nierealne wymagania"
            desc="5 lat doświadczenia w technologii istniejącej 3 lata? To klasyczny sygnał ostrzegawczy."
            icon={<IcoCircleX />}
            iconBg="var(--color-accent-muted)"
            iconColor="var(--color-accent)"
          />

          {/* ── Card 6 — full width, history mock ───────────────────────── */}
          <div
            className="lg:col-span-6 rounded-2xl overflow-hidden"
            style={{ background: "var(--hero-card-bg)" }}
          >
            {/* Accent top strip */}
            <div className="h-[3px]" style={{ background: "var(--color-accent)" }} />
            <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left: text */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <IconPill bg="var(--color-accent-muted)" color="var(--color-accent)">
                  <IcoHistory />
                </IconPill>
                <div>
                  <div
                    className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Historia
                  </div>
                  <h3 className="text-[15px] font-bold tracking-tight text-white mb-1">
                    Historia analiz
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--hero-muted)" }}>
                    Wszystkie sprawdzone oferty w jednym miejscu — wracaj do
                    nich kiedy chcesz.
                  </p>
                </div>
              </div>

              {/* Right: mini history rows */}
              <div className="flex flex-col gap-2 w-full lg:max-w-sm shrink-0">
                {historyMock.map((row) => {
                  const vc = historyColor[row.verdict];
                  return (
                    <div
                      key={row.role}
                      className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <span className="text-[12px] font-medium text-white truncate mr-3">
                        {row.role}
                      </span>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[11px]" style={{ color: "var(--hero-muted)" }}>
                          {row.date}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide"
                          style={{ background: vc.bg, color: vc.text }}
                        >
                          {row.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── 6. Cennik ─────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <motion.section
      id="cennik"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-20"
    >
      <div className="text-center mb-14">
        <div
          className="inline-block text-[12px] font-bold tracking-widest uppercase mb-4"
          style={{ color: "var(--hero-muted)" }}
        >
          Cennik
        </div>
        <h2 className="text-[36px] md:text-[54px] font-black tracking-[-0.02em] leading-[1.05] mb-3 text-white">
          Cena, która się zwraca
        </h2>
        <p className="text-[16px] max-w-md mx-auto" style={{ color: "var(--hero-muted)" }}>
          Jedna zaoszczędzona godzina na fałszywej aplikacji pokrywa miesiąc
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {/* Free */}
        <div
          className="rounded-3xl p-8 flex flex-col border"
          style={{ background: "var(--hero-card-bg)", borderColor: "var(--hero-border)" }}
        >
          <div className="text-[13px] font-bold mb-2" style={{ color: "var(--hero-muted)" }}>
            Darmowy
          </div>
          <div className="text-[44px] font-black tracking-tight leading-none mb-1 text-white">
            0 zł
          </div>
          <div className="text-[14px] mb-8" style={{ color: "var(--hero-muted)" }}>na zawsze</div>
          <ul className="flex flex-col gap-3 mb-8 flex-1">
            {[
              "3 analizy miesięcznie",
              "Pełen werdykt i 6 kryteriów",
              "Historia analiz",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-[14px]"
                style={{ color: "var(--hero-muted)" }}
              >
                <span className="text-[#4ADE80] font-bold text-[16px]">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full py-3.5 rounded-xl border font-semibold text-center text-[15px] transition-colors text-white"
            style={{ borderColor: "var(--hero-border)" }}
          >
            Zacznij za darmo
          </Link>
        </div>

        {/* Pro — accent border */}
        <div
          className="rounded-3xl p-[2px] relative"
          style={{ background: "var(--color-accent)" }}
        >
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <span
              className="text-white text-[11px] font-bold rounded-full px-3 py-1 whitespace-nowrap"
              style={{ background: "var(--color-accent)" }}
            >
              WKRÓTCE
            </span>
          </div>
          <div
            className="rounded-[22px] p-8 flex flex-col h-full"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-muted) 0%, transparent 100%), var(--hero-card-bg)",
            }}
          >
            <div className="text-[13px] font-bold mb-2" style={{ color: "var(--hero-muted)" }}>Pro</div>
            <div className="text-[44px] font-black tracking-tight leading-none mb-1 text-white">
              29 zł
            </div>
            <div className="text-[14px] mb-8" style={{ color: "var(--hero-muted)" }}>/miesiąc</div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {[
                "Nielimitowane analizy",
                "Pełen werdykt i 6 kryteriów",
                "Historia analiz + eksport",
                "Priorytetowa analiza AI",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-[14px]"
                  style={{ color: "var(--hero-muted)" }}
                >
                  <span className="text-[#4ADE80] font-bold text-[16px]">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register?plan=pro"
              className="block w-full py-3.5 rounded-xl text-white font-bold text-center text-[15px] hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "var(--color-accent)" }}
            >
              Wybierz Pro
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── 7. FAQ ────────────────────────────────────────────────────────────────────

function Faq() {
  return (
    <motion.section
      id="faq"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div
            className="inline-block text-[12px] font-bold tracking-widest uppercase mb-4"
            style={{ color: "var(--hero-muted)" }}
          >
            FAQ
          </div>
          <h2 className="text-[36px] md:text-[52px] font-black tracking-[-0.02em] leading-[1.05] text-white">
            Częste pytania
          </h2>
        </div>
        <FaqAccordion />
      </div>
    </motion.section>
  );
}

// ── 8. CTA końcowe ────────────────────────────────────────────────────────────

function CtaFinal() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden text-white"
      style={{ background: "var(--hero-bg)" }}
    >
      {/* Glow blob — top left */}
      <div
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "var(--color-accent)",
          filter: "blur(120px)",
          opacity: 0.35,
        }}
      />
      {/* Glow blob — bottom right */}
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "var(--color-accent)",
          filter: "blur(120px)",
          opacity: 0.25,
        }}
      />

      <div
        className="relative max-w-6xl mx-auto px-6 py-24 text-center"
        style={{ zIndex: 1 }}
      >
        <h2 className="text-[42px] md:text-[64px] font-black tracking-[-0.03em] leading-[1.02] mb-5">
          Przestań tracić czas
          <br />
          na <span style={{ color: "var(--color-accent)" }}>ghost joby</span>
        </h2>
        <p className="text-[17px] mb-10 max-w-md mx-auto" style={{ color: "var(--hero-muted)" }}>
          Sprawdź pierwsze ogłoszenie za darmo — bez karty, bez zobowiązań
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 rounded-xl text-white font-bold text-[16px] hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200"
          style={{ background: "var(--color-accent)" }}
        >
          Zacznij za darmo →
        </Link>
      </div>
    </motion.section>
  );
}

// ── 9. Stopka ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="mt-[50px] border-t"
      style={{ background: "var(--hero-card-bg)", borderColor: "var(--hero-border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-[13px]" style={{ color: "var(--hero-muted)" }}>© 2025 Analyss</p>
        <nav className="flex items-center gap-5 text-[13px]" style={{ color: "var(--hero-muted)" }}>
          <Link href="/regulamin" className="hover:text-white transition-colors">
            Regulamin
          </Link>
          <Link href="/prywatnosc" className="hover:text-white transition-colors">
            Prywatność
          </Link>
          <a href="mailto:kontakt@analyss.pl" className="hover:text-white transition-colors">
            Kontakt
          </a>
        </nav>
      </div>
    </footer>
  );
}

// ── Animated background ───────────────────────────────────────────────────────

function AnimatedBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Laggy spring — orby "gonią" kursor z opóźnieniem
  const sx = useSpring(mouseX, { stiffness: 28, damping: 28, mass: 1 });
  const sy = useSpring(mouseY, { stiffness: 28, damping: 28, mass: 1 });

  // Każdy orb reaguje na myszkę z inną siłą i kierunkiem — efekt paralaksy
  const o1x = useTransform(sx, (v) => v * 65);
  const o1y = useTransform(sy, (v) => v * 50);
  const o2x = useTransform(sx, (v) => v * -50);
  const o2y = useTransform(sy, (v) => v * -40);
  const o3x = useTransform(sx, (v) => v * 38);
  const o3y = useTransform(sy, (v) => v * 55);
  const o4x = useTransform(sx, (v) => v * -60);
  const o4y = useTransform(sy, (v) => v * 42);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Orb 1 — purple, top-left */}
      <motion.div
        className="absolute"
        style={{ x: o1x, y: o1y, top: "-420px", left: "-380px" }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 1100,
            height: 1100,
            background:
              "radial-gradient(circle, rgba(24,119,242,0.14) 0%, transparent 60%)",
          }}
          animate={{ x: [0, 120, -60, 0], y: [0, 90, -70, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Orb 2 — coral, top-right */}
      <motion.div
        className="absolute"
        style={{ x: o2x, y: o2y, top: "-180px", right: "-320px" }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 900,
            height: 900,
            background:
              "radial-gradient(circle, rgba(24,119,242,0.10) 0%, transparent 60%)",
          }}
          animate={{ x: [0, -90, 55, 0], y: [0, 110, -80, 0] }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </motion.div>

      {/* Orb 3 — lime, mid-page */}
      <motion.div
        className="absolute"
        style={{ x: o3x, y: o3y, top: "38%", left: "22%" }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 750,
            height: 750,
            background:
              "radial-gradient(circle, rgba(24,119,242,0.07) 0%, transparent 60%)",
          }}
          animate={{ x: [0, 70, -80, 0], y: [0, -70, 90, 0] }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 9,
          }}
        />
      </motion.div>

      {/* Orb 4 — purple, bottom-right */}
      <motion.div
        className="absolute"
        style={{ x: o4x, y: o4y, bottom: "8%", right: "-280px" }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width: 950,
            height: 950,
            background:
              "radial-gradient(circle, rgba(24,119,242,0.09) 0%, transparent 60%)",
          }}
          animate={{ x: [0, -110, 65, 0], y: [0, -65, 85, 0] }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 14,
          }}
        />
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="relative overflow-x-hidden"
      style={{ background: "var(--hero-bg)", color: "var(--hero-fg)" }}
    >
      <AnimatedBackground />
      <HeroDark />
      <Stats />
      <Features />
      <Pricing />
      <Faq />
      <CtaFinal />
      <Footer />
    </div>
  );
}
