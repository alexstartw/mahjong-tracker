import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SessionsClient from "./SessionsClient";

async function getSessions() {
  const sessions = await prisma.gameSession.findMany({
    orderBy: { date: "desc" },
    include: {
      players: { include: { player: true } },
    },
  });

  return sessions.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    venue: s.venue,
    stakes: s.stakes,
    note: s.note,
    players: s.players.map((sp) => ({
      id: sp.id,
      playerId: sp.playerId,
      name: sp.player.name,
      amount: sp.amount,
    })),
  }));
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">牌局記錄</h1>
        <Link
          href="/admin/sessions/new"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 新增牌局
        </Link>
      </div>
      <SessionsClient initialSessions={sessions} />
    </div>
  );
}
