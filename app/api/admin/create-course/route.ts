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

    const { sourceLanguageId, targetLanguageId } = await req.json();

    if (!sourceLanguageId || !targetLanguageId) {
      return NextResponse.json(
        { error: "Selecione os idiomas" },
        { status: 400 },
      );
    }

    // evitar duplicado
    const existing = await prisma.course.findUnique({
      where: {
        sourceLanguageId_targetLanguageId: {
          sourceLanguageId,
          targetLanguageId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Curso já existe" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        sourceLanguageId,
        targetLanguageId,
      },
    });

    return NextResponse.json(course);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
