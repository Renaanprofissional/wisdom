import prisma from "../lib/prisma";
import { LessonType, LessonDifficulty } from "../app/generated/prisma/client";

async function main() {
  console.log("🌱 Seeding...");

  // =========================
  // 🌍 LANGUAGES
  // =========================
  const pt = await prisma.language.upsert({
    where: { code: "pt" },
    update: {},
    create: {
      code: "pt",
      name: "Português",
    },
  });

  const en = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: {
      code: "en",
      name: "English",
    },
  });

  // =========================
  // 📚 COURSE
  // =========================
  const course = await prisma.course.upsert({
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

  // =========================
  // 💰 PLANS
  // =========================
  const freePlan = await prisma.plan.upsert({
    where: { name: "FREE" },
    update: {},
    create: {
      name: "FREE",
      maxLives: 5,
      isUnlimited: false,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: "PRO" },
    update: {},
    create: {
      name: "PRO",
      isUnlimited: true,
    },
  });

  // =========================
  // 📘 LESSONS
  // =========================
  const lesson1 = await prisma.lesson.upsert({
    where: {
      courseId_title: {
        courseId: course.id,
        title: "Basics 1",
      },
    },
    update: {},
    create: {
      courseId: course.id,
      title: "Basics 1",
      type: "VOCABULARY",
      level: 1,
      difficulty: "ROOKIE",
      xpReward: 20,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: {
      courseId_title: {
        courseId: course.id,
        title: "Basics 2",
      },
    },
    update: {},
    create: {
      courseId: course.id,
      title: "Basics 2",
      type: "VOCABULARY",
      level: 2,
      difficulty: "ROOKIE",
      xpReward: 25,
    },
  });

  // =========================
  // ❓ QUESTIONS (LESSON 1)
  // =========================

  // limpa antigas (evita duplicação)
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();

  const q1 = await prisma.question.create({
    data: {
      lessonId: lesson1.id,
      question: "Como se diz 'cachorro' em inglês?",
      order: 1,
      options: {
        create: [
          { text: "Dog", isCorrect: true },
          { text: "Cat", isCorrect: false },
          { text: "Bird", isCorrect: false },
        ],
      },
    },
  });

  const q2 = await prisma.question.create({
    data: {
      lessonId: lesson1.id,
      question: "Como se diz 'gato' em inglês?",
      order: 2,
      options: {
        create: [
          { text: "Dog", isCorrect: false },
          { text: "Cat", isCorrect: true },
          { text: "Fish", isCorrect: false },
        ],
      },
    },
  });

  // =========================
  // ❓ QUESTIONS (LESSON 2)
  // =========================

  const q3 = await prisma.question.create({
    data: {
      lessonId: lesson2.id,
      question: "Como se diz 'água' em inglês?",
      order: 1,
      options: {
        create: [
          { text: "Water", isCorrect: true },
          { text: "Fire", isCorrect: false },
          { text: "Earth", isCorrect: false },
        ],
      },
    },
  });

  const q4 = await prisma.question.create({
    data: {
      lessonId: lesson2.id,
      question: "Como se diz 'fogo' em inglês?",
      order: 2,
      options: {
        create: [
          { text: "Water", isCorrect: false },
          { text: "Fire", isCorrect: true },
          { text: "Air", isCorrect: false },
        ],
      },
    },
  });

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
