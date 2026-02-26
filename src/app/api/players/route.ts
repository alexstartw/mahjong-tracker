import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      sessions: {
        include: { session: true },
      },
    },
  });

  const playersWithStats = players.map((player) => {
    const totalAmount = player.sessions.reduce((sum, sp) => sum + sp.amount, 0);
    const sessionCount = player.sessions.length;
    return {
      id: player.id,
      name: player.name,
      isGuest: player.isGuest,
      createdAt: player.createdAt,
      stats: { sessionCount, totalAmount },
    };
  });

  return NextResponse.json(playersWithStats);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { name, isGuest } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "玩家名稱不能為空" }, { status: 400 });
  }

  const trimmedName = name.trim();

  const existing = await prisma.player.findUnique({
    where: { name: trimmedName },
  });

  if (existing) {
    return NextResponse.json({ error: "玩家名稱已存在" }, { status: 409 });
  }

  const player = await prisma.player.create({
    data: { name: trimmedName, isGuest: isGuest ?? false },
  });

  return NextResponse.json(player, { status: 201 });
}
