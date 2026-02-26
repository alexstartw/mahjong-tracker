import { prisma } from "@/lib/prisma";
import { buildCalendarDays, groupSessionsByDate } from "@/lib/calendar";
import CalendarClient from "./CalendarClient";

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
    stakes: s.stakes,
    playerCount: s.players.length,
    players: s.players
      .map((sp) => ({ name: sp.player.name, amount: sp.amount }))
      .sort((a, b) => b.amount - a.amount),
  }));
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

  return (
    <CalendarClient
      days={days.map((d) => ({
        date: d.date.toISOString(),
        isCurrentMonth: d.isCurrentMonth,
        sessions: d.sessions,
      }))}
      year={year}
      month={month}
    />
  );
}
