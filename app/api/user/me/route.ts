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

    await initializeUser(userId);

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

    const [progress, lives, streak] = await Promise.all([
      prisma.userProgress.findFirst({ where: { userId } }),
      prisma.userLives.findUnique({ where: { userId } }),
      prisma.userStreak.findUnique({ where: { userId } }),
    ]);

    if (!progress) {
      return NextResponse.json(
        { error: "Progresso não encontrado" },
        { status: 404 },
      );
    }

    const plan = user?.activeSubscription?.plan;

    let currentLives = lives?.lives ?? 0;

    if (plan && !plan.isUnlimited) {
      currentLives = calculateLives(
        currentLives,
        plan.maxLives ?? 5,
        lives?.updatedAt ?? new Date(),
      );

      if (currentLives !== lives?.lives) {
        await prisma.userLives.update({
          where: { userId },
          data: { lives: currentLives },
        });
      }
    }

    const xp = progress.xp;

    //  recalcula level SEMPRE
    const levelData = getLevelFromXp(xp);

    if (levelData.level !== progress.level) {
      await prisma.userProgress.update({
        where: {
          userId_courseId: {
            userId,
            courseId: progress.courseId,
          },
        },
        data: {
          level: levelData.level,
        },
      });

      console.log("LEVEL SYNC:", {
        old: progress.level,
        new: levelData.level,
      });
    }

    let displayStreak = 0;

    if (streak) {
      const streakCalc = calculateStreak(streak.lastStudyAt);

      if (streakCalc.reset) {
        displayStreak = 0;
      } else {
        displayStreak = streak.currentDays;
      }
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
    });
  } catch (error) {
    console.error("USER_ME_ERROR:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
