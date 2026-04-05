import prisma from "../lib/prisma";
import { LessonType, LessonDifficulty } from "../app/generated/prisma/client";

async function main() {
  console.log("🌱 Seeding ULTRA...");

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
  // 💰 PLANS
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
  // 🧠 HELPERS
  // =========================

  const lessonThemes = [
    "Animals",
    "Food",
    "People",
    "Travel",
    "Work",
    "Emotions",
    "Health",
    "Shopping",
    "Technology",
    "Education",
  ];

  const xpByDifficulty = {
    ROOKIE: 20,
    EXPLORER: 35,
    SPEAKER: 50,
    THINKER: 70,
    FLUENT: 90,
    MASTER: 120,
  };

  function getDifficulty(level: number): LessonDifficulty {
    if (level <= 3) return "ROOKIE";
    if (level <= 6) return "EXPLORER";
    if (level <= 9) return "SPEAKER";
    if (level <= 12) return "THINKER";
    if (level <= 16) return "FLUENT";
    return "MASTER";
  }

  function generateQuestions(level: number) {
    const base = 5;
    const extra = Math.floor(level / 2);
    const total = base + extra;

    const templates = [
      () => ({
        question: "Como se diz 'cachorro'?",
        options: [
          { text: "Dog", isCorrect: true },
          { text: "Cat", isCorrect: false },
          { text: "Bird", isCorrect: false },
        ],
      }),
      () => ({
        question: "Como se diz 'gato'?",
        options: [
          { text: "Cat", isCorrect: true },
          { text: "Dog", isCorrect: false },
          { text: "Fish", isCorrect: false },
        ],
      }),
      () => ({
        question: "Traduza: 'I eat every day'",
        options: [
          { text: "Eu como todo dia", isCorrect: true },
          { text: "Eu bebo todo dia", isCorrect: false },
          { text: "Eu vejo todo dia", isCorrect: false },
        ],
      }),
      () => ({
        question: "Traduza: 'She is happy'",
        options: [
          { text: "Ela está feliz", isCorrect: true },
          { text: "Ela está triste", isCorrect: false },
          { text: "Ela está cansada", isCorrect: false },
        ],
      }),
      () => ({
        question: "Como se diz 'correr'?",
        options: [
          { text: "Run", isCorrect: true },
          { text: "Sleep", isCorrect: false },
          { text: "Eat", isCorrect: false },
        ],
      }),
      () => ({
        question: "Traduza: 'They are friends'",
        options: [
          { text: "Eles são amigos", isCorrect: true },
          { text: "Eles estão amigos", isCorrect: false },
          { text: "Eles têm amigos", isCorrect: false },
        ],
      }),
    ];

    return Array.from({ length: total }).map((_, i) => {
      const template = templates[i % templates.length]();
      return {
        order: i + 1,
        ...template,
      };
    });
  }

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
  // 🔥 GENERATE LEVELS 1 → 20
  // =========================

  for (let level = 1; level <= 20; level++) {
    const difficulty = getDifficulty(level);
    const xpReward = xpByDifficulty[difficulty];

    for (let i = 0; i < 3; i++) {
      const theme = lessonThemes[i % lessonThemes.length];

      await createLessonWithQuestions({
        title: `Level ${level} - ${theme} ${i + 1}`,
        level,
        difficulty,
        xpReward,
        questions: generateQuestions(level),
      });
    }
  }

  console.log("✅ Seed ULTRA finalizado!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
