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

    // pega progresso do usuário
    const progress = await prisma.userProgress.findFirst({
      where: { userId },
    });

    // busca todas lições
    const lessons = await prisma.lesson.findMany({
      orderBy: { level: "asc" },
    });

    // aplica bloqueio por nível
    const mappedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      xpReward: lesson.xpReward,
      level: lesson.level,
      locked: lesson.level > (progress?.level ?? 1),
    }));

    return NextResponse.json(mappedLessons);
  } catch (error) {
    console.error("LESSONS_ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lições" },
      { status: 500 },
    );
  }
}
