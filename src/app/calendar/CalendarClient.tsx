"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SessionPlayer {
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
const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

export default function CalendarClient({ days, year, month }: Props) {
  const router = useRouter();
  const [popup, setPopup] = useState<{
    dateStr: string;
    sessions: SessionSummary[];
    rect: DOMRect;
  } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function navigate(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setPopup(null);
    router.push(`/calendar?year=${newYear}&month=${newMonth}`);
  }

  function handleDayClick(
    e: React.MouseEvent<HTMLButtonElement>,
    day: CalendarDayData
  ) {
    if (day.sessions.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dateStr = day.date.slice(0, 10);
    if (popup?.dateStr === dateStr) {
      setPopup(null);
    } else {
      setPopup({ dateStr, sessions: day.sessions, rect });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-0 flex items-center justify-between h-16">
          <span className="font-bold text-green-700 text-lg">🀄 麻將記錄</span>
          <nav className="flex items-center gap-1">
            <a
              href="/calendar"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700"
            >
              行事曆
            </a>
          </nav>
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            後台登入 →
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 text-lg"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {year} 年 {MONTHS[month]}
          </h1>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 text-lg"
          >
            →
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-medium text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dateStr = day.date.slice(0, 10);
              const dayNum = new Date(day.date).getUTCDate();
              const hasSessions = day.sessions.length > 0;
              const isSelected = popup?.dateStr === dateStr;
              const isToday = dateStr === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={dateStr}
                  onClick={(e) => handleDayClick(e, day)}
                  disabled={!hasSessions}
                  className={`min-h-[80px] p-2 text-left border-b border-r border-gray-50 transition-colors ${
                    isSelected
                      ? "bg-green-50 ring-2 ring-inset ring-green-400"
                      : hasSessions
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "cursor-default"
                  }`}
                >
                  <span
                    className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${
                      isToday
                        ? "bg-green-600 text-white"
                        : day.isCurrentMonth
                          ? "text-gray-800"
                          : "text-gray-300"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {hasSessions && (
                    <div className="space-y-1">
                      {day.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5 truncate"
                        >
                          {s.venue} · {s.playerCount}人
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          點擊有牌局的日期查看詳情
        </p>
      </main>

      {/* Popup */}
      {popup && (
        <PopupPanel
          ref={popupRef}
          dateStr={popup.dateStr}
          sessions={popup.sessions}
          anchorRect={popup.rect}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

import { forwardRef } from "react";

const PopupPanel = forwardRef<
  HTMLDivElement,
  {
    dateStr: string;
    sessions: SessionSummary[];
    anchorRect: DOMRect;
    onClose: () => void;
  }
>(function PopupPanel({ dateStr, sessions, onClose }, ref) {
  const date = new Date(dateStr + "T00:00:00");

  return (
    <div
      ref={ref}
      className="fixed z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      style={{
        top: Math.min(
          window.scrollY + window.innerHeight - 420,
          Math.max(60, window.scrollY + window.innerHeight / 2 - 200)
        ),
        left: Math.min(
          window.innerWidth - 340,
          Math.max(16, window.innerWidth / 2 - 160)
        ),
      }}
    >
      {/* Popup header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">
          {date.toLocaleDateString("zh-TW", {
            month: "long",
            day: "numeric",
          })}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Sessions */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {sessions.map((session) => {
          const winners = session.players.filter((p) => p.amount > 0);
          const losers = session.players.filter((p) => p.amount < 0);

          return (
            <div key={session.id} className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">
                  📍 {session.venue}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {session.stakes}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">贏</p>
                  <div className="space-y-1">
                    {winners.length === 0 ? (
                      <p className="text-xs text-gray-300">—</p>
                    ) : (
                      winners.map((p) => (
                        <div key={p.name} className="flex justify-between text-xs">
                          <span className="text-gray-700">{p.name}</span>
                          <span className="text-green-600 font-semibold">
                            +{p.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">輸</p>
                  <div className="space-y-1">
                    {losers.length === 0 ? (
                      <p className="text-xs text-gray-300">—</p>
                    ) : (
                      losers.map((p) => (
                        <div key={p.name} className="flex justify-between text-xs">
                          <span className="text-gray-700">{p.name}</span>
                          <span className="text-red-500 font-semibold">
                            {p.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
