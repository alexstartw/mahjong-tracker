import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await prisma.gameSession.findUnique({
    where: { id },
    include: {
      players: { include: { player: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "牌局不存在" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { id } = await params;

  const gameSession = await prisma.gameSession.findUnique({ where: { id } });
  if (!gameSession) {
    return NextResponse.json({ error: "牌局不存在" }, { status: 404 });
  }

  const { venue, date, base, unit, note, players } = await req.json();

  if (players !== undefined) {
    if (!Array.isArray(players) || players.length < 2) {
      return NextResponse.json({ error: "至少需要 2 位玩家" }, { status: 400 });
    }
    const total = players.reduce(
      (sum: number, p: { amount: number }) => sum + p.amount,
      0,
    );
    if (total !== 0) {
      return NextResponse.json(
        { error: `金額總和須為 0（目前 ${total > 0 ? "+" : ""}${total}）` },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (players !== undefined) {
      await tx.sessionPlayer.deleteMany({ where: { sessionId: id } });
      await tx.sessionPlayer.createMany({
        data: players.map((p: { playerId: string; amount: number }) => ({
          sessionId: id,
          playerId: p.playerId,
          amount: p.amount,
        })),
      });
    }
    return tx.gameSession.update({
      where: { id },
      data: {
        ...(venue !== undefined && { venue: venue.trim() }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(base !== undefined && { base: base != null ? Number(base) : null }),
        ...(unit !== undefined && { unit: unit != null ? Number(unit) : null }),
        ...(note !== undefined && { note: note?.trim() || null }),
      },
      include: { players: { include: { player: true } } },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { id } = await params;

  const gameSession = await prisma.gameSession.findUnique({ where: { id } });
  if (!gameSession) {
    return NextResponse.json({ error: "牌局不存在" }, { status: 404 });
  }

  await prisma.gameSession.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
