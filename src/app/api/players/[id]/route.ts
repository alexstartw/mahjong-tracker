import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { id } = await params;

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    return NextResponse.json({ error: "玩家不存在" }, { status: 404 });
  }

  const { name, isGuest } = await req.json();

  if (name !== undefined && name.trim() !== player.name) {
    const existing = await prisma.player.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "玩家名稱已存在" }, { status: 409 });
    }
  }

  const updated = await prisma.player.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(isGuest !== undefined && { isGuest }),
    },
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

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    return NextResponse.json({ error: "玩家不存在" }, { status: 404 });
  }

  await prisma.player.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
