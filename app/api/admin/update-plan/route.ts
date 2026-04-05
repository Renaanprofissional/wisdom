import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    // sessão
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    //  admin check
    const isUserAdmin = await isAdmin(session.user.id);

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    //  body
    const body = await req.json();
    const { email, planName } = body;

    if (!email || !planName) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    console.log("📩 UPDATE PLAN:", { email, planName });

    //  usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { activeSubscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    //  plano
    const plan = await prisma.plan.findUnique({
      where: { name: planName },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    //  TRANSAÇÃO
    const result = await prisma.$transaction(async (tx) => {
      //  remove subscription ativa antiga
      if (user.activeSubscriptionId) {
        await tx.subscription.delete({
          where: { id: user.activeSubscriptionId },
        });
      }

      //  cria nova subscription
      const newSubscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
        },
      });

      //  define como ativa
      await tx.user.update({
        where: { id: user.id },
        data: {
          activeSubscriptionId: newSubscription.id,
        },
      });

      //  ATUALIZA VIDAS BASEADO NO PLANO
      if (plan.isUnlimited) {
        // PRO → infinito
        await tx.userLives.upsert({
          where: { userId: user.id },
          update: {
            lives: 9999, // infinito (padrão)
          },
          create: {
            userId: user.id,
            lives: 9999,
          },
        });
      } else {
        // FREE → vidas limitadas
        await tx.userLives.upsert({
          where: { userId: user.id },
          update: {
            lives: plan.maxLives ?? 5,
          },
          create: {
            userId: user.id,
            lives: plan.maxLives ?? 5,
          },
        });
      }

      return newSubscription;
    });

    console.log("SUB UPDATED:", result.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("UPDATE_PLAN_ERROR FULL:", error);

    return NextResponse.json(
      {
        error: error.message || "Erro interno",
      },
      { status: 500 },
    );
  }
}
