import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SessionsClient from "./SessionsClient";

async function getSessions() {
  const sessions = await prisma.gameSession.findMany({
    orderBy: { date: "desc" },
    include: { players: { include: { player: true } } },
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
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: "#c9a84c" }}>
          牌局記錄
        </h1>
        <Link href="/admin/sessions/new" className="btn-gold px-5 py-2.5 text-sm">
          + 新增牌局
        </Link>
      </div>
      <SessionsClient initialSessions={sessions} />
    </div>
  );
}
