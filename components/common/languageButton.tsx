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
      bg-card border border-border
      hover:scale-110 active:scale-95
      transition-all duration-300"
    >
      {isPT ? (
        <GiBrazilFlag className="text-2xl text-muted-foreground" />
      ) : (
        <LiaFlagUsaSolid className="text-2xl text-muted-foreground" />
      )}
    </button>
  );
}
