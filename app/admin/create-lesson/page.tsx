"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit,
  FiCheckCircle,
  FiBookOpen,
  FiAward,
  FiLayers,
} from "react-icons/fi";

export default function CreateLessonPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(100);
  const [level, setLevel] = useState(1);

  const [questions, setQuestions] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/authentication");
      return;
    }

    const init = async () => {
      const res = await fetch("/api/admin/check");
      const data = await res.json();

      if (!data.isAdmin) {
        toast.error("Acesso negado 🚫");
        router.push("/");
        return;
      }

      setIsAdmin(true);

      const lessonsRes = await fetch("/api/admin/list-lessons");
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);

      const coursesRes = await fetch("/api/admin/list-courses");
      const coursesData = await coursesRes.json();
      setCourses(coursesData);
    };

    init();
  }, [session?.user?.id, isPending]);

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

  const handleSubmit = async () => {
    try {
      if (!selectedCourseId) {
        toast.error("Selecione um curso");
        return;
      }

      setLoading(true);

      const res = await fetch("/api/admin/create-lesson", {
        method: "POST",
        body: JSON.stringify({
          title,
          xpReward: xp,
          level,
          questions,
          courseId: selectedCourseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Lição criada 🚀");

      setTitle("");
      setQuestions([]);
      setLevel(1);
      setSelectedCourseId("");

      const lessonsRes = await fetch("/api/admin/list-lessons");
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || isAdmin === null) {
    return (
      <div className="text-orange-400 text-center mt-20 animate-pulse text-lg">
        Carregando...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white p-6 space-y-12">
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
          <FiBookOpen /> Criar Nova Lição
        </h1>

        <input
          placeholder="Título da lição"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-black/40 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition"
        />

        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full p-3 bg-black/40 border border-orange-500/20 rounded-lg focus:outline-none focus:border-orange-500"
        >
          <option value="">Selecione um curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.sourceLanguage?.name} → {course.targetLanguage?.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-black/40 border border-orange-500/20 rounded-lg px-3">
            <FiAward className="text-orange-400" />
            <input
              type="number"
              placeholder="XP"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full bg-transparent p-3 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-orange-500/20 rounded-lg px-3">
            <FiLayers className="text-orange-400" />
            <input
              type="number"
              placeholder="Nível"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full bg-transparent p-3 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition px-4 py-3 rounded-lg font-semibold shadow-md"
        >
          <FiPlus /> Adicionar Pergunta
        </button>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-black/40 border border-orange-500/10 p-5 rounded-xl space-y-3 hover:border-orange-500/30 transition"
          >
            <input
              placeholder={`Pergunta ${qIndex + 1}`}
              value={q.question}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIndex].question = e.target.value;
                setQuestions(updated);
              }}
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
          onClick={handleSubmit}
          className="w-full bg-linear-to-r from-orange-500 to-orange-600 py-3 rounded-lg font-bold hover:opacity-90 active:scale-[0.99] transition shadow-lg"
        >
          {loading ? "Criando..." : "Criar Lição"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
          <FiBookOpen /> Lições
        </h2>

        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-[#111] border border-orange-500/10 p-5 rounded-xl flex justify-between items-center hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(255,115,0,0.15)] transition"
          >
            <div>
              <p className="font-bold text-lg">{lesson.title}</p>

              <p className="text-sm text-gray-400">
                Nível {lesson.level} • {lesson.questions.length} perguntas
              </p>

              <p className="text-xs text-orange-400">
                {lesson.course?.sourceLanguage?.name} →{" "}
                {lesson.course?.targetLanguage?.name}
              </p>
            </div>

            <button
              onClick={() => router.push(`/admin/edit-lesson/${lesson.id}`)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition shadow"
            >
              <FiEdit /> Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
