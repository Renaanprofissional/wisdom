"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiGlobe,
  FiPlus,
  FiLayers,
  FiRefreshCw,
} from "react-icons/fi";

export default function CreateCoursePage() {
  const router = useRouter();

  const [languages, setLanguages] = useState<any[]>([]);
  const [sourceLanguageId, setSourceLanguageId] = useState("");
  const [targetLanguageId, setTargetLanguageId] = useState("");

  const [newLanguageName, setNewLanguageName] = useState("");
  const [newLanguageCode, setNewLanguageCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [creatingLanguage, setCreatingLanguage] = useState(false);

  const fetchLanguages = async () => {
    try {
      const res = await fetch("/api/admin/list-languages");
      if (!res.ok) throw new Error("Erro ao buscar idiomas");
      setLanguages(await res.json());
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleCreateLanguage = async () => {
    try {
      if (!newLanguageName.trim() || !newLanguageCode.trim()) {
        return toast.error("Preencha nome e código");
      }

      setCreatingLanguage(true);

      const res = await fetch("/api/admin/create-language", {
        method: "POST",
        body: JSON.stringify({
          name: newLanguageName.trim(),
          code: newLanguageCode.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Idioma criado 🌍");

      setNewLanguageName("");
      setNewLanguageCode("");

      await fetchLanguages();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingLanguage(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!sourceLanguageId || !targetLanguageId) {
        return toast.error("Selecione os idiomas");
      }

      if (sourceLanguageId === targetLanguageId) {
        return toast.error("Idiomas devem ser diferentes");
      }

      setLoading(true);

      const res = await fetch("/api/admin/create-course", {
        method: "POST",
        body: JSON.stringify({
          sourceLanguageId,
          targetLanguageId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Curso criado 🚀");

      setSourceLanguageId("");
      setTargetLanguageId("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white flex items-center justify-center px-4 sm:px-6 py-6">
      <div className="bg-[#111] border border-orange-500/10 p-5 sm:p-8 rounded-2xl w-full max-w-md space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-orange-400 text-sm sm:text-base"
        >
          <FiArrowLeft /> Voltar
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold text-center bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <FiLayers /> Criar Curso
        </h1>

        <div className="bg-black/40 border border-orange-500/10 p-4 rounded-xl space-y-3">
          <p className="text-xs sm:text-sm font-bold text-orange-400 flex items-center gap-2">
            <FiGlobe /> Novo idioma
          </p>

          <input
            placeholder="Nome (ex: Espanhol)"
            value={newLanguageName}
            onChange={(e) => setNewLanguageName(e.target.value)}
            className="w-full p-3 bg-black/50 border border-orange-500/20 rounded-lg text-sm sm:text-base focus:outline-none"
          />

          <input
            placeholder="Código (ex: es)"
            value={newLanguageCode}
            onChange={(e) => setNewLanguageCode(e.target.value)}
            className="w-full p-3 bg-black/50 border border-orange-500/20 rounded-lg text-sm sm:text-base focus:outline-none"
          />

          <button
            onClick={handleCreateLanguage}
            disabled={creatingLanguage}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 py-2.5 rounded-lg font-semibold text-sm sm:text-base"
          >
            {creatingLanguage ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiPlus />
            )}
            {creatingLanguage ? "Criando..." : "Criar idioma"}
          </button>
        </div>

        <select
          value={sourceLanguageId}
          onChange={(e) => setSourceLanguageId(e.target.value)}
          className="w-full p-3 bg-black/50 border border-orange-500/20 rounded-lg text-sm sm:text-base"
        >
          <option value="">Idioma de origem</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name} ({lang.code})
            </option>
          ))}
        </select>

        <select
          value={targetLanguageId}
          onChange={(e) => setTargetLanguageId(e.target.value)}
          className="w-full p-3 bg-black/50 border border-orange-500/20 rounded-lg text-sm sm:text-base"
        >
          <option value="">Idioma de destino</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name} ({lang.code})
            </option>
          ))}
        </select>

        {languages.length === 0 && (
          <p className="text-red-400 text-xs sm:text-sm text-center">
            Nenhum idioma encontrado. Crie um primeiro.
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-linear-to-r from-orange-500 to-orange-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {loading ? <FiRefreshCw className="animate-spin" /> : <FiLayers />}
          {loading ? "Criando..." : "Criar Curso"}
        </button>
      </div>
    </div>
  );
}
