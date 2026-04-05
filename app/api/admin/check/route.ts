import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: Object.fromEntries(headersList.entries()),
    });

    if (!session) {
      return NextResponse.json({ isAdmin: false });
    }

    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ isAdmin: false });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({ isAdmin: user.role === "ADMIN" });
  } catch (error) {
    console.error("ADMIN_CHECK_ERROR:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
