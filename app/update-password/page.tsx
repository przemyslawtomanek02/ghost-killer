"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type Status = "loading" | "ready" | "invalid" | "success";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase implicit flow — błąd wraca w query params
    if (searchParams.get("error")) {
      setStatus("invalid");
      return;
    }

    const supabase = createClient();

    // PASSWORD_RECOVERY event fires gdy Supabase przetworzy token z URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    // Fallback: może sesja recovery już istnieje (np. po odświeżeniu strony)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus("ready");
    });

    // Timeout — jeśli żaden event nie nadszedł, link był nieprawidłowy
    const timer = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "invalid" : prev));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [searchParams]);

  async function updatePassword() {
    setError("");

    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (password !== confirm) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Nie udało się zmienić hasła. Spróbuj ponownie.");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/app"), 2000);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Link wygasł / nieprawidłowy ────────────────────────────────────────────
  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col">
        <nav className="max-w-6xl mx-auto w-full px-6 py-5">
          <Link href="/"><Logo /></Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8">
              <div className="text-[40px] mb-4">⏱️</div>
              <h2 className="text-[22px] font-black tracking-tight mb-2">
                Link wygasł
              </h2>
              <p className="text-[14px] text-[#57564F] leading-relaxed mb-6">
                Link wygasł lub był już użyty. Linki do resetu hasła
                są jednorazowe i ważne przez 60 minut.
              </p>
              <Link
                href="/reset-password"
                className="block w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] text-center hover:bg-[#1a1a1a] transition-colors"
              >
                Wyślij nowy link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sukces ─────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col">
        <nav className="max-w-6xl mx-auto w-full px-6 py-5">
          <Link href="/"><Logo /></Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="bg-white border border-[#ECEAE3] rounded-3xl p-8">
              <div className="text-[40px] mb-4">✅</div>
              <h2 className="text-[22px] font-black tracking-tight mb-2">
                Hasło zmienione
              </h2>
              <p className="text-[14px] text-[#57564F]">
                Za chwilę zostaniesz przekierowany do aplikacji...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formularz nowego hasła ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col">
      <nav className="max-w-6xl mx-auto w-full px-6 py-5">
        <Link href="/"><Logo /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-black tracking-tight mb-2">
              Nowe hasło
            </h1>
            <p className="text-[#57564F] text-[15px]">
              Ustaw nowe hasło do swojego konta.
            </p>
          </div>

          <div className="bg-white border border-[#ECEAE3] rounded-3xl p-7 flex flex-col gap-3">
            {/* Nowe hasło */}
            <div>
              <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                Nowe hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 znaków"
                  autoComplete="new-password"
                  autoFocus
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

            {/* Powtórz hasło */}
            <div>
              <label className="block text-[13px] font-semibold text-[#6B6A63] mb-1.5">
                Powtórz hasło
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updatePassword()}
                placeholder="Powtórz nowe hasło"
                autoComplete="new-password"
                className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none focus:border-[#9C9B93] transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-600 text-[13px] -mt-1">{error}</div>
            )}

            <button
              onClick={updatePassword}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] disabled:opacity-60 hover:bg-[#1a1a1a] transition-colors mt-1"
            >
              {loading ? "Zapisuję..." : "Ustaw nowe hasło →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UpdatePasswordForm />
    </Suspense>
  );
}
