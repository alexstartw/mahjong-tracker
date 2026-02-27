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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 25% 25%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 75% 75%, var(--primary) 0%, transparent 50%)",
      }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px",
      }} />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--card)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)", boxShadow: "0 0 30px color-mix(in srgb, var(--primary) 12%, transparent)" }}>
            <span className="text-3xl">🀄</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
            麻將記錄
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>後台管理系統</p>
        </div>

        {/* Form card */}
        <div className="card-primary p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@mahjong.local"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            {error && (
              <p className="text-sm text-center" style={{ color: "var(--destructive)" }}>{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "驗證中…" : "登入"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs">
          <a href="/calendar" style={{ color: "var(--muted-foreground)" }} className="hover:opacity-80 transition-opacity">
            ← 回到公開行事曆
          </a>
        </p>
      </div>
    </div>
  );
}
