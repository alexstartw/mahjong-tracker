"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/sessions", label: "牌局記錄" },
  { href: "/admin/players", label: "玩家管理" },
];

export default function AdminNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <span className="font-bold text-green-700 text-lg">🀄 麻將記錄</span>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name ?? user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
