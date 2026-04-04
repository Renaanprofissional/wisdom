import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 🔥 Por enquanto pega qualquer curso (depois filtramos por usuário)
    const course = await prisma.course.findFirst();

    if (!course) {
      return NextResponse.json(
        { error: "Nenhum curso encontrado" },
        { status: 404 },
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: course.id,
      },
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
