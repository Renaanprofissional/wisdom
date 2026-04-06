import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("COURSE_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cursos" },
      { status: 500 },
    );
  }
}
