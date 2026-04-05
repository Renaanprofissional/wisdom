"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaCheck,
  FaTimes,
  FaRedo,
  FaArrowRight,
} from "react-icons/fa";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  order: number;
  question: string;
  options: Option[];
};

type Lesson = {
  id: string;
  title: string;
  xpReward: number;
  questions: Question[];
  alreadyCompleted?: boolean;
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const lessonId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Option | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [validating, setValidating] = useState(false);

  const [lives, setLives] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const resetLesson = () => {
    setCurrent(0);
    setSelected(null);
    setStatus("idle");
    setFinished(false);
  };

  // ================= FETCH LESSON =================
  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lesson/${lessonId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        if (data.alreadyCompleted) {
          toast.info("Você já completou essa lição ✅");
        }

        setLesson(data);
      } catch {
        toast.error("Erro ao carregar lição");
        router.push("/");
      }
    };

    fetchLesson();
  }, [lessonId, router]);

  // ================= FETCH LIVES =================
  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan?.isUnlimited) {
          setIsUnlimited(true);
          setLives(null);
        } else {
          setLives(data.lives);
        }
      });
  }, []);

  // ================= ANSWER =================
  const handleAnswer = (option: Option) => {
    if (status !== "idle" || validating) return;
    setSelected(option);
  };

  const validateAnswer = async () => {
    if (!selected || !lesson) return;

    try {
      setValidating(true);

      const res = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: lesson.questions[current].id,
          optionId: selected.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (data.correct) {
        setStatus("correct");
        toast.success("Correto!");
      } else {
        setStatus("wrong");
        toast.error("Errado!");
      }
    } catch {
      toast.error("Erro ao validar");
    } finally {
      setValidating(false);
    }
  };

  // ================= NEXT =================
  const handleNext = async () => {
    if (!lesson) return;

    if (status === "wrong") return;

    if (status === "idle") {
      await validateAnswer();
      return;
    }

    const isLast = current === lesson.questions.length - 1;

    if (isLast) {
      setFinished(true);
      return;
    }

    setCurrent((prev) => prev + 1);
    setSelected(null);
    setStatus("idle");
  };

  // ================= LOADING =================
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] text-white">
        Carregando...
      </div>
    );
  }

  // ================= FINAL =================
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0B0F] text-white gap-6">
        <h1 className="text-3xl font-bold text-orange-400">🎉 Concluído!</h1>

        <p className="text-orange-200/70">
          {lesson.alreadyCompleted
            ? "Revisão concluída! Continue consistente 🔥"
            : "Você ganhou XP e avançou!"}
        </p>

        <div className="flex gap-4">
          <button
            onClick={resetLesson}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 rounded-xl"
          >
            <FaRedo /> Refazer
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600/80 rounded-xl"
          >
            Dashboard <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  const question = lesson.questions[current];

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">
      {/* HEADER */}
      <header className="p-4 border-b border-orange-500/10 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-orange-300/70 flex items-center">
            {lesson.title}

            {lesson.alreadyCompleted && (
              <span className="ml-2 text-[10px] bg-orange-500 text-black px-2 py-0.5 rounded-full">
                REVISÃO
              </span>
            )}
          </p>

          <div className="flex items-center gap-2 text-orange-400">
            <FaHeart /> {isUnlimited ? "∞" : lives}
          </div>
        </div>

        {lesson.alreadyCompleted && (
          <div className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg w-fit">
            🔁 Você já concluiu essa lição
          </div>
        )}

        <div className="w-full h-2 bg-orange-500/10 rounded-full overflow-hidden">
          <div
            className="h-2 bg-linear-to-r from-orange-500 to-orange-300"
            style={{
              width: `${((current + 1) / lesson.questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 gap-8">
        <h2 className="text-2xl font-bold text-center max-w-xl">
          {question.question}
        </h2>

        <div className="w-full max-w-md space-y-4">
          {question.options.map((opt) => {
            const isSelected = selected?.id === opt.id;

            let style =
              "bg-orange-500/5 border-orange-500/10 hover:bg-orange-500/10";

            if (isSelected && status === "idle") {
              style = "bg-orange-500/20 border-orange-500";
            }

            if (status === "correct" && isSelected) {
              style = "bg-green-500/20 border-green-500";
            }

            if (status === "wrong" && isSelected) {
              style = "bg-red-500/20 border-red-500";
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt)}
                disabled={status !== "idle"}
                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${style}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-4 border-t border-orange-500/10">
        {status === "wrong" ? (
          <button
            onClick={() => {
              setSelected(null);
              setStatus("idle");
            }}
            className="w-full py-3 bg-red-500 rounded-xl flex items-center justify-center gap-2"
          >
            <FaTimes /> Tentar novamente
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selected || loading || validating}
            className="w-full py-3 bg-linear-to-r from-orange-500 to-orange-400 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {validating
              ? "Verificando..."
              : status === "idle"
                ? "Verificar"
                : current === lesson.questions.length - 1
                  ? lesson.alreadyCompleted
                    ? "Finalizar revisão"
                    : "Finalizar"
                  : "Continuar"}

            <FaCheck />
          </button>
        )}
      </footer>
    </div>
  );
}
