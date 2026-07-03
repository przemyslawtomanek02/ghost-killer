"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setError("");

    if (!email.trim()) {
      setError("Podaj adres e-mail.");
      return;
    }
    if (!password) {
      setError("Podaj hasło.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError("Nieprawidłowy e-mail lub hasło.");
    } else {
      const next = searchParams.get("next") ?? "/app";
      router.push(next);
    }
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
          href="/register"
          className="text-sm font-semibold bg-black text-white rounded-full px-4 py-2 hover:bg-[#1a1a1a] transition-colors"
        >
          Zarejestruj się
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-black tracking-tight mb-2">
              Zaloguj się
            </h1>
            <p className="text-[#57564F] text-[15px]">
              Witaj z powrotem.
            </p>
          </div>

          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-7 flex flex-col gap-3">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#6B6A63]">
                  Hasło
                </label>
                <Link
                  href="/reset-password"
                  className="text-[12px] text-[#9C9B93] hover:text-[#0A0A0A] transition-colors"
                >
                  Zapomniałem hasła
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  placeholder="Twoje hasło"
                  autoComplete="current-password"
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
              onClick={login}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] disabled:opacity-60 hover:bg-[#1a1a1a] transition-colors mt-1"
            >
              {loading ? "Loguję..." : "Zaloguj się →"}
            </button>

            <div className="pt-3 border-t border-[#ECEAE3] text-center">
              <span className="text-[13px] text-[#6B6A63]">
                Nie masz konta?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#0A0A0A] hover:underline"
                >
                  Zarejestruj się za darmo
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
