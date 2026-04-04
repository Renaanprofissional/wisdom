import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const [progress, lives, streak, subscription] = await Promise.all([
      prisma.userProgress.findFirst({
        where: { userId },
      }),
      prisma.userLives.findUnique({
        where: { userId },
      }),
      prisma.userStreak.findUnique({
        where: { userId },
      }),
      prisma.subscription.findFirst({
        where: { userId },
        include: { plan: true },
      }),
    ]);

    return NextResponse.json({
      xp: progress?.xp ?? 0,
      level: progress?.level ?? 1,
      lives: subscription?.plan.isUnlimited ? "∞" : (lives?.lives ?? 0),
      streak: streak?.currentDays ?? 0,

      // 🆕 PLANO
      plan: {
        name: subscription?.plan.name ?? "FREE",
        isUnlimited: subscription?.plan.isUnlimited ?? false,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
