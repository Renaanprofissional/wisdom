import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { courseId } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        activeCourseId: courseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("COURSE_SELECT_ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao selecionar curso" },
      { status: 500 },
    );
  }
}
