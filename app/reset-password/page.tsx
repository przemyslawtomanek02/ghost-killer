"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReset() {
    setError("");
    if (!email.trim()) {
      setError("Podaj adres e-mail.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);

    if (error) {
      setError("Nie udało się wysłać linku. Sprawdź adres e-mail.");
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col">
        <nav className="max-w-6xl mx-auto w-full px-6 py-5">
          <Link href="/"><Logo /></Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8">
              <div className="text-[40px] mb-4">📬</div>
              <h2 className="text-[22px] font-black tracking-tight mb-2">
                Sprawdź skrzynkę
              </h2>
              <p className="text-[14px] text-[#57564F] leading-relaxed">
                Wysłaliśmy link do resetu hasła na{" "}
                <span className="font-semibold text-[#0A0A0A]">{email}</span>.
                Link jest ważny przez 60 minut.
              </p>
            </div>
            <p className="text-[13px] text-[#9C9B93] mt-4">
              Nie widzisz maila? Sprawdź folder spam.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-[13px] font-semibold text-[#0A0A0A] hover:underline"
            >
              ← Wróć do logowania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col">
      <nav className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <Link
          href="/login"
          className="text-sm font-semibold border border-[#ECEAE3] bg-white rounded-full px-4 py-2 hover:bg-[#F5F4EF] transition-colors"
        >
          Zaloguj się
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-black tracking-tight mb-2">
              Reset hasła
            </h1>
            <p className="text-[#57564F] text-[15px] leading-relaxed">
              Podaj adres e-mail — wyślemy link do ustawienia nowego hasła.
            </p>
          </div>

          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-7 flex flex-col gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && requestReset()}
                placeholder="ty@email.com"
                autoComplete="email"
                autoFocus
                className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-600 text-[13px] -mt-1">{error}</div>
            )}

            <button
              onClick={requestReset}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] disabled:opacity-60 hover:bg-[#1a1a1a] transition-colors mt-1"
            >
              {loading ? "Wysyłam..." : "Wyślij link →"}
            </button>

            <div className="pt-3 border-t border-[#ECEAE3] text-center">
              <Link
                href="/login"
                className="text-[13px] text-[#6B6A63] hover:text-[#0A0A0A] transition-colors"
              >
                ← Wróć do logowania
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
