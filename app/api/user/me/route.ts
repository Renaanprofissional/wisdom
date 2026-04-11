import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { initializeUser } from "@/lib/init-user";
import { calculateLives } from "@/lib/lives";
import { getLevelFromXp } from "@/lib/level";
import { calculateStreak } from "@/lib/streak";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // garante estrutura inicial do usuário
    await initializeUser(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activeSubscription: {
          include: { plan: true },
        },
        activeCourse: {
          include: {
            sourceLanguage: true,
            targetLanguage: true,
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

    //  sem curso selecionado
    if (!user.activeCourseId) {
      return NextResponse.json({
        activeCourse: null,
      });
    }

    const courseId = user.activeCourseId;

    //  garante progresso
    let progress = await prisma.userProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {},
      create: {
        userId,
        courseId,
        xp: 0,
        level: 1,
      },
    });

    //  paraleliza queries
    const [lives, streak] = await Promise.all([
      prisma.userLives.findUnique({ where: { userId } }),
      prisma.userStreak.findUnique({ where: { userId } }),
    ]);

    const plan = user.activeSubscription?.plan;

    let currentLives = lives?.lives ?? 0;

    //  recalcula vidas corretamente
    if (plan && !plan.isUnlimited) {
      const recalculatedLives = calculateLives(
        currentLives,
        plan.maxLives ?? 5,
        lives?.updatedAt ?? new Date(),
      );

      if (recalculatedLives !== currentLives) {
        await prisma.userLives.update({
          where: { userId },
          data: { lives: recalculatedLives },
        });

        currentLives = recalculatedLives;
      }
    }

    //  XP
    const xp = progress.xp;
    const levelData = getLevelFromXp(xp);

    if (levelData.level !== progress.level) {
      progress = await prisma.userProgress.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          level: levelData.level,
        },
      });
    }

    //  streak
    let displayStreak = 0;

    if (streak) {
      const streakCalc = calculateStreak(streak.lastStudyAt);
      displayStreak = streakCalc.reset ? 0 : streak.currentDays;
    }

    return NextResponse.json({
      xp,
      level: levelData.level,
      currentLevelXp: levelData.currentLevelXp,
      xpToNextLevel: levelData.xpToNextLevel,

      lives: plan?.isUnlimited ? "∞" : currentLives,

      streak: displayStreak,

      plan: {
        name: plan?.name ?? "FREE",
        isUnlimited: plan?.isUnlimited ?? false,
      },

      activeCourse: user.activeCourse,
    });
  } catch (error) {
    console.error("USER_ME_ERROR:", error);

    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
