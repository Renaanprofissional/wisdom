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
    const { title, xpReward, level, questions, courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Curso é obrigatório" },
        { status: 400 },
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 },
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        xpReward,
        level,
        type: "VOCABULARY",
        difficulty: "ROOKIE",
        courseId: course.id,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            order: index,
            options: {
              create: q.options,
            },
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(lesson);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
