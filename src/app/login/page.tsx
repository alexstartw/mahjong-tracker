"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError("帳號或密碼錯誤");
    else router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#0b1a10" }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 25% 25%, #c9a84c 0%, transparent 50%), radial-gradient(circle at 75% 75%, #c9a84c 0%, transparent 50%)",
      }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px",
      }} />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "#122018", border: "1px solid #c9a84c40", boxShadow: "0 0 30px rgba(201,168,76,0.15)" }}>
            <span className="text-3xl">🀄</span>
          </div>
          <h1 className="text-3xl font-bold glow-gold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
            麻將記錄
          </h1>
          <p className="text-sm mt-2" style={{ color: "#4a4335" }}>後台管理系統</p>
        </div>

        {/* Form card */}
        <div className="card-gold p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: "#a89b7e" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@mahjong.local"
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: "#a89b7e" }}>
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-dark"
              />
            </div>
            {error && (
              <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
              {loading ? "驗證中…" : "登入"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "#2a4530" }}>
          <a href="/calendar" style={{ color: "#4a4335" }} className="hover:text-gold transition-colors">
            ← 回到公開行事曆
          </a>
        </p>
      </div>
    </div>
  );
}
