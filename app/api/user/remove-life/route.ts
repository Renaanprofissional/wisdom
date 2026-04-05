import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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

    if (!lives) {
      return NextResponse.json({ ok: true });
    }

    // infinito → não remove
    if (lives.lives === 9999) {
      return NextResponse.json({ ok: true });
    }

    // remove vida
    if (lives.lives > 0) {
      await prisma.userLives.update({
        where: { userId },
        data: {
          lives: lives.lives - 1,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("REMOVE_LIFE_ERROR:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
