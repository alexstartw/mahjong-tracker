"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/admin", label: "總覽", exact: true },
  { href: "/calendar", label: "行事曆", exact: false },
  { href: "/admin/sessions", label: "牌局", exact: false },
  { href: "/admin/players", label: "玩家", exact: false },
];

export default function AdminNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-20 border-b"
      style={{
        background: "color-mix(in srgb, var(--background) 85%, transparent)",
        borderColor: "var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">🀄</span>
            <span
              className="font-bold"
              style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}
            >
              麻將記錄
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-1.5 rounded-lg text-sm transition-all"
                  style={{
                    background: isActive ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                    border: isActive ? "1px solid color-mix(in srgb, var(--primary) 25%, transparent)" : "1px solid transparent",
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs hidden sm:block" style={{ color: "var(--muted-foreground)" }}>
              {user?.name ?? user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
