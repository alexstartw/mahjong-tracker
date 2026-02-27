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
const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export default function CalendarClient({
  days,
  year,
  month,
  monthlyStats,
}: Props) {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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
    let m = month + delta,
      y = year;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setActiveDate(null);
    router.push(`/calendar?year=${y}&month=${m}`);
  }

  function handleDayClick(
    e: React.MouseEvent<HTMLButtonElement>,
    day: CalendarDayData,
  ) {
    if (!day.sessions.length) return;
    const dateStr = day.date.slice(0, 10);
    if (activeDate === dateStr) {
      setActiveDate(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY;
    setPopupPos({
      top: rect.bottom + scrollY + 6,
      left: Math.min(rect.left, window.innerWidth - 320),
    });
    setActiveDate(dateStr);
  }

  const activeDay = days.find((d) => d.date.slice(0, 10) === activeDate);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          行事曆
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--muted)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--muted-foreground)";
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-sm font-medium w-24 text-center"
            style={{ color: "var(--foreground)" }}
          >
            {year} · {MONTHS[month]}
          </span>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--muted)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--muted-foreground)";
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Weekday row */}
        <div
          className="grid grid-cols-7"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateStr = day.date.slice(0, 10);
            const dayNum = new Date(day.date).getUTCDate();
            const hasSessions = day.sessions.length > 0;
            const isActive = activeDate === dateStr;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                disabled={!hasSessions}
                onClick={(e) => handleDayClick(e, day)}
                className="min-h-[72px] p-2 text-left border-b border-r transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: isActive ? "var(--accent)" : "transparent",
                  cursor: hasSessions ? "pointer" : "default",
                }}
                onMouseEnter={(e) => {
                  if (hasSessions && !isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                {/* Day number */}
                <span
                  className="inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1"
                  style={{
                    background: isToday ? "var(--primary)" : "transparent",
                    color: isToday
                      ? "var(--primary-foreground)"
                      : day.isCurrentMonth
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    opacity: day.isCurrentMonth ? 1 : 0.35,
                  }}
                >
                  {dayNum}
                </span>

                {/* Session badges */}
                {hasSessions && (
                  <div className="space-y-0.5 mt-0.5">
                    {day.sessions.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className="text-[10px] rounded px-1.5 py-0.5 truncate font-medium"
                        style={{
                          background:
                            "color-mix(in srgb, var(--primary) 12%, transparent)",
                          color: "var(--primary)",
                        }}
                      >
                        {s.venue}
                      </div>
                    ))}
                    {day.sessions.length > 2 && (
                      <div
                        className="text-[10px]"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        +{day.sessions.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p
        className="mt-3 text-xs text-center"
        style={{ color: "var(--muted-foreground)" }}
      >
        點擊有牌局的日期查看詳情
      </p>

      {/* Monthly stats */}
      {monthlyStats.sessionCount > 0 ? (
        <div className="card p-5 space-y-4">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            本月統計
          </h2>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "場數", value: monthlyStats.sessionCount },
              { label: "參與人數", value: monthlyStats.playerCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg p-3 text-center"
                style={{ background: "var(--muted)" }}
              >
                <p
                  className="text-xl font-bold tabular-nums"
                  style={{ color: "var(--foreground)" }}
                >
                  {value}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              積分排行
            </p>
            <div className="space-y-1">
              {monthlyStats.leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{
                    background:
                      i === 0
                        ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                        : "transparent",
                  }}
                >
                  <span
                    className="w-5 text-xs font-semibold text-center shrink-0"
                    style={{
                      color:
                        i === 0 ? "var(--primary)" : "var(--muted-foreground)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <Link
                    href={`/players/${p.id}`}
                    className="flex-1 text-sm hover:underline"
                    style={{ color: "var(--foreground)" }}
                  >
                    {p.name}
                  </Link>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color: p.amount >= 0 ? "var(--win)" : "var(--loss)",
                    }}
                  >
                    {p.amount > 0 ? "+" : ""}
                    {p.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card p-5 text-center text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          本月尚無牌局
        </div>
      )}

      {/* Popup */}
      {activeDay && popupPos && (
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
          {/* Popup header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {new Date(activeDay.date + "T00:00:00").toLocaleDateString(
                "zh-TW",
                { month: "long", day: "numeric" },
              )}
            </p>
            <button
              onClick={() => setActiveDate(null)}
              className="p-0.5 rounded transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "var(--foreground)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "var(--muted-foreground)")
              }
            >
              <X size={14} />
            </button>
          </div>

          {/* Sessions */}
          <div className="max-h-72 overflow-y-auto">
            {activeDay.sessions.map((session, i) => {
              const winners = session.players.filter((p) => p.amount > 0);
              const losers = session.players.filter((p) => p.amount < 0);
              return (
                <div
                  key={session.id}
                  className="px-4 py-3"
                  style={{
                    borderBottom:
                      i < activeDay.sessions.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {session.venue}
                    </span>
                    {(session.base != null || session.unit != null) && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--muted)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {[
                          session.base != null && `底 ${session.base}`,
                          session.unit != null && `台 ${session.unit}`,
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "贏", list: winners, color: "var(--win)" },
                      { label: "輸", list: losers, color: "var(--loss)" },
                    ].map(({ label, list, color }) => (
                      <div key={label}>
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1.5"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {label}
                        </p>
                        <div className="space-y-1">
                          {list.length === 0 ? (
                            <span
                              className="text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              —
                            </span>
                          ) : (
                            list.map((p) => (
                              <Link
                                key={p.id}
                                href={`/players/${p.id}`}
                                onClick={() => setActiveDate(null)}
                                className="flex items-center justify-between group hover:opacity-70 transition-opacity"
                              >
                                <span
                                  className="text-xs group-hover:underline"
                                  style={{ color: "var(--muted-foreground)" }}
                                >
                                  {p.name}
                                </span>
                                <span
                                  className="text-xs font-semibold tabular"
                                  style={{ color }}
                                >
                                  {p.amount > 0 ? "+" : ""}
                                  {p.amount.toLocaleString()}
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}
