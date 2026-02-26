import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
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
