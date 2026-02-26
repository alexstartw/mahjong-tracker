"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SessionSummary {
  id: string;
  venue: string;
  stakes: string;
  playerCount: number;
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function navigate(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    router.push(`/calendar?year=${newYear}&month=${newMonth}`);
  }

  const selectedDay = days.find((d) => d.date.slice(0, 10) === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-green-700 text-lg">🀄 麻將記錄</span>
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            後台登入
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {year} 年 {MONTHS[month]}
          </h1>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
          >
            →
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
              const d = new Date(day.date);
              const dayNum = d.getUTCDate();
              const hasSessions = day.sessions.length > 0;
              const isSelected = selectedDate === dateStr;
              const isToday =
                dateStr === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={dateStr}
                  onClick={() =>
                    setSelectedDate(isSelected ? null : dateStr)
                  }
                  className={`min-h-[80px] p-2 text-left border-b border-r border-gray-50 transition-colors ${
                    isSelected
                      ? "bg-green-50"
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

        {/* Detail panel */}
        {selectedDay && selectedDay.sessions.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              {new Date(selectedDay.date).toLocaleDateString("zh-TW", {
                timeZone: "UTC",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <div className="space-y-3">
              {selectedDay.sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">📍 {s.venue}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      台金：{s.stakes} · {s.playerCount} 位玩家
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
