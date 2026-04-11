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
      setLessons(await lessonsRes.json());

      const coursesRes = await fetch("/api/admin/list-courses");
      setCourses(await coursesRes.json());
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
      if (!selectedCourseId) return toast.error("Selecione um curso");

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
      setLessons(await lessonsRes.json());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || isAdmin === null) {
    return (
      <div className="text-orange-400 text-center mt-20 animate-pulse px-4">
        Carregando...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white px-4 sm:px-6 py-6 space-y-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-orange-400 text-sm sm:text-base"
      >
        <FiArrowLeft /> Voltar
      </Link>

      <div className="max-w-2xl mx-auto space-y-6 bg-[#111] border border-orange-500/10 p-5 sm:p-8 rounded-2xl">
        <h1 className="text-xl sm:text-3xl font-bold text-center bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <FiBookOpen /> Criar Lição
        </h1>

        <input
          placeholder="Título da lição"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-black/40 border border-orange-500/20 rounded-lg text-sm sm:text-base focus:outline-none"
        />

        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full p-3 bg-black/40 border border-orange-500/20 rounded-lg text-sm sm:text-base"
        >
          <option value="">Selecione um curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.sourceLanguage?.name} → {course.targetLanguage?.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-black/40 border border-orange-500/20 rounded-lg px-3">
            <FiAward className="text-orange-400" />
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full bg-transparent p-3 text-sm sm:text-base focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-orange-500/20 rounded-lg px-3">
            <FiLayers className="text-orange-400" />
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full bg-transparent p-3 text-sm sm:text-base focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 px-4 py-3 rounded-lg font-semibold"
        >
          <FiPlus /> Pergunta
        </button>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-black/40 border border-orange-500/10 p-4 sm:p-5 rounded-xl space-y-3"
          >
            <input
              placeholder={`Pergunta ${qIndex + 1}`}
              value={q.question}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIndex].question = e.target.value;
                setQuestions(updated);
              }}
              className="w-full p-3 bg-black/50 border border-orange-500/20 rounded-lg text-sm sm:text-base"
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
                  className="flex-1 p-2 bg-black/50 border border-orange-500/20 rounded-lg text-sm"
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
                  className={`p-2 rounded-md ${
                    opt.isCorrect
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  <FiCheckCircle />
                </button>
              </div>
            ))}

            <button
              onClick={() => addOption(qIndex)}
              className="text-orange-400 text-xs sm:text-sm"
            >
              + opção
            </button>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="w-full bg-linear-to-r from-orange-500 to-orange-600 py-3 rounded-lg font-bold"
        >
          {loading ? "Criando..." : "Criar Lição"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-lg sm:text-2xl font-bold text-orange-400 flex items-center gap-2">
          <FiBookOpen /> Lições
        </h2>

        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-[#111] border border-orange-500/10 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
          >
            <div>
              <p className="font-bold text-sm sm:text-lg">{lesson.title}</p>

              <p className="text-xs sm:text-sm text-gray-400">
                Nível {lesson.level} • {lesson.questions.length} perguntas
              </p>

              <p className="text-[10px] sm:text-xs text-orange-400">
                {lesson.course?.sourceLanguage?.name} →{" "}
                {lesson.course?.targetLanguage?.name}
              </p>
            </div>

            <button
              onClick={() => router.push(`/admin/edit-lesson/${lesson.id}`)}
              className="flex items-center justify-center gap-2 bg-orange-500 px-4 py-2 rounded-lg text-sm"
            >
              <FiEdit /> Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
