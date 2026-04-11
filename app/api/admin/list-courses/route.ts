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

    const admin = await isAdmin(session.user.id);

    if (!admin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("LIST_COURSES_ERROR:", error);

    return NextResponse.json(
      { error: "Erro ao buscar cursos" },
      { status: 500 },
    );
  }
}
