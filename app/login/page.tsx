"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-6">
      <div className="w-full max-w-sm bg-white border border-[#ECEAE3] rounded-3xl p-8">
        <h1 className="text-2xl font-black tracking-tight mb-2">Zaloguj się</h1>
        <p className="text-[#57564F] text-sm mb-6 leading-relaxed">
          Podaj email — wyślemy link do logowania. Bez hasła.
        </p>

        {sent ? (
          <div className="text-sm bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] rounded-xl p-4">
            Sprawdź skrzynkę — wysłaliśmy link logowania na {email}.
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ty@email.com"
              className="w-full border border-[#ECEAE3] rounded-xl px-4 py-3 text-[15px] bg-[#FAFAF7] outline-none mb-3"
            />
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            <button
              onClick={sendMagicLink}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-[15px] disabled:opacity-60"
            >
              {loading ? "Wysyłam..." : "Wyślij link logowania"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
