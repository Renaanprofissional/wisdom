import prisma from "../lib/prisma";
import { LessonType, LessonDifficulty } from "../app/generated/prisma/client";

async function main() {
  console.log("🌱 Seeding PRO...");

  const [pt, en] = await Promise.all([
    prisma.language.upsert({
      where: { code: "pt" },
      update: {},
      create: { code: "pt", name: "Português" },
    }),
    prisma.language.upsert({
      where: { code: "en" },
      update: {},
      create: { code: "en", name: "English" },
    }),
  ]);

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

  await prisma.plan.upsert({
    where: { name: "FREE" },
    update: {},
    create: { name: "FREE", maxLives: 5 },
  });

  await prisma.plan.upsert({
    where: { name: "PRO" },
    update: {},
    create: { name: "PRO", isUnlimited: true },
  });

  async function createLesson({
    title,
    level,
    xp,
    difficulty,
    type = "VOCABULARY",
    questions,
  }: any) {
    const existing = await prisma.lesson.findUnique({
      where: {
        courseId_title: {
          courseId: course.id,
          title,
        },
      },
    });

    if (existing) {
      console.log(`↩️  Lição "${title}" já existe, pulando...`);
      return existing;
    }

    return prisma.lesson.create({
      data: {
        courseId: course.id,
        title,
        level,
        xpReward: xp,
        difficulty,
        type,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            order: index + 1,
            options: {
              create: q.options,
            },
          })),
        },
      },
    });
  }

  const lessons = [
    {
      title: "Basics 1",
      level: 1,
      xp: 100,
      difficulty: "ROOKIE",
      questions: [
        {
          question: "Como se diz 'cachorro'?",
          options: [
            { text: "Cat", isCorrect: false },
            { text: "Dog", isCorrect: true },
            { text: "Bird", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'gato'?",
          options: [
            { text: "Dog", isCorrect: false },
            { text: "Fish", isCorrect: false },
            { text: "Cat", isCorrect: true },
          ],
        },
        {
          question: "Como se diz 'pássaro'?",
          options: [
            { text: "Cow", isCorrect: false },
            { text: "Bird", isCorrect: true },
            { text: "Pig", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Basics 2",
      level: 1,
      xp: 110,
      difficulty: "ROOKIE",
      questions: [
        {
          question: "Como se diz 'água'?",
          options: [
            { text: "Fire", isCorrect: false },
            { text: "Water", isCorrect: true },
            { text: "Air", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'fogo'?",
          options: [
            { text: "Earth", isCorrect: false },
            { text: "Fire", isCorrect: true },
            { text: "Water", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Food 1",
      level: 2,
      xp: 130,
      difficulty: "ROOKIE",
      questions: [
        {
          question: "Como se diz 'maçã'?",
          options: [
            { text: "Banana", isCorrect: false },
            { text: "Apple", isCorrect: true },
            { text: "Grape", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'banana'?",
          options: [
            { text: "Orange", isCorrect: false },
            { text: "Banana", isCorrect: true },
            { text: "Apple", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Food 2",
      level: 2,
      xp: 140,
      difficulty: "EXPLORER",
      questions: [
        {
          question: "Como se diz 'pão'?",
          options: [
            { text: "Milk", isCorrect: false },
            { text: "Bread", isCorrect: true },
            { text: "Rice", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'leite'?",
          options: [
            { text: "Juice", isCorrect: false },
            { text: "Water", isCorrect: false },
            { text: "Milk", isCorrect: true },
          ],
        },
      ],
    },
    {
      title: "Travel 1",
      level: 3,
      xp: 160,
      difficulty: "EXPLORER",
      questions: [
        {
          question: "Como se diz 'avião'?",
          options: [
            { text: "Train", isCorrect: false },
            { text: "Plane", isCorrect: true },
            { text: "Car", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'carro'?",
          options: [
            { text: "Boat", isCorrect: false },
            { text: "Bike", isCorrect: false },
            { text: "Car", isCorrect: true },
          ],
        },
      ],
    },
    {
      title: "Travel 2",
      level: 3,
      xp: 180,
      difficulty: "EXPLORER",
      questions: [
        {
          question: "Como se diz 'hotel'?",
          options: [
            { text: "School", isCorrect: false },
            { text: "Hotel", isCorrect: true },
            { text: "Hospital", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'aeroporto'?",
          options: [
            { text: "Station", isCorrect: false },
            { text: "Airport", isCorrect: true },
            { text: "Market", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Grammar 1",
      level: 4,
      xp: 200,
      difficulty: "SPEAKER",
      type: "GRAMMAR",
      questions: [
        {
          question: "Complete: I ___ a student",
          options: [
            { text: "is", isCorrect: false },
            { text: "am", isCorrect: true },
            { text: "are", isCorrect: false },
          ],
        },
        {
          question: "Complete: They ___ happy",
          options: [
            { text: "am", isCorrect: false },
            { text: "are", isCorrect: true },
            { text: "is", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Grammar 2",
      level: 4,
      xp: 220,
      difficulty: "SPEAKER",
      type: "GRAMMAR",
      questions: [
        {
          question: "Complete: She ___ my friend",
          options: [
            { text: "are", isCorrect: false },
            { text: "is", isCorrect: true },
            { text: "am", isCorrect: false },
          ],
        },
        {
          question: "Complete: We ___ ready",
          options: [
            { text: "is", isCorrect: false },
            { text: "are", isCorrect: true },
            { text: "am", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Conversation 1",
      level: 5,
      xp: 250,
      difficulty: "THINKER",
      questions: [
        {
          question: "Como se diz 'Como você está?'",
          options: [
            { text: "Where are you?", isCorrect: false },
            { text: "How are you?", isCorrect: true },
            { text: "Who are you?", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'Bom dia'?",
          options: [
            { text: "Good night", isCorrect: false },
            { text: "Good morning", isCorrect: true },
            { text: "Good evening", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Conversation 2",
      level: 5,
      xp: 280,
      difficulty: "THINKER",
      questions: [
        {
          question: "Como se diz 'Boa noite'?",
          options: [
            { text: "Good afternoon", isCorrect: false },
            { text: "Good night", isCorrect: true },
            { text: "Good morning", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'Até logo'?",
          options: [
            { text: "Hello", isCorrect: false },
            { text: "See you later", isCorrect: true },
            { text: "Goodbye", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Numbers 1",
      level: 2,
      xp: 120,
      difficulty: "ROOKIE",
      questions: [
        {
          question: "Como se diz 'três'?",
          options: [
            { text: "Two", isCorrect: false },
            { text: "Three", isCorrect: true },
            { text: "Four", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'dez'?",
          options: [
            { text: "Nine", isCorrect: false },
            { text: "Eleven", isCorrect: false },
            { text: "Ten", isCorrect: true },
          ],
        },
      ],
    },
    {
      title: "Colors 1",
      level: 2,
      xp: 120,
      difficulty: "ROOKIE",
      questions: [
        {
          question: "Como se diz 'vermelho'?",
          options: [
            { text: "Blue", isCorrect: false },
            { text: "Red", isCorrect: true },
            { text: "Green", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'azul'?",
          options: [
            { text: "Yellow", isCorrect: false },
            { text: "Blue", isCorrect: true },
            { text: "Black", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Family 1",
      level: 3,
      xp: 150,
      difficulty: "EXPLORER",
      questions: [
        {
          question: "Como se diz 'mãe'?",
          options: [
            { text: "Father", isCorrect: false },
            { text: "Mother", isCorrect: true },
            { text: "Sister", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'irmão'?",
          options: [
            { text: "Brother", isCorrect: true },
            { text: "Uncle", isCorrect: false },
            { text: "Son", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Work 1",
      level: 4,
      xp: 210,
      difficulty: "SPEAKER",
      questions: [
        {
          question: "Como se diz 'trabalho' (substantivo)?",
          options: [
            { text: "Job", isCorrect: true },
            { text: "House", isCorrect: false },
            { text: "School", isCorrect: false },
          ],
        },
        {
          question: "Complete: I ___ at a bank",
          options: [
            { text: "work", isCorrect: true },
            { text: "works", isCorrect: false },
            { text: "working", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Grammar 3",
      level: 4,
      xp: 230,
      difficulty: "SPEAKER",
      type: "GRAMMAR",
      questions: [
        {
          question: "Complete: I ___ finished my homework yet",
          options: [
            { text: "haven't", isCorrect: true },
            { text: "didn't", isCorrect: false },
            { text: "wasn't", isCorrect: false },
          ],
        },
        {
          question: "Complete: She ___ to the gym every day",
          options: [
            { text: "go", isCorrect: false },
            { text: "goes", isCorrect: true },
            { text: "going", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Conversation 3",
      level: 5,
      xp: 300,
      difficulty: "THINKER",
      questions: [
        {
          question: "Como se diz 'Quanto custa isso?'",
          options: [
            { text: "How much is this?", isCorrect: true },
            { text: "What is this?", isCorrect: false },
            { text: "Where is this?", isCorrect: false },
          ],
        },
        {
          question: "Como se diz 'Eu não entendi'",
          options: [
            { text: "I don't know", isCorrect: false },
            { text: "I don't understand", isCorrect: true },
            { text: "I don't like", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Fluent 1",
      level: 6,
      xp: 320,
      difficulty: "FLUENT",
      type: "GRAMMAR",
      questions: [
        {
          question: "Complete: If I ___ more time, I would travel more",
          options: [
            { text: "have", isCorrect: false },
            { text: "had", isCorrect: true },
            { text: "having", isCorrect: false },
          ],
        },
        {
          question: "Complete: By next year, I ___ here for a decade",
          options: [
            { text: "will have worked", isCorrect: true },
            { text: "will work", isCorrect: false },
            { text: "work", isCorrect: false },
          ],
        },
      ],
    },
    {
      title: "Master 1",
      level: 7,
      xp: 350,
      difficulty: "MASTER",
      type: "SPEAKING",
      questions: [
        {
          question: "Qual expressão significa 'desistir'?",
          options: [
            { text: "Give up", isCorrect: true },
            { text: "Give in", isCorrect: false },
            { text: "Give out", isCorrect: false },
          ],
        },
        {
          question: "Qual expressão significa 'adiar'?",
          options: [
            { text: "Put off", isCorrect: true },
            { text: "Put on", isCorrect: false },
            { text: "Put up", isCorrect: false },
          ],
        },
      ],
    },
  ];

  for (const lesson of lessons) {
    await createLesson(lesson);
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
