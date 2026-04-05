import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { questionId, optionId } = body;

    //  validação básica
    if (!questionId || !optionId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    //  buscar opção
    const option = await prisma.answerOption.findUnique({
      where: { id: optionId },
      include: {
        question: {
          select: {
            id: true,
          },
        },
      },
    });

    //  opção não existe
    if (!option) {
      return NextResponse.json(
        { error: "Opção não encontrada" },
        { status: 404 },
      );
    }

    //  segurança: verificar se opção pertence à pergunta
    if (option.questionId !== questionId) {
      return NextResponse.json(
        { error: "Opção inválida para essa pergunta" },
        { status: 400 },
      );
    }

    const isCorrect = option.isCorrect;

    return NextResponse.json({
      correct: isCorrect,
    });
  } catch (error) {
    console.error("ANSWER_ERROR:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
