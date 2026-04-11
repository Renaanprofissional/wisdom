import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

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

    const isUserAdmin = await isAdmin(session.user.id);

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await context.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: "asc",
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

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("GET_LESSON_ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lição" },
      { status: 500 },
    );
  }
}
