import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isUserAdmin = await isAdmin(session.user.id);

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();

    const { lessonId, title, xpReward, level, questions } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId obrigatório" },
        { status: 400 },
      );
    }

    //  TRANSAÇÃO
    await prisma.$transaction(async (tx) => {
      // deletar opções → perguntas
      await tx.answerOption.deleteMany({
        where: {
          question: {
            lessonId,
          },
        },
      });

      await tx.question.deleteMany({
        where: {
          lessonId,
        },
      });

      // atualizar lição
      await tx.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          xpReward,
          level,
        },
      });

      //  recriar perguntas
      await tx.question.createMany({
        data: questions.map((q: any, index: number) => ({
          lessonId,
          question: q.question,
          order: index,
        })),
      });

      //  precisa buscar as perguntas criadas pra criar options
      const createdQuestions = await tx.question.findMany({
        where: { lessonId },
        orderBy: { order: "asc" },
      });

      // criar opções
      for (let i = 0; i < createdQuestions.length; i++) {
        const q = questions[i];

        await tx.answerOption.createMany({
          data: q.options.map((opt: any) => ({
            questionId: createdQuestions[i].id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("UPDATE LESSON ERROR:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
