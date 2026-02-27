"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, Layers, Users, LogOut } from "lucide-react";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface Props {
  user?: { name?: string | null; email?: string | null };
}

const navItems = [
  { href: "/admin",          label: "總覽",  Icon: LayoutDashboard, exact: true  },
  { href: "/calendar",       label: "行事曆", Icon: CalendarDays,    exact: false },
  { href: "/admin/sessions", label: "牌局",  Icon: Layers,          exact: false },
  { href: "/admin/players",  label: "玩家",  Icon: Users,           exact: false },
];

/** CSS-based text reveal — avoids framer-motion `display` animation bug with React 19 */
function RevealText({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { open, animate } = useSidebar();
  const visible = !animate || open;
  return (
    <span
      className={cn("overflow-hidden whitespace-nowrap", className)}
      style={{
        maxWidth:   visible ? "180px" : "0px",
        opacity:    visible ? 1 : 0,
        transition: "max-width 0.2s ease, opacity 0.15s ease",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function SidebarContent({ user }: Props) {
  const pathname = usePathname();

  return (
    <SidebarBody
      className="justify-between border-r"
      style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
    >
      {/* Top: logo + nav */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden gap-0">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 py-3 mb-2">
          <span className="text-xl leading-none flex-shrink-0">🀄</span>
          <RevealText
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            麻將記錄
          </RevealText>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-sm",
                  isActive
                    ? ""
                    : "hover:bg-[var(--sidebar-accent)]"
                )}
                style={{
                  background: isActive
                    ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                    : undefined,
                  color: isActive ? "var(--primary)" : "var(--sidebar-foreground)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "var(--sidebar-foreground)";
                }}
              >
                <Icon size={16} className="flex-shrink-0" />
                <RevealText className="font-medium" style={{ color: "inherit" }}>
                  {label}
                </RevealText>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: user + logout */}
      <div className="flex flex-col gap-0.5">
        <div className="h-px mx-2 mb-2" style={{ background: "var(--sidebar-border)" }} />

        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2 overflow-hidden">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
              style={{
                background: "color-mix(in srgb, var(--primary) 18%, transparent)",
                color: "var(--primary)",
              }}
            >
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
            <RevealText className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {user.name ?? user.email}
            </RevealText>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-2 py-2 rounded-md w-full text-left text-sm transition-colors"
          style={{ color: "var(--sidebar-foreground)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--destructive)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "color-mix(in srgb, var(--destructive) 8%, transparent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--sidebar-foreground)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <RevealText className="font-medium">登出</RevealText>
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
