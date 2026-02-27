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
  {
    href: "/admin",
    label: "總覽",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/calendar",
    label: "行事曆",
    icon: CalendarDays,
    exact: false,
  },
  {
    href: "/admin/sessions",
    label: "牌局",
    icon: Layers,
    exact: false,
  },
  {
    href: "/admin/players",
    label: "玩家",
    icon: Users,
    exact: false,
  },
];

function SidebarContent({ user }: Props) {
  const { open, animate } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarBody
      className="justify-between gap-10 border-r"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2 py-1 mb-2">
          <span className="text-2xl flex-shrink-0">🀄</span>
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="font-bold text-base whitespace-pre"
            style={{ fontFamily: "var(--font-serif)", color: "var(--sidebar-primary)" }}
          >
            麻將記錄
          </motion.span>
        </Link>

        {/* Nav links */}
        <div className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all group/link",
                )}
                style={{
                  background: isActive
                    ? "color-mix(in srgb, var(--sidebar-primary) 12%, transparent)"
                    : "transparent",
                  color: isActive ? "var(--sidebar-primary)" : "var(--sidebar-foreground)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "color-mix(in srgb, var(--sidebar-primary) 6%, transparent)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon
                  className="flex-shrink-0"
                  size={20}
                  style={{ color: isActive ? "var(--sidebar-primary)" : "var(--sidebar-foreground)" }}
                />
                <motion.span
                  animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                  }}
                  className="text-sm whitespace-pre font-medium group-hover/link:translate-x-0.5 transition-transform duration-150"
                  style={{
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom: user + logout */}
      <div className="flex flex-col gap-2">
        {/* Divider */}
        <div className="h-px" style={{ background: "var(--sidebar-border)" }} />

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: "color-mix(in srgb, var(--sidebar-primary) 15%, transparent)",
                color: "var(--sidebar-primary)",
                border: "1px solid color-mix(in srgb, var(--sidebar-primary) 25%, transparent)",
              }}
            >
              {(user.name ?? user.email ?? "A")[0].toUpperCase()}
            </div>
            <motion.span
              animate={{
                display: animate ? (open ? "inline-block" : "none") : "inline-block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="text-xs truncate whitespace-pre"
              style={{ color: "var(--muted-foreground)" }}
            >
              {user.name ?? user.email}
            </motion.span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all w-full text-left"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "color-mix(in srgb, var(--destructive) 8%, transparent)";
            e.currentTarget.style.color = "var(--destructive)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-sm whitespace-pre"
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
