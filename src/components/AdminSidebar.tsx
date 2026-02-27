"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  Users,
  LogOut,
} from "lucide-react";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/admin", label: "總覽", Icon: LayoutDashboard, exact: true },
  { href: "/calendar", label: "行事曆", Icon: CalendarDays, exact: false },
  { href: "/admin/sessions", label: "牌局", Icon: Layers, exact: false },
  { href: "/admin/players", label: "玩家", Icon: Users, exact: false },
];

function SidebarContent({ user }: Props) {
  const { open, animate } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarBody
      className="justify-between border-r"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden gap-0">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-3 px-3 py-3 mb-2">
          <span className="text-xl leading-none flex-shrink-0">🀄</span>
          <motion.span
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-sm font-semibold whitespace-nowrap tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            麻將記錄
          </motion.span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map(({ href, label, Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-sm",
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--sidebar-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]",
                )}
                style={
                  isActive
                    ? {
                        background:
                          "color-mix(in srgb, var(--primary) 10%, transparent)",
                      }
                    : {}
                }
              >
                <Icon size={16} className="flex-shrink-0" />
                <motion.span
                  animate={{
                    display: animate ? (open ? "block" : "none") : "block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                  }}
                  className="whitespace-nowrap font-medium"
                >
                  {label}
                </motion.span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="px-2 pb-2 flex flex-col gap-0.5">
        <div
          className="h-px mx-2 mb-2"
          style={{ background: "var(--sidebar-border)" }}
        />

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 18%, transparent)",
                color: "var(--primary)",
              }}
            >
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
            <motion.span
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="text-xs truncate whitespace-nowrap"
              style={{ color: "var(--muted-foreground)" }}
            >
              {user.name ?? user.email}
            </motion.span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-2 py-2 rounded-md w-full text-left text-sm transition-colors"
          style={{ color: "var(--sidebar-foreground)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--destructive)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "color-mix(in srgb, var(--destructive) 8%, transparent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--sidebar-foreground)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <motion.span
            animate={{
              display: animate ? (open ? "block" : "none") : "block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="whitespace-nowrap font-medium"
          >
            登出
          </motion.span>
        </button>
      </div>
    </SidebarBody>
  );
}

export default function AdminSidebar({ user }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarContent user={user} />
    </Sidebar>
  );
}
