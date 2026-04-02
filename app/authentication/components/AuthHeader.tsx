"use client";

import Image from "next/image";
import React from "react";

interface AuthHeaderProps {
  isLogin: boolean;
  toggleMode: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  isLogin,
  toggleMode,
}) => {
  return (
    <div className="mb-1 text-center flex flex-col items-center">
      <Image
        src={isLogin ? "/wisdom.svg" : "/wisdom.svg"}
        alt="Auth Image"
        width={400}
        height={400}
        className="relative bottom-8"
      />

      <p className="text-sm text-zinc-500">
        {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
        <span
          onClick={toggleMode}
          className="text-orange-400 cursor-pointer font-medium"
        >
          {isLogin ? "Criar conta" : "Entrar"}
        </span>
      </p>
    </div>
  );
};
