"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { LiaFlagUsaSolid } from "react-icons/lia";
import { GiBrazilFlag } from "react-icons/gi";

export function LanguageToggleButton() {
  const { language, setLanguage } = useLanguage();

  const isPT = language === "pt";

  const toggleLanguage = () => {
    setLanguage(isPT ? "en" : "pt");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-11 h-11 rounded-full
      bg-[#111]/80 border border-white/10 backdrop-blur-xl
      shadow-[0_0_20px_rgba(255,115,0,0.08)]
      hover:scale-110 hover:shadow-[0_0_30px_rgba(255,115,0,0.2)]
      active:scale-95
      transition-all duration-300"
    >
      {isPT ? (
        <GiBrazilFlag className="text-2xl text-gray-400" />
      ) : (
        <LiaFlagUsaSolid className="text-2xl text-gray-400" />
      )}
    </button>
  );
}
