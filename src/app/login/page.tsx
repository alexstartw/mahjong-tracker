"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm px-6">

        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-2xl">🀄</span>
            <span className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>
              麻將記錄
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
            登入後台
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            輸入帳號密碼繼續
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              電子郵件
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
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
            <p className="text-xs px-3 py-2 rounded-md" style={{ color: "var(--destructive)", background: "color-mix(in srgb, var(--destructive) 10%, transparent)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> 驗證中…</>
            ) : (
              <>登入 <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href="/calendar"
            className="text-xs transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--foreground)")}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--muted-foreground)")}
          >
            ← 回到公開行事曆
          </Link>
        </div>
      </div>
    </div>
  );
}
