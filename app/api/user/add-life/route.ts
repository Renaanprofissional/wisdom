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

    // busca usuário com plano
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activeSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const plan = user.activeSubscription?.plan;

    const lives = await prisma.userLives.findUnique({
      where: { userId },
    });

    if (!lives) {
      return NextResponse.json(
        { error: "Lives não encontradas" },
        { status: 404 },
      );
    }

    //  PRO
    if (plan?.isUnlimited) {
      return NextResponse.json({ ok: true });
    }

    const maxLives = plan?.maxLives ?? 5;

    // já está no máximo
    if (lives.lives >= maxLives) {
      return NextResponse.json({ ok: true });
    }

    //  adiciona 1 vida
    await prisma.userLives.update({
      where: { userId },
      data: {
        lives: lives.lives + 1,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ADD_LIFE_ERROR:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
