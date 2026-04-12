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

  const handleApple = async () => {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/",
      });
    } catch {
      toast.error("Erro ao entrar com Apple");
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
    <div className="min-h-screen flex bg-[#050505] text-white relative overflow-hidden">
      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,115,0,0.12),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(255,115,0,0.08),transparent_40%)]" />

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative border-r border-white/5">
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
          <h1 className="text-xs tracking-[0.6em] text-zinc-700 uppercase">
            Wisdom
          </h1>

          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-semibold leading-tight">
              {t("title")}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          <p className="text-xs text-zinc-700">
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
              className="opacity-90 drop-shadow-[0_0_30px_rgba(255,115,0,0.35)]"
            />
          </div>

          {/* CARD */}
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* GLOW */}
            <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />

            {/* SOCIAL */}
            <div className="flex gap-3 relative z-10">
              <AuthGoogleButton loading={loading} onClick={handleGoogle} />
              <AuthAppleButton loading={loading} onClick={handleApple} />
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-3 my-6 relative z-10">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-xs text-zinc-500">ou</span>
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* FORM */}
            <div className="relative z-10">
              <AuthForm
                isLogin={isLogin}
                loading={loading}
                onSubmit={onSubmit}
              />
            </div>

            {/* TEXT */}
            <p className="text-zinc-400 text-xs text-center mt-5 relative z-10">
              {isLogin ? `${t("login")}` : `${t("signup")}`}
            </p>

            {/* SWITCH */}
            <p className="text-center text-sm text-zinc-500 mt-6 relative z-10">
              {isLogin ? "Não tem conta?" : "Já possui conta?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-orange-500 hover:text-orange-400 transition font-semibold"
              >
                {isLogin ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="absolute bottom-6 left-6">
          <Link href="/">
            <Button className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-orange-500/20 hover:scale-110 transition-all duration-300 backdrop-blur-xl">
              ←
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
