import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function GET(req: Request) {
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

    const lessons = await prisma.lesson.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        questions: true,

        course: {
          include: {
            sourceLanguage: true,
            targetLanguage: true,
          },
        },
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("LESSONS_GET_ERROR:", error);

    return NextResponse.json(
      { error: "Erro ao buscar lições" },
      { status: 500 },
    );
  }
}
