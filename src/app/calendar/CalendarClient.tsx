"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MonthlyStats } from "./page";

interface SessionPlayer {
  id: string;
  name: string;
  amount: number;
}
interface SessionSummary {
  id: string;
  venue: string;
  base: number | null;
  unit: number | null;
  playerCount: number;
  players: SessionPlayer[];
}
interface CalendarDayData {
  date: string;
  isCurrentMonth: boolean;
  sessions: SessionSummary[];
}
interface Props {
  days: CalendarDayData[];
  year: number;
  month: number;
  monthlyStats: MonthlyStats;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function StakesTag({ base, unit }: { base: number | null; unit: number | null }) {
  const parts = [
    base != null && `底 ${base}`,
    unit != null && `台 ${unit}`,
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded"
      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
    >
      {parts.join(" / ")}
    </span>
  );
}

function SessionDetail({ session, onClose }: { session: SessionSummary; onClose?: () => void }) {
  const winners = session.players.filter((p) => p.amount > 0).sort((a, b) => b.amount - a.amount);
  const losers  = session.players.filter((p) => p.amount < 0).sort((a, b) => a.amount - b.amount);
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {session.venue}
        </span>
        <StakesTag base={session.base} unit={session.unit} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "贏", list: winners, color: "var(--win)" },
          { label: "輸", list: losers,  color: "var(--loss)" },
        ].map(({ label, list, color }) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </p>
            <div className="space-y-1">
              {list.length === 0 ? (
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
              ) : (
                list.map((p) => (
                  <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between group hover:opacity-70 transition-opacity"
                  >
                    <span className="text-xs group-hover:underline" style={{ color: "var(--muted-foreground)" }}>
                      {p.name}
                    </span>
                    <span className="text-xs font-semibold tabular" style={{ color }}>
                      {p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendarClient({ days, year, month, monthlyStats }: Props) {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState<string | null>(null);

  // Desktop popup position
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setActiveDate(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function navigate(delta: number) {
    let m = month + delta, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setActiveDate(null);
    router.push(`/calendar?year=${y}&month=${m}`);
  }

  function handleDayClick(e: React.MouseEvent<HTMLButtonElement>, day: CalendarDayData) {
    if (!day.sessions.length) return;
    const dateStr = day.date.slice(0, 10);
    if (activeDate === dateStr) { setActiveDate(null); return; }

    if (!isMobile) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollY = window.scrollY;
      setPopupPos({
        top: rect.bottom + scrollY + 6,
        left: Math.min(rect.left, window.innerWidth - 320),
      });
    }
    setActiveDate(dateStr);
  }

  const activeDay = days.find((d) => d.date.slice(0, 10) === activeDate);
  const todayStr  = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
          行事曆
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium w-24 text-center" style={{ color: "var(--foreground)" }}>
            {year} · {MONTHS[month]}
          </span>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Weekday row */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2.5 text-center text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateStr    = day.date.slice(0, 10);
            const dayNum     = new Date(day.date).getUTCDate();
            const hasSessions = day.sessions.length > 0;
            const isActive   = activeDate === dateStr;
            const isToday    = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                disabled={!hasSessions}
                onClick={(e) => handleDayClick(e, day)}
                className="min-h-[56px] md:min-h-[72px] p-1.5 md:p-2 text-left border-b border-r transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: isActive ? "var(--accent)" : "transparent",
                  cursor: hasSessions ? "pointer" : "default",
                }}
                onMouseEnter={(e) => { if (hasSessions && !isActive) (e.currentTarget as HTMLButtonElement).style.background = "var(--muted)"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span
                  className="inline-flex w-5 h-5 md:w-6 md:h-6 items-center justify-center rounded-full text-[11px] md:text-xs font-medium mb-1"
                  style={{
                    background: isToday ? "var(--primary)" : "transparent",
                    color: isToday ? "var(--primary-foreground)" : day.isCurrentMonth ? "var(--foreground)" : "var(--muted-foreground)",
                    opacity: day.isCurrentMonth ? 1 : 0.35,
                  }}
                >
                  {dayNum}
                </span>

                {hasSessions && (
                  <div className="space-y-0.5 mt-0.5">
                    {day.sessions.slice(0, 1).map((s) => (
                      <div
                        key={s.id}
                        className="text-[9px] md:text-[10px] rounded px-1 md:px-1.5 py-0.5 truncate font-medium"
                        style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
                      >
                        <span className="hidden md:inline">{s.venue}</span>
                        <span className="md:hidden">●</span>
                      </div>
                    ))}
                    {day.sessions.length > 1 && (
                      <div className="text-[9px] md:text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        +{day.sessions.length - 1}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
        點擊有牌局的日期查看詳情
      </p>

      {/* Monthly stats */}
      {monthlyStats.sessionCount > 0 ? (
        <div className="card p-4 md:p-5 space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>本月統計</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "場數",   value: monthlyStats.sessionCount },
              { label: "參與人數", value: monthlyStats.playerCount },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg p-3 text-center" style={{ background: "var(--muted)" }}>
                <p className="text-xl font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>積分排行</p>
            <div className="space-y-1">
              {monthlyStats.leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: i === 0 ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent" }}
                >
                  <span className="w-5 text-xs font-semibold text-center shrink-0" style={{ color: i === 0 ? "var(--primary)" : "var(--muted-foreground)" }}>
                    {i + 1}
                  </span>
                  <Link href={`/players/${p.id}`} className="flex-1 text-sm hover:underline" style={{ color: "var(--foreground)" }}>
                    {p.name}
                  </Link>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: p.amount >= 0 ? "var(--win)" : "var(--loss)" }}>
                    {p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-5 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          本月尚無牌局
        </div>
      )}

      {/* ── Desktop popup ── */}
      {!isMobile && activeDay && popupPos && (
        <div
          ref={popupRef}
          className="fixed z-50 w-72 animate-fade-up"
          style={{
            top: popupPos.top,
            left: Math.max(12, popupPos.left),
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {new Date(activeDay.date + "T00:00:00").toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
            </p>
            <button onClick={() => setActiveDate(null)} className="p-0.5 rounded transition-colors" style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)")}
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {activeDay.sessions.map((session, i) => (
              <SessionDetail
                key={session.id}
                session={session}
                onClose={() => setActiveDate(null)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile bottom sheet ── */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300"
            style={{
              background: "rgba(0,0,0,0.5)",
              opacity: activeDay ? 1 : 0,
              pointerEvents: activeDay ? "auto" : "none",
            }}
            onClick={() => setActiveDate(null)}
          />
          {/* Sheet */}
          <div
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-2xl overflow-hidden transition-transform duration-300"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              transform: activeDay ? "translateY(0)" : "translateY(100%)",
              maxHeight: "75vh",
            }}
          >
            {activeDay && (
              <>
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {new Date(activeDay.date + "T00:00:00").toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
                    <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                      共 {activeDay.sessions.length} 場
                    </span>
                  </p>
                  <button onClick={() => setActiveDate(null)} className="p-1 rounded" style={{ color: "var(--muted-foreground)" }}>
                    <X size={16} />
                  </button>
                </div>
                {/* Content */}
                <div className="overflow-y-auto divide-y" style={{ borderColor: "var(--border)", maxHeight: "calc(75vh - 80px)" }}>
                  {activeDay.sessions.map((session) => (
                    <SessionDetail
                      key={session.id}
                      session={session}
                      onClose={() => setActiveDate(null)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
