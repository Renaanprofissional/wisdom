import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      include: {
        progresses: true,
        streak: true,
        activeSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    const ranking = users.map((user) => {
      const progress = user.progresses?.[0];
      const streak = user.streak;
      const plan = user.activeSubscription?.plan;

      return {
        id: user.id,
        name: user.name,
        image: user.image,

        xp: progress?.xp ?? 0,
        level: progress?.level ?? 1,
        streak: streak?.currentDays ?? 0,

        isPro: plan?.name === "PRO",
      };
    });

    // Ordena por XP e usa streak como desempate
    ranking.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.streak - a.streak;
    });

    return NextResponse.json(ranking);
  } catch (err) {
    console.error("RANKING_ERROR:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
