"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

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
    return <div className="text-white text-center mt-20">Carregando...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#05070F] text-white p-6 space-y-10">
      {/* FORM */}
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Criar Nova Lição</h1>

        <input
          placeholder="Título da lição"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 bg-black/50 rounded"
        />

        {/* 🔥 SELECT MELHORADO */}
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full p-2 bg-black/50 rounded"
        >
          <option value="">Selecione um curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.sourceLanguage?.name} → {course.targetLanguage?.name} (
              {course.sourceLanguage?.code} → {course.targetLanguage?.code})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="XP"
          value={xp}
          onChange={(e) => setXp(Number(e.target.value))}
          className="w-full p-2 bg-black/50 rounded"
        />

        <input
          type="number"
          placeholder="Nível"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full p-2 bg-black/50 rounded"
        />

        <button onClick={addQuestion} className="bg-blue-500 px-4 py-2 rounded">
          + Pergunta
        </button>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white/5 p-4 rounded space-y-2">
            <input
              placeholder="Pergunta"
              value={q.question}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIndex].question = e.target.value;
                setQuestions(updated);
              }}
              className="w-full p-2 bg-black/50 rounded"
            />

            {q.options.map((opt: any, oIndex: number) => (
              <div key={oIndex} className="flex gap-2">
                <input
                  value={opt.text}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].options[oIndex].text = e.target.value;
                    setQuestions(updated);
                  }}
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
              </div>
            ))}

            <button
              onClick={() => addOption(qIndex)}
              className="text-green-400 text-sm"
            >
              + opção
            </button>
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 py-3 rounded font-bold"
        >
          Criar Lição
        </button>
      </div>

      {/* 📚 LISTA MELHORADA */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">📚 Lições</h2>

        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white/5 p-4 rounded flex justify-between"
          >
            <div>
              <p className="font-bold">{lesson.title}</p>

              <p className="text-sm text-white/60">
                Nível {lesson.level} • {lesson.questions.length} perguntas
              </p>

              {/* 🔥 MOSTRAR CURSO */}
              <p className="text-xs text-blue-400">
                {lesson.course?.sourceLanguage?.name} →{" "}
                {lesson.course?.targetLanguage?.name}
              </p>
            </div>

            <button
              onClick={() => router.push(`/admin/edit-lesson/${lesson.id}`)}
              className="bg-yellow-500 px-3 py-1 rounded"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
