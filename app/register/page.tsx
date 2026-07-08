"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setError("");

    if (!nickname.trim() || nickname.trim().length < 2) {
      setError("Nickname musi mieć co najmniej 2 znaki.");
      return;
    }
    if (!email.trim()) {
      setError("Podaj adres e-mail.");
      return;
    }
    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Sprawdź unikalność nicku przez RPC (omija RLS dla anonimowych)
    const { data: nickTaken, error: rpcError } = await supabase.rpc(
      "is_nickname_taken",
      { p_nickname: nickname.trim() },
    );
    if (rpcError) {
      setError("Błąd połączenia. Spróbuj ponownie.");
      setLoading(false);
      return;
    }
    if (nickTaken) {
      setError("Ten nickname jest już zajęty. Wybierz inny.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() },
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (data.user && data.user.identities?.length === 0) {
      // Supabase zwraca fałszywy sukces gdy email jest już zajęty (ochrona przed enumeracją)
      setError("Ten adres e-mail jest już zarejestrowany. Zaloguj się lub użyj innego maila.");
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div
        className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col"
      >
        <nav className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[9px] text-white flex items-center justify-center font-black text-[17px]"
              style={{ background: "linear-gradient(135deg, #7C6FE8, #F27C5E)" }}
            >
              A
            </div>
            <span className="font-bold text-[19px] tracking-tight">Analyss</span>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8">
              <div className="text-[40px] mb-4">📬</div>
              <h2 className="text-[22px] font-black tracking-tight mb-2">
                Sprawdź skrzynkę
              </h2>
              <p className="text-[14px] text-[#57564F] leading-relaxed">
                Wysłaliśmy link potwierdzający na{" "}
                <span className="font-semibold text-[#0A0A0A]">{email}</span>.
                Kliknij go, żeby aktywować konto.
              </p>
            </div>
            <p className="text-[13px] text-[#9C9B93] mt-4">
              Nie widzisz maila? Sprawdź folder spam.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col"
    >
      {/* Nav */}
      <nav className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[9px] text-white flex items-center justify-center font-black text-[17px]"
            style={{ background: "linear-gradient(135deg, #7C6FE8, #F27C5E)" }}
          >
            A
          </div>
          <span className="font-bold text-[19px] tracking-tight">Analyss</span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold border border-[#ECEAE3] bg-white rounded-full px-4 py-2 hover:bg-[#F5F4EF] transition-colors"
        >
          Zaloguj się
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-black tracking-tight mb-2">
              Utwórz konto
            </h1>
            <p className="text-[#57564F] text-[15px] leading-relaxed">
              Dołącz za darmo. Pierwsze 3 analizy w prezencie.
            </p>
          </div>

          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-7 flex flex-col gap-3">
            {/* Nickname */}
            <div>
              <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="np. KarolJunior"
                autoComplete="username"
                className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ty@email.com"
                autoComplete="email"
                className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && register()}
                  placeholder="Min. 8 znaków"
                  autoComplete="new-password"
                  className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 pr-12 text-[15px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9B93] hover:text-[#57564F] transition-colors text-[13px] font-medium"
                >
                  {showPassword ? "Ukryj" : "Pokaż"}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-[13px] -mt-1">{error}</div>
            )}

            <button
              onClick={register}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] disabled:opacity-60 hover:bg-[#1a1a1a] transition-colors mt-1"
            >
              {loading ? "Tworzę konto..." : "Utwórz konto →"}
            </button>

            <div className="pt-3 border-t border-[#ECEAE3] text-center">
              <span className="text-[13px] text-[#6B6A63]">
                Masz już konto?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#0A0A0A] hover:underline"
                >
                  Zaloguj się
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
