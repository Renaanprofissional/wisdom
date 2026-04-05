import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const { id: lessonId } = await context.params;

    if (!lessonId) {
      return NextResponse.json(
        { error: "ID da lição inválido" },
        { status: 400 },
      );
    }

    //  busca lição
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        xpReward: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            order: true,
            options: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lição não encontrada" },
        { status: 404 },
      );
    }

    //  verifica se já foi concluída (MAS NÃO BLOQUEIA)
    const userLesson = await prisma.userLesson.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    const alreadyCompleted = userLesson?.completed ?? false;

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      xpReward: lesson.xpReward,
      alreadyCompleted,
      questions: lesson.questions.map((q, index) => ({
        id: q.id,
        order: index + 1,
        question: q.question,
        options: q.options,
      })),
    });
  } catch (error) {
    console.error("LESSON_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
