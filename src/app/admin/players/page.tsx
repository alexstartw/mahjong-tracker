import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PlayersClient from "./PlayersClient";

async function getPlayersWithStats() {
  const players = await prisma.player.findMany({
    orderBy: { createdAt: "asc" },
    include: { sessions: true },
  });

  return players
    .map((player) => ({
      id: player.id,
      name: player.name,
      isGuest: player.isGuest,
      createdAt: player.createdAt.toISOString(),
      stats: {
        sessionCount: player.sessions.length,
        totalAmount: player.sessions.reduce((sum, sp) => sum + sp.amount, 0),
      },
    }))
    .sort((a, b) => b.stats.totalAmount - a.stats.totalAmount);
}

export default async function PlayersPage() {
  const [players, session] = await Promise.all([getPlayersWithStats(), auth()]);
  return <PlayersClient initialPlayers={players} isLoggedIn={!!session} />;
}
