"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, AuthSchema } from "@/lib/schemas/auth-schema";
import { Button } from "@/components/ui/button";
import { BiLoader } from "react-icons/bi";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Nome */}
      {!isLogin && (
        <div className="space-y-1">
          <input
            {...register("name")}
            placeholder="Nome completo"
            className="w-full bg-transparent border-b border-white/10 py-2
            text-sm text-white placeholder:text-zinc-500 outline-none
            focus:border-orange-500 transition"
          />
          {errors.name && (
            <p className="text-red-500 text-[11px]">{errors.name.message}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1">
        <input
          {...register("email")}
          placeholder="Email"
          className="w-full bg-transparent border-b border-white/10 py-2
          text-sm text-white placeholder:text-zinc-500 outline-none
          focus:border-orange-500 transition"
        />
        {errors.email && (
          <p className="text-red-500 text-[11px]">{errors.email.message}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-1 relative">
        <input
          type={showPassword ? "text" : "password"}
          {...register("password")}
          placeholder="Senha"
          className="w-full bg-transparent border-b border-white/10 py-2 pr-8
          text-sm text-white placeholder:text-zinc-500 outline-none
          focus:border-orange-500 transition"
        />

        {/* Toggle senha */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>

        {errors.password && (
          <p className="text-red-500 text-[11px]">{errors.password.message}</p>
        )}
      </div>

      {/* Esqueci senha */}
      {isLogin && (
        <div className="text-right">
          <button
            type="button"
            className="text-[11px] text-zinc-500 hover:text-orange-500 transition"
          >
            Esqueceu a senha?
          </button>
        </div>
      )}

      {/* Botão */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-lg bg-orange-500 hover:bg-orange-600
        text-sm font-medium transition flex items-center justify-center gap-2"
      >
        {loading && <BiLoader className="w-4 h-4 animate-spin" />}
        {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
      </Button>
    </form>
  );
};
