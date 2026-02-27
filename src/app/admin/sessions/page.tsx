import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import SessionsClient from "./SessionsClient";
import { Plus } from "lucide-react";

async function getSessions() {
  const sessions = await prisma.gameSession.findMany({
    orderBy: { date: "desc" },
    include: { players: { include: { player: true } } },
  });
  return sessions.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    venue: s.venue,
    base: s.base,
    unit: s.unit,
    note: s.note,
    players: s.players.map((sp) => ({
      id: sp.id,
      playerId: sp.playerId,
      name: sp.player.name,
      amount: sp.amount,
    })),
  }));
}

async function getPlayers() {
  const players = await prisma.player.findMany({ orderBy: { name: "asc" } });
  return players.map((p) => ({ id: p.id, name: p.name, isGuest: p.isGuest }));
}

export default async function SessionsPage() {
  const [sessions, players, session] = await Promise.all([
    getSessions(),
    getPlayers(),
    auth(),
  ]);
  const isLoggedIn = !!session;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          牌局記錄
        </h1>
        {isLoggedIn && (
          <Link href="/admin/sessions/new" className="btn-primary">
            <Plus size={14} /> 新增牌局
          </Link>
        )}
      </div>
      <SessionsClient
        initialSessions={sessions}
        allPlayers={players}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
