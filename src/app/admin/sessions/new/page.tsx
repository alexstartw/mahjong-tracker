import { prisma } from "@/lib/prisma";
import NewSessionClient from "./NewSessionClient";

async function getPlayers() {
  const players = await prisma.player.findMany({
    orderBy: [{ isGuest: "asc" }, { name: "asc" }],
  });
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    isGuest: p.isGuest,
  }));
}

export default async function NewSessionPage() {
  const players = await getPlayers();
  return <NewSessionClient players={players} />;
}
