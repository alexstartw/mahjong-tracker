import { prisma } from "@/lib/prisma";
import { buildCalendarDays, groupSessionsByDate } from "@/lib/calendar";
import CalendarClient from "./CalendarClient";

type SessionPlayer = { id: string; name: string; amount: number };
type SessionData = {
  id: string;
  date: string;
  venue: string;
  base: number | null;
  unit: number | null;
  playerCount: number;
  players: SessionPlayer[];
};

export type MonthlyStats = {
  sessionCount: number;
  playerCount: number;
  leaderboard: { id: string; name: string; amount: number }[];
};

async function getCalendarData(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const sessions = await prisma.gameSession.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
    include: {
      players: { include: { player: true } },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    venue: s.venue,
    base: s.base,
    unit: s.unit,
    playerCount: s.players.length,
    players: s.players
      .map((sp) => ({
        id: sp.playerId,
        name: sp.player.name,
        amount: sp.amount,
      }))
      .sort((a, b) => b.amount - a.amount),
  }));
}

function computeMonthlyStats(sessions: SessionData[]): MonthlyStats {
  const playerMap = new Map<string, { name: string; amount: number }>();

  for (const session of sessions) {
    for (const p of session.players) {
      const existing = playerMap.get(p.id);
      if (existing) {
        existing.amount += p.amount;
      } else {
        playerMap.set(p.id, { name: p.name, amount: p.amount });
      }
    }
  }

  const leaderboard = Array.from(playerMap.entries())
    .map(([id, { name, amount }]) => ({ id, name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    sessionCount: sessions.length,
    playerCount: playerMap.size,
    leaderboard,
  };
}

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth()), 10);

  const sessions = await getCalendarData(year, month);
  const sessionMap = groupSessionsByDate(sessions);
  const days = buildCalendarDays(year, month, sessionMap);
  const monthlyStats = computeMonthlyStats(sessions);

  return (
    <CalendarClient
      days={days.map((d) => ({
        date: d.date.toISOString(),
        isCurrentMonth: d.isCurrentMonth,
        sessions: d.sessions,
      }))}
      year={year}
      month={month}
      monthlyStats={monthlyStats}
    />
  );
}
