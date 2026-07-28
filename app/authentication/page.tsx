"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

import { AuthForm } from "./components/AuthForm";
import { AuthGoogleButton } from "./components/AuthGoogleButton";
import { AuthAppleButton } from "./components/AuthAppleButton";
import { AuthSchema } from "@/lib/schemas/auth-schema";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";

type AuthErrorCtx = {
  error: {
    message: string;
  };
};

export default function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      toast.error("Erro ao entrar com Google");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AuthSchema) => {
    setLoading(true);

    try {
      if (isLogin) {
        await authClient.signIn.email({
          email: data.email,
          password: data.password,
          fetchOptions: {
            onSuccess: () => {
              toast("Logado com sucesso!");
              router.push("/");
            },
            onError: (ctx: AuthErrorCtx) => {
              toast.error(ctx.error.message);
            },
          },
        });
      } else {
        await authClient.signUp.email({
          name: data.name!,
          email: data.email,
          password: data.password,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Conta criada!");
              router.push("/");
            },
            onError: (ctx: AuthErrorCtx) => {
              toast.error(ctx.error.message);
            },
          },
        });
      }
    } catch {
      toast.error("Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative border-r border-border">
        <Image
          src="/bg.png"
          alt="Background"
          fill
          priority
          loading="eager"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-[0.07]"
        />

        <div className="relative z-10 p-16 flex flex-col justify-between">
          <h1 className="text-xs tracking-[0.6em] text-muted-foreground uppercase">
            Wisdom
          </h1>

          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Wisdom School
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          {/* LOGO */}
          <div className="flex justify-center mb-4">
            <Image
              src="/wisdom.svg"
              alt="Logo"
              width={120}
              height={120}
              className="opacity-90"
            />
          </div>

          {/* CARD */}
          <div className="bg-card border border-border rounded-2xl p-6">
            {/* SOCIAL */}
            <div className="flex gap-3">
              <AuthGoogleButton loading={loading} onClick={handleGoogle} />
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* FORM */}
            <AuthForm isLogin={isLogin} loading={loading} onSubmit={onSubmit} />

            {/* TEXT */}
            <p className="text-muted-foreground text-xs text-center mt-5">
              {isLogin ? `${t("login")}` : `${t("signup")}`}
            </p>

            {/* SWITCH */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Não tem conta?" : "Já possui conta?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-brand hover:opacity-80 transition font-semibold"
              >
                {isLogin ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="absolute bottom-6 left-6">
          <Link href="/">
            <Button className="w-11 h-11 rounded-full bg-card border border-border hover:bg-muted transition-all duration-300">
              ←
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
