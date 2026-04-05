import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;

  const lives = await prisma.userLives.findUnique({
    where: { userId },
  });

  if (!lives) return NextResponse.json({ ok: true });

  if (lives.lives > 0) {
    await prisma.userLives.update({
      where: { userId },
      data: { lives: lives.lives - 1 },
    });
  }

  return NextResponse.json({ ok: true });
}
