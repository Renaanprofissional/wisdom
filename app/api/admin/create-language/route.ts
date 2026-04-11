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

    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Nome e código são obrigatórios" },
        { status: 400 },
      );
    }

    // evitar duplicado
    const existing = await prisma.language.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: "Idioma já existe" }, { status: 400 });
    }

    const language = await prisma.language.create({
      data: {
        name,
        code,
      },
    });

    return NextResponse.json(language);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
