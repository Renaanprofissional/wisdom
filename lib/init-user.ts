import prisma from "@/lib/prisma";

export async function initializeUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activeSubscription: true,
    },
  });

  if (user?.activeSubscription) return;

  const freePlan = await prisma.plan.findUnique({
    where: { name: "FREE" },
  });

  const course = await prisma.course.findFirst();

  if (!freePlan || !course) return;

  await prisma.$transaction(async (tx) => {
    // 🔥 cria subscription
    const subscription = await tx.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
      },
    });

    // 🔥 define como ativa
    await tx.user.update({
      where: { id: userId },
      data: {
        activeSubscriptionId: subscription.id,
      },
    });

    //  PROGRESSO
    await tx.userProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId,
        courseId: course.id,
      },
    });

    // VIDAS
    await tx.userLives.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        lives: freePlan.maxLives ?? 5,
      },
    });

    //  STREAK
    await tx.userStreak.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
      },
    });
  });
}
