import prisma from "../lib/prisma";
import { LessonType, LessonDifficulty } from "../app/generated/prisma/client";

async function main() {
  console.log("🌱 Seeding PRO...");

  // =========================
  // 🌍 LANGUAGES
  // =========================
  const pt = await prisma.language.upsert({
    where: { code: "pt" },
    update: {},
    create: { code: "pt", name: "Português" },
  });

  const en = await prisma.language.upsert({
    where: { code: "en" },
    update: {},
    create: { code: "en", name: "English" },
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
  // 💰 PLANS (SaaS Strategy)
  // =========================
  await prisma.plan.createMany({
    data: [
      { name: "FREE", maxLives: 5 },
      { name: "PLUS", maxLives: 10 },
      { name: "PRO", isUnlimited: true },
    ],
    skipDuplicates: true,
  });

  // =========================
  // 📘 LESSON BUILDER
  // =========================
  async function createLessonWithQuestions({
    title,
    level,
    difficulty,
    xpReward,
    questions,
  }: any) {
    const lesson = await prisma.lesson.upsert({
      where: {
        courseId_title: {
          courseId: course.id,
          title,
        },
      },
      update: {},
      create: {
        courseId: course.id,
        title,
        type: "VOCABULARY",
        level,
        difficulty,
        xpReward,
      },
    });

    // remove antigas
    await prisma.answerOption.deleteMany({
      where: { question: { lessonId: lesson.id } },
    });

    await prisma.question.deleteMany({
      where: { lessonId: lesson.id },
    });

    for (const q of questions) {
      await prisma.question.create({
        data: {
          lessonId: lesson.id,
          question: q.question,
          order: q.order,
          options: {
            create: q.options,
          },
        },
      });
    }
  }

  // =========================
  // 🧠 LESSONS (TRILHA REAL)
  // =========================

  // 🔰 LEVEL 1 - BASICS
  await createLessonWithQuestions({
    title: "Basics - Animals",
    level: 1,
    difficulty: "ROOKIE",
    xpReward: 20,
    questions: [
      {
        order: 1,
        question: "Como se diz 'cachorro'?",
        options: [
          { text: "Dog", isCorrect: true },
          { text: "Cat", isCorrect: false },
          { text: "Bird", isCorrect: false },
        ],
      },
      {
        order: 2,
        question: "Como se diz 'gato'?",
        options: [
          { text: "Dog", isCorrect: false },
          { text: "Cat", isCorrect: true },
          { text: "Fish", isCorrect: false },
        ],
      },
      {
        order: 3,
        question: "Como se diz 'pássaro'?",
        options: [
          { text: "Bird", isCorrect: true },
          { text: "Dog", isCorrect: false },
          { text: "Snake", isCorrect: false },
        ],
      },
    ],
  });

  await createLessonWithQuestions({
    title: "Basics - Food",
    level: 1,
    difficulty: "ROOKIE",
    xpReward: 20,
    questions: [
      {
        order: 1,
        question: "Como se diz 'água'?",
        options: [
          { text: "Water", isCorrect: true },
          { text: "Juice", isCorrect: false },
          { text: "Milk", isCorrect: false },
        ],
      },
      {
        order: 2,
        question: "Como se diz 'pão'?",
        options: [
          { text: "Bread", isCorrect: true },
          { text: "Rice", isCorrect: false },
          { text: "Meat", isCorrect: false },
        ],
      },
    ],
  });

  // 🔥 LEVEL 2 - SURVIVAL
  await createLessonWithQuestions({
    title: "Survival - Greetings",
    level: 2,
    difficulty: "EXPLORER",
    xpReward: 30,
    questions: [
      {
        order: 1,
        question: "Como se diz 'olá'?",
        options: [
          { text: "Hello", isCorrect: true },
          { text: "Bye", isCorrect: false },
          { text: "Thanks", isCorrect: false },
        ],
      },
      {
        order: 2,
        question: "Como se diz 'obrigado'?",
        options: [
          { text: "Please", isCorrect: false },
          { text: "Thanks", isCorrect: true },
          { text: "Sorry", isCorrect: false },
        ],
      },
    ],
  });

  // ⚡ LEVEL 3 - DAILY LIFE
  await createLessonWithQuestions({
    title: "Daily - Actions",
    level: 3,
    difficulty: "SPEAKER",
    xpReward: 40,
    questions: [
      {
        order: 1,
        question: "Como se diz 'comer'?",
        options: [
          { text: "Eat", isCorrect: true },
          { text: "Drink", isCorrect: false },
          { text: "Sleep", isCorrect: false },
        ],
      },
      {
        order: 2,
        question: "Como se diz 'dormir'?",
        options: [
          { text: "Sleep", isCorrect: true },
          { text: "Run", isCorrect: false },
          { text: "Walk", isCorrect: false },
        ],
      },
    ],
  });

  console.log("✅ Seed PRO finalizado!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
