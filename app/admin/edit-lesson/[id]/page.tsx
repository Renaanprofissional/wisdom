"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

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

  // carregar lição
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

  //  ADD QUESTION
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

  //  ADD OPTION
  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options.push({ text: "", isCorrect: false });
      return updated;
    });
  };

  //  REMOVE QUESTION
  const removeQuestion = (qIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  //  REMOVE OPTION
  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options = updated[qIndex].options.filter(
        (_: any, i: number) => i !== oIndex,
      );
      return updated;
    });
  };

  //  salvar
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
    return <div className="text-white text-center mt-20">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#05070F] text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Editar Lição</h1>

        {/* guia */}
        <div className="bg-white/5 p-4 rounded-xl text-sm text-white/70">
          <p>• Edite título, XP e perguntas</p>
          <p>• Adicione novas perguntas se quiser</p>
          <p>• Apenas 1 resposta correta por pergunta</p>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="w-full p-2 bg-black/50 rounded"
        />

        <input
          type="number"
          value={xp}
          onChange={(e) => setXp(Number(e.target.value))}
          placeholder="XP"
          className="w-full p-2 bg-black/50 rounded"
        />

        <input
          type="number"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          placeholder="Level"
          className="w-full p-2 bg-black/50 rounded"
        />

        {/*  ADD QUESTION */}
        <button onClick={addQuestion} className="bg-blue-500 px-4 py-2 rounded">
          + Adicionar Pergunta
        </button>

        {/*  QUESTIONS */}
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white/5 p-4 rounded space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">
                Pergunta {qIndex + 1}
              </span>

              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-red-400 text-sm"
              >
                Remover
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
              className="w-full p-2 bg-black/50 rounded"
            />

            {/* OPTIONS */}
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
                  className="flex-1 p-2 bg-black/50 rounded"
                />

                <input
                  type="checkbox"
                  checked={opt.isCorrect}
                  onChange={() => {
                    const updated = [...questions];

                    updated[qIndex].options = updated[qIndex].options.map(
                      (o: any, i: number) => ({
                        ...o,
                        isCorrect: i === oIndex,
                      }),
                    );

                    setQuestions(updated);
                  }}
                />

                <button
                  onClick={() => removeOption(qIndex, oIndex)}
                  className="text-red-400"
                >
                  X
                </button>
              </div>
            ))}

            <button
              onClick={() => addOption(qIndex)}
              className="text-green-400 text-sm"
            >
              + adicionar opção
            </button>
          </div>
        ))}

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-green-500 py-3 rounded font-bold"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
