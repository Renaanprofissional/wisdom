"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCoursePage() {
  const router = useRouter();

  const [languages, setLanguages] = useState<any[]>([]);
  const [sourceLanguageId, setSourceLanguageId] = useState("");
  const [targetLanguageId, setTargetLanguageId] = useState("");

  const [newLanguageName, setNewLanguageName] = useState("");
  const [newLanguageCode, setNewLanguageCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [creatingLanguage, setCreatingLanguage] = useState(false);

  //  carregar idiomas
  const fetchLanguages = async () => {
    try {
      const res = await fetch("/api/admin/list-languages");

      if (!res.ok) throw new Error("Erro ao buscar idiomas");

      const data = await res.json();
      setLanguages(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  //  criar idioma
  const handleCreateLanguage = async () => {
    try {
      if (!newLanguageName.trim() || !newLanguageCode.trim()) {
        toast.error("Preencha nome e código");
        return;
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

  // criar curso
  const handleCreate = async () => {
    try {
      if (!sourceLanguageId || !targetLanguageId) {
        toast.error("Selecione os idiomas");
        return;
      }

      if (sourceLanguageId === targetLanguageId) {
        toast.error("Idiomas devem ser diferentes");
        return;
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
    <div className="min-h-screen bg-[#05070F] text-white flex items-center justify-center">
      <div className="bg-white/5 p-6 rounded-xl w-full max-w-md space-y-6">
        <div>
          <Link href="/admin" className="p-2 rounded hover:bg-white/10">
            voltar
          </Link>
        </div>
        <h1 className="text-xl font-bold text-center">Criar Curso</h1>

        {/*  CRIAR IDIOMA */}
        <div className="bg-white/5 p-4 rounded space-y-2">
          <p className="text-sm font-bold">Criar novo idioma</p>

          <input
            placeholder="Nome (ex: Espanhol)"
            value={newLanguageName}
            onChange={(e) => setNewLanguageName(e.target.value)}
            className="w-full p-2 bg-black/50 rounded"
          />

          <input
            placeholder="Código (ex: es)"
            value={newLanguageCode}
            onChange={(e) => setNewLanguageCode(e.target.value)}
            className="w-full p-2 bg-black/50 rounded"
          />

          <button
            onClick={handleCreateLanguage}
            disabled={creatingLanguage}
            className="w-full bg-blue-500 py-2 rounded font-bold"
          >
            {creatingLanguage ? "Criando..." : "Criar idioma"}
          </button>
        </div>

        {/* SOURCE */}
        <select
          value={sourceLanguageId}
          onChange={(e) => setSourceLanguageId(e.target.value)}
          className="w-full p-2 bg-black/50 rounded"
        >
          <option value="">Idioma de origem</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name} ({lang.code})
            </option>
          ))}
        </select>

        {/* TARGET */}
        <select
          value={targetLanguageId}
          onChange={(e) => setTargetLanguageId(e.target.value)}
          className="w-full p-2 bg-black/50 rounded"
        >
          <option value="">Idioma de destino</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name} ({lang.code})
            </option>
          ))}
        </select>

        {/* aviso se não tiver idioma */}
        {languages.length === 0 && (
          <p className="text-red-400 text-sm">
            Nenhum idioma encontrado. Crie um primeiro.
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-green-500 py-2 rounded font-bold"
        >
          {loading ? "Criando..." : "Criar Curso"}
        </button>
      </div>
    </div>
  );
}
