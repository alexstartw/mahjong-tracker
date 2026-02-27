import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.gameSession.findMany({
    orderBy: { date: "desc" },
    include: {
      players: {
        include: { player: true },
      },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { date, venue, base, unit, note, players } = await req.json();

  if (!date || !venue) {
    return NextResponse.json({ error: "日期、地點為必填" }, { status: 400 });
  }

  if (!Array.isArray(players) || players.length < 2) {
    return NextResponse.json({ error: "至少需要 2 位玩家" }, { status: 400 });
  }

  for (const p of players) {
    if (typeof p.playerId !== "string" || typeof p.amount !== "number") {
      return NextResponse.json({ error: "玩家資料格式錯誤" }, { status: 400 });
    }
  }

  const gameSession = await prisma.gameSession.create({
    data: {
      date: new Date(date),
      venue: venue.trim(),
      base: base != null ? Number(base) : null,
      unit: unit != null ? Number(unit) : null,
      note: note?.trim() || null,
      players: {
        create: players.map((p: { playerId: string; amount: number }) => ({
          playerId: p.playerId,
          amount: p.amount,
        })),
      },
    },
    include: {
      players: { include: { player: true } },
    },
  });

  return NextResponse.json(gameSession, { status: 201 });
}
