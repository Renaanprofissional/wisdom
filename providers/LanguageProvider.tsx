"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Language = "pt" | "en";

type Messages = Record<string, string>;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext({} as LanguageContextType);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt");
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", language);
    document.documentElement.lang = language;

    // 🔥 carregar JSON dinamicamente
    import(`@/messages/${language}.json`).then((mod) => {
      setMessages(mod.default);
    });
  }, [language]);

  const t = (key: string) => {
    return messages[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
