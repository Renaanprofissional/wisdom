"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, AuthSchema } from "@/lib/schemas/auth-schema";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  isLogin: boolean;
  loading: boolean;
  onSubmit: (data: AuthSchema) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  loading,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
      {!isLogin && (
        <>
          <input
            placeholder="Nome"
            {...register("name")}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </>
      )}

      <input
        placeholder="Email"
        {...register("email")}
        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder="Senha"
        {...register("password")}
        className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
      />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password.message}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-5 cursor-pointer rounded-2xl bg-white text-black hover:bg-orange-600"
      >
        {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
      </Button>
    </form>
  );
};
