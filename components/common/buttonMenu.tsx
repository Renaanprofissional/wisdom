"use client";

import React from "react";

type Props = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export default function ButtonMenu({ icon, label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-xs transition-all duration-200 ${
        active
          ? "text-brand scale-110"
          : "text-muted-foreground hover:text-foreground hover:scale-105"
      }`}
    >
      <div className="text-lg mb-0.5">{icon}</div>
      <span>{label}</span>

      {/* indicador ativo */}
      {active && <div className="w-1 h-1 bg-brand rounded-full mt-1" />}
    </button>
  );
}
