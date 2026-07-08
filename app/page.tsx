"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
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

// ── 1. Nawigacja ─────────────────────────────────────────────────────────────

// Shared glass styles reused for both the island and the mobile dropdown
const glassStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(20px) saturate(200%) brightness(1.05)",
  WebkitBackdropFilter: "blur(20px) saturate(200%) brightness(1.05)",
  boxShadow:
    "0 4px 24px rgba(0,0,0,0.07), inset 0 0 0 1px rgba(255,255,255,0.75), inset 0 1px 0 rgba(255,255,255,0.9)",
};

function Nav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setLoggedIn(true);
    });
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    setLoggedIn(false);
    router.refresh();
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto flex flex-col gap-2">

        {/* ── Main island ───────────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden px-5 py-3 flex items-center justify-between gap-4"
          style={glassStyle}
        >
          {/* Glitch: iridescent shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background:
                "linear-gradient(105deg, rgba(124,111,232,0.18) 0%, rgba(255,255,255,0) 40%, rgba(242,124,94,0.14) 70%, rgba(232,244,214,0.12) 100%)",
              borderRadius: "inherit",
            }}
            animate={{ x: ["-30%", "30%", "-30%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Glitch: scan line */}
          <motion.div
            className="absolute left-2 right-2 pointer-events-none"
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(124,111,232,0.5) 30%, rgba(242,124,94,0.5) 70%, transparent)",
            }}
            animate={{ top: ["-1px", "calc(100% + 1px)"], opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 1.0, repeat: Infinity, repeatDelay: 6, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
          />

          {/* Glitch: RGB edge flash */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: "inherit" }}
            animate={{
              boxShadow: [
                "inset 0 0 0 1px rgba(124,111,232,0)",
                "inset 0 0 0 1px rgba(124,111,232,0.6)",
                "inset 0 0 0 1px rgba(242,124,94,0.4)",
                "inset 0 0 0 1px rgba(124,111,232,0)",
              ],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 9, ease: "easeOut", times: [0, 0.2, 0.7, 1] }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between gap-4 w-full">
            <Link href="/" onClick={() => setOpen(false)}>
              <Logo />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#57564F]">
              <a href="#jak-dziala" className="hover:text-[#0A0A0A] transition-colors">Jak działa</a>
              <a href="#cennik" className="hover:text-[#0A0A0A] transition-colors">Cennik</a>
              <a href="#faq" className="hover:text-[#0A0A0A] transition-colors">FAQ</a>
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {loggedIn ? (
                <>
                  <Link href="/app" className="text-[14px] font-semibold bg-black text-white rounded-full px-4 py-2 hover:bg-[#1a1a1a] transition-colors">
                    Otwórz apkę
                  </Link>
                  <button onClick={logout} className="text-[14px] font-medium text-[#57564F] hover:text-[#0A0A0A] transition-colors">
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-[14px] font-medium text-[#57564F] hover:text-[#0A0A0A] transition-colors">
                    Zaloguj się
                  </Link>
                  <Link href="/register" className="text-[14px] font-semibold bg-black text-white rounded-full px-4 py-2 hover:bg-[#1a1a1a] transition-colors">
                    Wypróbuj za darmo
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger button — mobile only */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Zamknij menu" : "Otwórz menu"}
              className="md:hidden flex flex-col items-center justify-center gap-[5px] w-9 h-9 shrink-0 rounded-xl hover:bg-black/5 transition-colors"
            >
              <motion.span
                animate={{ rotate: open ? 45 : 0, y: open ? 6.5 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="block w-[18px] h-[1.5px] bg-[#0A0A0A] rounded-full origin-center"
              />
              <motion.span
                animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
                transition={{ duration: 0.18 }}
                className="block w-[18px] h-[1.5px] bg-[#0A0A0A] rounded-full"
              />
              <motion.span
                animate={{ rotate: open ? -45 : 0, y: open ? -6.5 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="block w-[18px] h-[1.5px] bg-[#0A0A0A] rounded-full origin-center"
              />
            </button>
          </div>
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
              className="md:hidden rounded-2xl overflow-hidden"
              style={glassStyle}
            >
              <nav className="flex flex-col p-3 gap-1">
                {[
                  { href: "#jak-dziala", label: "Jak działa" },
                  { href: "#cennik", label: "Cennik" },
                  { href: "#faq", label: "FAQ" },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-[#57564F] hover:text-[#0A0A0A] rounded-xl hover:bg-black/5 transition-colors"
                  >
                    {label}
                  </a>
                ))}

                <div className="h-px bg-black/[0.07] mx-1 my-1" />

                {loggedIn ? (
                  <>
                    <Link
                      href="/app"
                      onClick={() => setOpen(false)}
                      className="mt-1 mx-1 px-4 py-3.5 rounded-xl bg-black text-white font-bold text-[15px] text-center hover:bg-[#1a1a1a] transition-colors"
                    >
                      Otwórz apkę →
                    </Link>
                    <button
                      onClick={() => { setOpen(false); logout(); }}
                      className="px-4 py-3 text-[15px] font-medium text-[#57564F] hover:text-[#0A0A0A] rounded-xl hover:bg-black/5 transition-colors text-left"
                    >
                      Wyloguj
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 text-[15px] font-medium text-[#57564F] hover:text-[#0A0A0A] rounded-xl hover:bg-black/5 transition-colors"
                    >
                      Zaloguj się
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="mt-1 mx-1 px-4 py-3.5 rounded-xl bg-black text-white font-bold text-[15px] text-center hover:bg-[#1a1a1a] transition-colors"
                    >
                      Wypróbuj za darmo →
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}

// ── Floating Job Card ─────────────────────────────────────────────────────────

function FloatingCard({
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
      className="absolute hidden md:block bg-white rounded-2xl p-4"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        opacity: 0.85,
        zIndex: 1,
        ...style,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="font-bold text-[13px] text-[#0A0A0A]">{title}</div>
        {ghostBadge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0 ml-2">
            Ghost job?
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="h-2 bg-[#ECEAE3] rounded-full w-full" />
        <div className="h-2 bg-[#ECEAE3] rounded-full w-[80%]" />
        <div className="h-2 bg-[#ECEAE3] rounded-full w-[60%]" />
      </div>
      <div className="absolute bottom-3.5 left-4">
        <span
          className="text-[10px] font-semibold px-2 py-1 rounded-full"
          style={badgeStyle ?? { background: "#F1F0EE", color: "#57564F" }}
        >
          {badge}
        </span>
      </div>
    </motion.div>
  );
}

// ── 2. Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-x-hidden">
      {/* Floating cards — desktop only, absolute to section */}
      <FloatingCard
        title="Senior Developer"
        badge="TechCorp • Warszawa"
        width={280}
        height={180}
        rotate={-4}
        duration={4}
        delay={0}
        style={{ left: "calc(50% - 580px)", top: "80px" }}
      />
      <FloatingCard
        title="UX Designer"
        badge="UXLab • Kraków"
        ghostBadge
        width={220}
        height={140}
        rotate={3}
        duration={3}
        delay={0.5}
        style={{ right: "calc(50% - 580px)", top: "60px" }}
      />
      <FloatingCard
        title="Product Manager"
        badge="Remote"
        width={280}
        height={180}
        rotate={-2}
        duration={5}
        delay={1}
        style={{ left: "calc(50% - 560px)", bottom: "80px" }}
      />
      <FloatingCard
        title="Sales Representative"
        badge="42 dni temu"
        badgeStyle={{ background: "var(--accent-coral)", color: "white" }}
        width={220}
        height={140}
        rotate={5}
        duration={3.5}
        delay={1.5}
        style={{ right: "calc(50% - 560px)", bottom: "70px" }}
      />

      {/* Main content */}
      <div className="relative w-full max-w-6xl mx-auto px-6 py-16 text-center" style={{ zIndex: 2 }}>
        <div
          className="inline-block text-[13px] font-semibold rounded-full px-4 py-1.5 mb-7"
          style={{ background: "var(--accent-purple-soft)", color: "var(--accent-purple)" }}
        >
          Co 5. oferta pracy w sieci to ghost job
        </div>

        <h1 className="text-[62px] md:text-[84px] lg:text-[100px] font-black tracking-[-0.03em] leading-[0.97] mb-7 max-w-4xl mx-auto">
          Nie trać czasu na oferty,{" "}
          <span className="bg-gradient-to-r from-[#F27C5E] to-[#7C6FE8] bg-clip-text text-transparent">
            których nie ma
          </span>
        </h1>

        <p className="text-[18px] text-[#57564F] leading-relaxed max-w-[540px] mx-auto mb-10">
          Analyss analizuje ogłoszenia w kilka sekund i mówi Ci wprost — warto
          aplikować czy to strata czasu.
        </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href="#demo"
            className="inline-block px-8 py-4 rounded-xl bg-black text-white font-bold text-[16px] hover:bg-[#1a1a1a] hover:-translate-y-0.5 transition-all duration-200"
          >
            Sprawdź ofertę za darmo
          </a>
          <p className="text-[13px] text-[#9C9B93]">
            3 darmowe analizy miesięcznie · Bez karty
          </p>
        </div>
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
    color: "var(--accent-coral)",
    gradientClass: "from-[#F27C5E] to-[#E85A3C]",
  },
  {
    stat: "43 dni",
    label: "marnowane na szukanie",
    desc: "tyle traci przeciętny kandydat aplikując na fałszywe oferty w Polsce",
    source: "dane rynkowe",
    color: "var(--accent-purple)",
    gradientClass: "from-[#7C6FE8] to-[#5B4ED4]",
  },
  {
    stat: "1 na 5",
    label: "kandydatów nie wie",
    desc: "osób wysyła CV nie świadomych, że oferta nie prowadzi do zatrudnienia",
    source: "",
    color: "#5A7A1E",
    gradientClass: "from-[#6B8E23] to-[#4E6A18]",
  },
];

function Stats() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white"
    >
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">

        {/* Header row — split layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B6A63] mb-4">
              <span
                className="w-4 h-[1.5px] rounded-full inline-block"
                style={{ background: "var(--accent-coral)" }}
              />
              Skala problemu
            </div>
            <h2 className="text-[42px] md:text-[60px] font-black tracking-[-0.03em] leading-[1.02]">
              Ghost joby<br />to nie mit
            </h2>
          </div>
          <p className="text-[15px] text-[#6B6A63] leading-relaxed max-w-[260px] md:text-right md:pb-1">
            Badania rynku pracy<br className="hidden md:block" /> pokazują skalę problemu
          </p>
        </div>

        {/* Thin rule */}
        <div className="h-px bg-[#E8E7E2] mb-14" />

        {/* Big stat columns */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {statsItems.map((item, i) => (
            <div
              key={item.stat}
              className={[
                "py-10 md:py-0",
                i === 0 ? "md:pr-14 border-b md:border-b-0 md:border-r border-[#E8E7E2]" : "",
                i === 1 ? "md:px-14 border-b md:border-b-0 md:border-r border-[#E8E7E2]" : "",
                i === 2 ? "md:pl-14" : "",
              ].filter(Boolean).join(" ")}
            >
              {/* The giant number */}
              <div
                className={`text-[80px] md:text-[104px] lg:text-[120px] font-black tracking-[-0.04em] leading-[0.82] mb-3 bg-gradient-to-br ${item.gradientClass} bg-clip-text text-transparent`}
              >
                {item.stat}
              </div>

              {/* Accent underbar */}
              <div
                className="w-14 h-[3px] rounded-full mb-5"
                style={{ background: item.color }}
              />

              {/* Label */}
              <div
                className="text-[11px] font-bold tracking-[0.09em] uppercase mb-3"
                style={{ color: item.color }}
              >
                {item.label}
              </div>

              {/* Description */}
              <p className="text-[14px] text-[#57564F] leading-[1.65] max-w-[220px]">
                {item.desc}
              </p>

              {/* Source */}
              {item.source && (
                <p className="text-[11px] text-[#B0AFA9] font-medium mt-3 tracking-wide">
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
      <div className="absolute inset-0 animate-gradient" style={{ opacity: 0.9 }} />

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-20" style={{ zIndex: 1 }}>
        <div className="text-center mb-12">
          <div
            className="inline-block text-[12px] font-bold tracking-widest uppercase mb-4 rounded-full px-4 py-1.5"
            style={{ background: "rgba(255,255,255,0.7)", color: "#57564F", backdropFilter: "blur(8px)" }}
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a8 8 0 0 1 8 8v10l-3-2.5-2.5 2-2.5-2-2.5 2L9 17.5 6 20V10A8 8 0 0 1 12 2z" />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoFileSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <circle cx="11" cy="15" r="2.5" />
      <path d="m13 17 1.5 1.5" />
    </svg>
  );
}
function IcoEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IcoActivity() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IcoCircleX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}
function IcoHistory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="lg:col-span-2 bg-white rounded-2xl p-7 flex flex-col gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300">
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
        <h3 className="text-[15px] font-bold tracking-tight text-[#0A0A0A] mb-1.5 leading-snug">
          {title}
        </h3>
        <p className="text-[13px] text-[#6B6A63] leading-[1.65]">{desc}</p>
      </div>
    </div>
  );
}

// Ghost jobs detected in the hero card — mini UI mock
const ghostJobsMock = [
  { role: "Senior Developer", company: "TechCorp", days: "127 dni", ghost: true },
  { role: "Marketing Lead", company: "BrandCo", days: "4 dni", ghost: false },
  { role: "QA Engineer", company: "Allegro", days: "91 dni", ghost: true },
  { role: "UX Designer", company: "UXLab", days: "12 dni", ghost: false },
];

// History rows for the last card — mini UI mock
const historyMock = [
  { role: "Senior Developer • TechCorp", verdict: "danger", label: "Widmo", date: "wczoraj" },
  { role: "UX Designer • UXLab", verdict: "safe", label: "OK", date: "2 dni temu" },
  { role: "PM • StartupXYZ", verdict: "warning", label: "Uwaga", date: "5 dni temu" },
];
const historyColor: Record<string, { bg: string; text: string }> = {
  danger: { bg: "rgba(242,124,94,0.12)", text: "var(--accent-coral)" },
  safe: { bg: "rgba(22,163,74,0.1)", text: "#16A34A" },
  warning: { bg: "rgba(217,119,6,0.1)", text: "#D97706" },
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
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase text-[#6B6A63] mb-5">
            <span
              className="w-4 h-[1.5px] rounded-full inline-block"
              style={{ background: "var(--accent-purple)" }}
            />
            Co potrafi Analyss
            <span
              className="w-4 h-[1.5px] rounded-full inline-block"
              style={{ background: "var(--accent-purple)" }}
            />
          </div>
          <h2 className="text-[36px] md:text-[56px] font-black tracking-[-0.02em] leading-[1.05] mb-4">
            6 sygnałów,{" "}
            <span className="bg-gradient-to-r from-[#7C6FE8] to-[#F27C5E] bg-clip-text text-transparent">
              1 werdykt
            </span>
          </h2>
          <p className="text-[16px] text-[#6B6A63] max-w-[400px] mx-auto leading-relaxed">
            Analiza oparta na najczęstszych wzorcach ghost jobów
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">

          {/* ── Card 1 — large hero card ────────────────────────────────── */}
          <div
            className="lg:col-span-4 bg-white rounded-2xl p-8 relative overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
          >
            {/* Background glow */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(124,111,232,0.1) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <IconPill bg="linear-gradient(135deg, #E9E5FE, #D4CFFB)" color="var(--accent-purple)">
                <IcoGhost />
              </IconPill>
              <div>
                <div
                  className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1"
                  style={{ color: "var(--accent-purple)" }}
                >
                  Detekcja
                </div>
                <h3 className="text-[20px] font-bold tracking-tight text-[#0A0A0A] leading-snug">
                  Wykrywa oferty-widma
                </h3>
              </div>
            </div>

            <p className="text-[14px] text-[#6B6A63] leading-[1.65] mb-7 max-w-xs">
              Ogłoszenia, które wiszą miesiącami i wracają, mimo że nikt nie jest zatrudniany.
            </p>

            {/* Mini job list mock */}
            <div className="flex flex-col gap-2">
              {ghostJobsMock.map((job) => (
                <div
                  key={job.role}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
                  style={{ background: "#F7F6F4" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: job.ghost ? "var(--accent-coral)" : "#16A34A" }}
                    />
                    <span className="text-[12px] font-medium text-[#0A0A0A]">{job.role}</span>
                    <span className="text-[11px] text-[#9C9B93] hidden sm:inline">· {job.company}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#9C9B93]">{job.days}</span>
                    {job.ghost && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide"
                        style={{ background: "rgba(242,124,94,0.13)", color: "var(--accent-coral)" }}
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
            tagColor="var(--accent-purple)"
            title="Analizuje treść ogłoszenia"
            desc="Sprawdza konkrety: opis stanowiska, zespół, zadania. Wykrywa ogólniki i frazy szablonowe."
            icon={<IcoFileSearch />}
            iconBg="linear-gradient(135deg, #E9E5FE, #D4CFFB)"
            iconColor="var(--accent-purple)"
          />

          {/* ── Card 3 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Transparentność"
            tagColor="var(--accent-coral)"
            title="Ocenia otwartość firmy"
            desc="Widełki, forma zatrudnienia, dane rekrutera — czy firma niczego nie ukrywa."
            icon={<IcoEye />}
            iconBg="linear-gradient(135deg, #FCE7DE, #FAD4C5)"
            iconColor="var(--accent-coral)"
          />

          {/* ── Card 4 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Sygnały"
            tagColor="var(--accent-purple)"
            title="Waży sygnały zewnętrzne"
            desc="Aktywność na LinkedIn, liczba jednoczesnych ofert, historia rotacji ogłoszenia."
            icon={<IcoActivity />}
            iconBg="linear-gradient(135deg, #E9E5FE, #D4CFFB)"
            iconColor="var(--accent-purple)"
          />

          {/* ── Card 5 ──────────────────────────────────────────────────── */}
          <FeatureCard
            tag="Weryfikacja"
            tagColor="var(--accent-coral)"
            title="Wykrywa nierealne wymagania"
            desc="5 lat doświadczenia w technologii istniejącej 3 lata? To klasyczny sygnał ostrzegawczy."
            icon={<IcoCircleX />}
            iconBg="linear-gradient(135deg, #FCE7DE, #FAD4C5)"
            iconColor="var(--accent-coral)"
          />

          {/* ── Card 6 — full width, history mock ───────────────────────── */}
          <div className="lg:col-span-6 bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
            {/* Gradient top strip */}
            <div
              className="h-[3px]"
              style={{ background: "linear-gradient(90deg, var(--accent-purple), var(--accent-coral))" }}
            />
            <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left: text */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <IconPill bg="linear-gradient(135deg, #E8F4D6, #D4EDBE)" color="#5A7A1E">
                  <IcoHistory />
                </IconPill>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase mb-1 text-[#6B8E23]">
                    Historia
                  </div>
                  <h3 className="text-[15px] font-bold tracking-tight text-[#0A0A0A] mb-1">
                    Historia analiz
                  </h3>
                  <p className="text-[13px] text-[#6B6A63] leading-relaxed">
                    Wszystkie sprawdzone oferty w jednym miejscu — wracaj do nich kiedy chcesz.
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
                      style={{ background: "#F7F6F4" }}
                    >
                      <span className="text-[12px] font-medium text-[#0A0A0A] truncate mr-3">{row.role}</span>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[11px] text-[#9C9B93]">{row.date}</span>
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
        <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
          Cennik
        </div>
        <h2 className="text-[36px] md:text-[54px] font-black tracking-[-0.02em] leading-[1.05] mb-3">
          Cena, która się zwraca
        </h2>
        <p className="text-[16px] text-[#57564F] max-w-md mx-auto">
          Jedna zaoszczędzona godzina na fałszywej aplikacji pokrywa miesiąc
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-white rounded-3xl p-8 flex flex-col shadow-sm">
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
            className="block w-full py-3.5 rounded-xl border border-[#ECEAE3] font-semibold text-center text-[15px] hover:bg-[#F1F0EE] transition-colors"
          >
            Zacznij za darmo
          </Link>
        </div>

        {/* Pro — gradient border wrapper */}
        <div
          className="rounded-3xl p-[2px] relative"
          style={{ background: "linear-gradient(135deg, #7C6FE8, #F27C5E)" }}
        >
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <span
              className="text-white text-[11px] font-bold rounded-full px-3 py-1 whitespace-nowrap"
              style={{ background: "linear-gradient(90deg, #7C6FE8, #F27C5E)" }}
            >
              WKRÓTCE
            </span>
          </div>
          <div
            className="rounded-[22px] p-8 flex flex-col h-full"
            style={{
              background: "linear-gradient(135deg, rgba(124,111,232,0.05) 0%, rgba(242,124,94,0.05) 100%), white",
            }}
          >
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
              className="block w-full py-3.5 rounded-xl text-white font-bold text-center text-[15px] hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: "linear-gradient(90deg, #7C6FE8, #F27C5E)" }}
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
          <div className="inline-block text-[12px] font-bold tracking-widest uppercase text-[#6B6A63] mb-4">
            FAQ
          </div>
          <h2 className="text-[36px] md:text-[52px] font-black tracking-[-0.02em] leading-[1.05]">
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
      style={{ background: "#0F0B1F" }}
    >
      {/* Glow blob — top left */}
      <div
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "var(--accent-purple)", filter: "blur(120px)", opacity: 0.4 }}
      />
      {/* Glow blob — bottom right */}
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "var(--accent-coral)", filter: "blur(120px)", opacity: 0.4 }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 text-center" style={{ zIndex: 1 }}>
        <h2 className="text-[42px] md:text-[64px] font-black tracking-[-0.03em] leading-[1.02] mb-5">
          Przestań tracić czas
          <br />
          na{" "}
          <span className="bg-gradient-to-r from-[#F27C5E] to-[#7C6FE8] bg-clip-text text-transparent">
            ghost joby
          </span>
        </h2>
        <p className="text-[17px] text-[#9C9B93] mb-10 max-w-md mx-auto">
          Sprawdź pierwsze ogłoszenie za darmo — bez karty, bez zobowiązań
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 rounded-xl bg-white text-black font-bold text-[16px] hover:bg-[#F5F4EF] hover:-translate-y-0.5 transition-all duration-200"
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
      className="bg-white rounded-t-[32px] mt-[50px]"
      style={{
        boxShadow: "0 -4px 32px rgba(0,0,0,0.06), 0 -1px 0 rgba(0,0,0,0.04)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-[13px] text-[#9C9B93]">© 2025 Analyss</p>
        <nav className="flex items-center gap-5 text-[13px] text-[#6B6A63]">
          <Link href="/regulamin" className="hover:text-[#0A0A0A] transition-colors">Regulamin</Link>
          <Link href="/prywatnosc" className="hover:text-[#0A0A0A] transition-colors">Prywatność</Link>
          <a href="mailto:kontakt@analyss.pl" className="hover:text-[#0A0A0A] transition-colors">Kontakt</a>
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
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* Orb 1 — purple, top-left */}
      <motion.div className="absolute" style={{ x: o1x, y: o1y, top: "-420px", left: "-380px" }}>
        <motion.div
          className="rounded-full"
          style={{ width: 1100, height: 1100, background: "radial-gradient(circle, rgba(124,111,232,0.14) 0%, transparent 60%)" }}
          animate={{ x: [0, 120, -60, 0], y: [0, 90, -70, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Orb 2 — coral, top-right */}
      <motion.div className="absolute" style={{ x: o2x, y: o2y, top: "-180px", right: "-320px" }}>
        <motion.div
          className="rounded-full"
          style={{ width: 900, height: 900, background: "radial-gradient(circle, rgba(242,124,94,0.12) 0%, transparent 60%)" }}
          animate={{ x: [0, -90, 55, 0], y: [0, 110, -80, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </motion.div>

      {/* Orb 3 — lime, mid-page */}
      <motion.div className="absolute" style={{ x: o3x, y: o3y, top: "38%", left: "22%" }}>
        <motion.div
          className="rounded-full"
          style={{ width: 750, height: 750, background: "radial-gradient(circle, rgba(232,244,214,0.35) 0%, transparent 60%)" }}
          animate={{ x: [0, 70, -80, 0], y: [0, -70, 90, 0] }}
          transition={{ duration: 36, repeat: Infinity, ease: "easeInOut", delay: 9 }}
        />
      </motion.div>

      {/* Orb 4 — purple, bottom-right */}
      <motion.div className="absolute" style={{ x: o4x, y: o4y, bottom: "8%", right: "-280px" }}>
        <motion.div
          className="rounded-full"
          style={{ width: 950, height: 950, background: "radial-gradient(circle, rgba(124,111,232,0.09) 0%, transparent 60%)" }}
          animate={{ x: [0, -110, 65, 0], y: [0, -65, 85, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 14 }}
        />
      </motion.div>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative bg-[#F1F0EE] text-[#0A0A0A] overflow-x-hidden pt-20 dot-grid">
      <AnimatedBackground />
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
