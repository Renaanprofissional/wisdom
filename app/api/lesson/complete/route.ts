import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getLevelFromXp } from "@/lib/level";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const lessonId = body?.lessonId;
    const userId = session.user.id;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId é obrigatório" },
        { status: 400 },
      );
    }

    //  busca lição
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lição não encontrada" },
        { status: 404 },
      );
    }

    //  progresso
    const progress = await prisma.userProgress.findFirst({
      where: { userId },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Progresso não encontrado" },
        { status: 404 },
      );
    }

    //  bloqueio por nível
    if (lesson.level > progress.level) {
      return NextResponse.json(
        { error: "Lição bloqueada 🔒" },
        { status: 403 },
      );
    }

    //  assinatura + plano
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activeSubscription: {
          include: { plan: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const isUnlimited = user.activeSubscription?.plan.isUnlimited ?? false;

    const lives = await prisma.userLives.findUnique({
      where: { userId },
    });

    // bloqueio por vida
    if (!isUnlimited && (lives?.lives ?? 0) <= 0) {
      return NextResponse.json({ error: "Sem vidas 💔" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🔍 verifica se já completou
      const existing = await tx.userLesson.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      if (existing?.completed) {
        throw new Error("LESSON_ALREADY_COMPLETED");
      }

      //  XP + LEVEL
      const newXp = progress.xp + lesson.xpReward;
      const levelData = getLevelFromXp(newXp);

      await tx.userProgress.update({
        where: {
          userId_courseId: {
            userId,
            courseId: progress.courseId,
          },
        },
        data: {
          xp: newXp,
          level: levelData.level,
          completedLessons: {
            increment: 1,
          },
        },
      });

      //  salva conclusão
      await tx.userLesson.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
        },
      });

      // adiciona vida
      if (!isUnlimited) {
        await tx.userLives.update({
          where: { userId },
          data: {
            lives: {
              increment: 1,
            },
          },
        });
      }

      return {
        xpGained: lesson.xpReward,
        totalXp: newXp,
        level: levelData.level,
        currentLevelXp: levelData.currentLevelXp,
        xpToNextLevel: levelData.xpToNextLevel,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("COMPLETE_LESSON_ERROR:", error);
    //  erro controlado
    if (error.message === "LESSON_ALREADY_COMPLETED") {
      return NextResponse.json(
        { error: "Lição já concluída" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
