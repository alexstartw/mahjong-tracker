import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalPlayers, totalSessions, thisMonthSessions, playerStats, recentSessions] =
    await Promise.all([
      prisma.player.count(),
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { date: { gte: monthStart } } }),
      prisma.sessionPlayer.groupBy({
        by: ["playerId"],
        _sum: { amount: true },
        _count: { sessionId: true },
      }),
      prisma.gameSession.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: { players: { include: { player: true } } },
      }),
    ]);

  const playerIds = playerStats.map((p) => p.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, name: true },
  });
  const playerMap = new Map(players.map((p) => [p.id, p.name]));

  const ranked = playerStats
    .map((p) => ({
      id: p.playerId,
      name: playerMap.get(p.playerId) ?? "未知",
      total: p._sum.amount ?? 0,
      sessions: p._count.sessionId,
    }))
    .sort((a, b) => b.total - a.total);

  const topWinner = ranked[0] ?? null;
  const topLoser = ranked[ranked.length - 1] ?? null;

  return NextResponse.json({
    totalPlayers,
    totalSessions,
    thisMonthSessions,
    topWinner: topWinner?.total > 0 ? topWinner : null,
    topLoser: topLoser?.total < 0 ? topLoser : null,
    recentSessions: recentSessions.map((s) => ({
      id: s.id,
      date: s.date.toISOString(),
      venue: s.venue,
      stakes: s.stakes,
      players: s.players
        .map((sp) => ({ name: sp.player.name, amount: sp.amount }))
        .sort((a, b) => b.amount - a.amount),
    })),
  });
}
