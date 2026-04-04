import { PrismaClient } from "../app/generated/prisma/client";

import prisma from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // 🧠 PLANOS
  const freePlan = await prisma.plan.upsert({
    where: { name: "FREE" },
    update: {},
    create: {
      name: "FREE",
      maxLives: 5,
      isUnlimited: false,
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { name: "PREMIUM" },
    update: {},
    create: {
      name: "PREMIUM",
      maxLives: null,
      isUnlimited: true,
    },
  });

  // 🌍 IDIOMAS
  const pt = await prisma.language.upsert({
    where: { code: "pt-BR" },
    update: {},
    create: {
      code: "pt-BR",
      name: "Português (Brasil)",
    },
  });

  const en = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: {
      code: "en",
      name: "Inglês",
    },
  });

  const fr = await prisma.language.upsert({
    where: { code: "fr" },
    update: {},
    create: {
      code: "fr",
      name: "Francês",
    },
  });

  // 📚 CURSOS
  const ptToEn = await prisma.course.upsert({
    where: {
      sourceLanguageId_targetLanguageId: {
        sourceLanguageId: pt.id,
        targetLanguageId: en.id,
      },
    },
    update: {},
    create: {
      sourceLanguageId: pt.id,
      targetLanguageId: en.id,
    },
  });

  const enToPt = await prisma.course.upsert({
    where: {
      sourceLanguageId_targetLanguageId: {
        sourceLanguageId: en.id,
        targetLanguageId: pt.id,
      },
    },
    update: {},
    create: {
      sourceLanguageId: en.id,
      targetLanguageId: pt.id,
    },
  });

  // 🧩 LIÇÕES
  await prisma.lesson.createMany({
    data: [
      {
        courseId: ptToEn.id,
        title: "Saudações",
        type: "VOCABULARY",
        level: 1,
        xpReward: 10,
      },
      {
        courseId: ptToEn.id,
        title: "Verbo To Be",
        type: "GRAMMAR",
        level: 1,
        xpReward: 15,
      },
      {
        courseId: ptToEn.id,
        title: "Listening Básico",
        type: "LISTENING",
        level: 2,
        xpReward: 20,
      },
    ],
  });

  console.log("✅ Seed finalizado!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
