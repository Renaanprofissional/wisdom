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

    //  pega usuário + curso ativo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        activeCourseId: true,
      },
    });

    if (!user?.activeCourseId) {
      return NextResponse.json([]);
    }

    //  progresso DO CURSO
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: user.activeCourseId,
        },
      },
    });

    const userLevel = progress?.level ?? 1;

    // busca SOMENTE lições do curso
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: user.activeCourseId,
      },
      orderBy: { level: "asc" },
    });

    // verifica quais já foram concluídas
    const userLessons = await prisma.userLesson.findMany({
      where: {
        userId,
        lessonId: {
          in: lessons.map((l) => l.id),
        },
      },
    });

    const completedMap = new Map(
      userLessons.map((ul) => [ul.lessonId, ul.completed]),
    );

    // monta resposta
    const mappedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      xpReward: lesson.xpReward,
      level: lesson.level,

      locked: lesson.level > userLevel,
      completed: completedMap.get(lesson.id) ?? false,
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
