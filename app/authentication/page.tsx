"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

import { AuthForm } from "./components/AuthForm";
import { AuthGoogleButton } from "./components/AuthGoogleButton";
import { AuthSchema } from "@/lib/schemas/auth-schema";
import { Button } from "@/components/ui/button";
import { AuthAppleButton } from "./components/AuthAppleButton";

// ✅ Tipo correto para o ctx
type AuthErrorCtx = {
  error: {
    message: string;
  };
};

export default function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
              toast.success("Login realizado!");
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
    } catch (err) {
      console.error(err);
      toast.error("Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#0B0B0B] text-white overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative">
        <Image
          src="/bg.png"
          alt="Students learning languages"
          fill
          className="opacity-10"
          sizes="50vw"
        />
        <div className="absolute inset-0" />
        <div className="relative z-10 p-14 flex flex-col justify-between">
          <h1 className="text-sm tracking-[0.4em] text-zinc-500 uppercase">
            Wisdom
          </h1>

          <div>
            <h2 className="text-6xl font-bold leading-tight">
              Domine novos
              <span className="bg-clip-text"> idiomas</span>
            </h2>

            <p className="text-zinc-400 mt-6 max-w-lg">
              Plataforma moderna para aprendizado de idiomas com foco em
              fluência real.
            </p>
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Wisdom School
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 z-10 bg-black">
        <div className="w-full max-w-md relative">
          <div className="flex justify-center items-center relative bottom-50">
            <Image
              src="/wisdom.svg"
              alt="Auth illustration"
              width={280}
              height={280}
              className="object-contain"
            />
          </div>

          {/* CARD */}
          <div className="absolute top-0 bg-transparent rounded-3xl p-10">
            <div className="flex gap-15 justify-center">
              <AuthGoogleButton loading={loading} onClick={handleGoogle} />
              <AuthAppleButton loading={loading} onClick={handleApple} />
            </div>

            <AuthForm isLogin={isLogin} loading={loading} onSubmit={onSubmit} />

            <p className="text-zinc-500 text-sm text-center mt-4">
              {isLogin
                ? "Entre para continuar sua jornada"
                : "Comece sua jornada nos idiomas"}
            </p>

            <p className="text-center text-sm text-zinc-500 mt-6">
              {isLogin ? "Não tem conta?" : "Já possui conta?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-orange-500 hover:text-orange-400 transition font-medium"
              >
                {isLogin ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="absolute bottom-6 left-6">
          <Link href="/">
            <Button className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-orange-500/20 hover:bg-orange-600 transition">
              ←
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
