import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const languages = await prisma.language.findMany();
  return NextResponse.json(languages);
}
