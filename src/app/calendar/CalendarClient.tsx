"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SessionPlayer {
  id: string;
  name: string;
  amount: number;
}

interface SessionSummary {
  id: string;
  venue: string;
  stakes: string;
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
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

export default function CalendarClient({ days, year, month }: Props) {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
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
    let m = month + delta, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setActiveDate(null);
    router.push(`/calendar?year=${y}&month=${m}`);
  }

  function handleDayClick(e: React.MouseEvent<HTMLButtonElement>, day: CalendarDayData) {
    if (!day.sessions.length) return;
    const dateStr = day.date.slice(0, 10);
    if (activeDate === dateStr) { setActiveDate(null); return; }

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollY = window.scrollY;
    setPopupPos({
      top: rect.bottom + scrollY + 8,
      left: Math.min(rect.left, window.innerWidth - 320),
    });
    setActiveDate(dateStr);
  }

  const activeDay = days.find((d) => d.date.slice(0, 10) === activeDate);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: "color-mix(in srgb, var(--background) 85%, transparent)", borderColor: "var(--border)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
            🀄 麻將記錄
          </span>
          <nav className="flex items-center gap-1">
            <span className="px-4 py-1.5 rounded-lg text-sm" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)" }}>
              行事曆
            </span>
          </nav>
          <Link href="/login" className="text-sm transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
            後台登入 →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="btn-ghost w-10 h-10 flex items-center justify-center p-0 rounded-full">
            ←
          </button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
            {year} · {MONTHS[month]}
          </h1>
          <button onClick={() => navigate(1)} className="btn-ghost w-10 h-10 flex items-center justify-center p-0 rounded-full">
            →
          </button>
        </div>

        {/* Grid */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-3 text-center text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
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
              const isToday = dateStr === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={dateStr}
                  disabled={!hasSessions}
                  onClick={(e) => handleDayClick(e, day)}
                  className="min-h-[80px] p-2 text-left border-b border-r transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    background: isActive ? "var(--accent)" : "transparent",
                    cursor: hasSessions ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (hasSessions && !isActive) e.currentTarget.style.background = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    className="inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1"
                    style={{
                      fontFamily: "var(--font-serif)",
                      background: isToday ? "var(--primary)" : "transparent",
                      color: isToday ? "var(--primary-foreground)" : day.isCurrentMonth ? "var(--foreground)" : "var(--border)",
                      fontWeight: isToday ? "700" : "400",
                    }}
                  >
                    {dayNum}
                  </span>

                  {hasSessions && (
                    <div className="space-y-1 mt-1">
                      {day.sessions.map((s) => (
                        <div key={s.id} className="text-xs rounded px-1.5 py-0.5 truncate"
                          style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                          {s.venue}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          點擊有牌局的日期查看詳情
        </p>
      </main>

      {/* Floating popup */}
      {activeDay && popupPos && (
        <div
          ref={popupRef}
          className="fixed z-50 w-80 animate-fade-up"
          style={{ top: popupPos.top, left: Math.max(16, popupPos.left), background: "var(--card)", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)", borderRadius: "1rem", boxShadow: "0 20px 60px color-mix(in srgb, var(--shadow-color) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--primary) 8%, transparent)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>
              {new Date(activeDay.date + "T00:00:00").toLocaleDateString("zh-TW", { month: "long", day: "numeric" })}
            </h3>
            <button onClick={() => setActiveDate(null)} className="w-6 h-6 flex items-center justify-center rounded-full transition-colors text-sm"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}>
              ×
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {activeDay.sessions.map((session) => {
              const winners = session.players.filter((p) => p.amount > 0);
              const losers = session.players.filter((p) => p.amount < 0);
              return (
                <div key={session.id} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>📍 {session.venue}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {session.stakes}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ label: "贏", list: winners, color: "var(--win)" },
                      { label: "輸", list: losers, color: "var(--loss)" }].map(({ label, list, color }) => (
                      <div key={label}>
                        <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                        <div className="space-y-1.5">
                          {list.length === 0 ? <p className="text-xs" style={{ color: "var(--border)" }}>—</p> :
                            list.map((p) => (
                              <Link key={p.id} href={`/players/${p.id}`}
                                className="flex items-center justify-between text-xs group"
                                onClick={() => setActiveDate(null)}>
                                <span className="group-hover:underline" style={{ color: "var(--muted-foreground)" }}>{p.name}</span>
                                <span className="font-bold" style={{ color }}>
                                  {p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()}
                                </span>
                              </Link>
                            ))}
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
