import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      include: {
        progresses: true,
        streak: true,
      },
    });

    const ranking = users.map((user) => {
      const progress = user.progresses?.[0];
      const streak = user.streak;

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        xp: progress?.xp ?? 0,
        level: progress?.level ?? 1,
        streak: streak?.currentDays ?? 0,
      };
    });

    // 🔥 ordena por streak primeiro (ou troca por xp)
    ranking.sort((a, b) => b.streak - a.streak);

    return NextResponse.json(ranking);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
