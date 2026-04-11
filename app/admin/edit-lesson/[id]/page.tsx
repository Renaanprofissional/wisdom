"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiSave,
  FiEdit3,
} from "react-icons/fi";
import Link from "next/link";

export default function EditLessonPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(100);
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user || !id) return;

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/admin/get-lesson/${id}`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erro ao buscar lição");
        }

        const data = await res.json();

        setTitle(data.title);
        setXp(data.xpReward);
        setLevel(data.level);

        setQuestions(
          data.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
          })),
        );
      } catch (err: any) {
        toast.error(err.message);
        router.push("/");
      }
    };

    fetchLesson();
  }, [session?.user?.id, id]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options.push({ text: "", isCorrect: false });
      return updated;
    });
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options = updated[qIndex].options.filter(
        (_: any, i: number) => i !== oIndex,
      );
      return updated;
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/update-lesson", {
        method: "POST",
        body: JSON.stringify({
          lessonId: id,
          title,
          xpReward: xp,
          level,
          questions,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Lição atualizada 🚀");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="text-orange-400 text-center mt-20 animate-pulse text-lg">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white p-6 space-y-10">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition font-medium"
        >
          <FiArrowLeft /> Voltar
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 bg-[#111] border border-orange-500/10 p-8 rounded-2xl shadow-[0_0_40px_rgba(255,115,0,0.08)]">
        <h1 className="text-3xl font-bold text-center bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <FiEdit3 /> Editar Lição
        </h1>

        <div className="bg-black/40 border border-orange-500/10 p-4 rounded-xl text-sm text-gray-400 space-y-1">
          <p>• Edite título, XP e perguntas</p>
          <p>• Adicione novas perguntas se quiser</p>
          <p>• Apenas 1 resposta correta por pergunta</p>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full p-3 bg-black/40 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
            placeholder="XP"
            className="p-3 bg-black/40 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500"
          />

          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            placeholder="Level"
            className="p-3 bg-black/40 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>

        <button
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-3 rounded-lg transition font-semibold shadow"
        >
          <FiPlus /> Adicionar Pergunta
        </button>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-black/40 border border-orange-500/10 p-5 rounded-xl space-y-3 hover:border-orange-500/30 transition"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Pergunta {qIndex + 1}
              </span>

              <button
                onClick={() => removeQuestion(qIndex)}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
              >
                <FiTrash2 /> Remover
              </button>
            </div>

            <input
              value={q.question}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIndex].question = e.target.value;
                setQuestions(updated);
              }}
              placeholder="Pergunta"
              className="w-full p-3 bg-black/50 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500"
            />

            {q.options.map((opt: any, oIndex: number) => (
              <div key={oIndex} className="flex gap-2 items-center">
                <input
                  value={opt.text}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].options[oIndex].text = e.target.value;
                    setQuestions(updated);
                  }}
                  placeholder="Opção"
                  className="flex-1 p-2 bg-black/50 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500"
                />

                <button
                  onClick={() => {
                    const updated = [...questions];
                    updated[qIndex].options = updated[qIndex].options.map(
                      (o: any, i: number) => ({
                        ...o,
                        isCorrect: i === oIndex,
                      }),
                    );
                    setQuestions(updated);
                  }}
                  className={`p-2 rounded-md transition ${
                    opt.isCorrect
                      ? "bg-green-500 text-white shadow"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  <FiCheckCircle />
                </button>

                <button
                  onClick={() => removeOption(qIndex, oIndex)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}

            <button
              onClick={() => addOption(qIndex)}
              className="text-orange-400 text-sm hover:text-orange-300 transition"
            >
              + adicionar opção
            </button>
          </div>
        ))}

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 py-3 rounded-lg font-bold hover:opacity-90 transition shadow-lg"
        >
          <FiSave />
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
