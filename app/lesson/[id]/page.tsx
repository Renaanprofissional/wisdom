"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

  // controle de vidas
  const [lives, setLives] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);

  // ================= RESET =================
  const resetLesson = () => {
    setCurrent(0);
    setSelected(null);
    setStatus("idle");
    setFinished(false);
  };

  // ================= FETCH LESSON =================
  useEffect(() => {
    if (!lessonId) return;

    const controller = new AbortController();

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lesson/${lessonId}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        if (data.alreadyCompleted) {
          toast.info("Você já completou essa lição ✅");
        }

        setLesson(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;

        toast.error("Erro ao carregar lição");
        router.push("/");
      }
    };

    fetchLesson();

    return () => controller.abort();
  }, [lessonId, router]);

  // ================= FETCH LIVES =================
  const fetchLives = async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();

      if (data.plan?.isUnlimited) {
        setIsUnlimited(true);
        setLives(null);
      } else {
        setIsUnlimited(false);
        setLives(data.lives);
      }
    } catch {
      toast.error("Erro ao carregar vidas");
    }
  };

  useEffect(() => {
    fetchLives();
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
        toast.success("Correto! ✅");
      } else {
        setStatus("wrong");
        toast.error("Resposta errada 😢");

        // 🔥 NÃO REMOVE VIDA EM REVISÃO
        if (!lesson.alreadyCompleted) {
          await fetch("/api/user/remove-life", {
            method: "POST",
          });

          if (!isUnlimited) {
            setLives((prev) => {
              if (prev === null) return prev;
              const newLives = prev - 1;

              if (newLives <= 0) {
                toast.error("Você ficou sem vidas 😢");
                setTimeout(() => {
                  router.push("/");
                }, 1500);
              }

              return newLives;
            });
          }
        }
      }
    } catch {
      toast.error("Erro ao validar resposta");
    } finally {
      setValidating(false);
    }
  };

  // ================= NEXT =================
  const handleNext = async () => {
    if (!lesson) return;

    if (status === "wrong") {
      toast.error("Você precisa acertar para continuar!");
      return;
    }

    if (status === "idle") {
      await validateAnswer();
      return;
    }

    const isLast = current >= lesson.questions.length - 1;

    if (isLast) {
      //  NÃO COMPLETA SE FOR REVISÃO
      if (lesson.alreadyCompleted) {
        setFinished(true);
        return;
      }

      await completeLesson();
      return;
    }

    setCurrent((prev) => prev + 1);
    setSelected(null);
    setStatus("idle");
  };

  // ================= COMPLETE =================
  const completeLesson = async () => {
    if (!lesson || lesson.questions.length === 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/lesson/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId: lesson.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Lição já concluída") {
          setFinished(true);
          return;
        }

        throw new Error(data.error);
      }

      toast.success(`+${data.xpGained} XP 🚀`);
      setFinished(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOADING =================
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070F] text-white">
        Carregando lição...
      </div>
    );
  }

  // ================= FINALIZADO =================
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070F] text-white gap-6">
        <h1 className="text-2xl font-bold">🎉 Lição concluída!</h1>
        <p className="text-white/50">
          {lesson.alreadyCompleted
            ? "Revisão concluída!"
            : "Você ganhou XP e avançou!"}
        </p>

        <div className="flex gap-4">
          <button
            onClick={resetLesson}
            className="px-6 py-3 bg-blue-500 rounded-xl"
          >
            🔁 Refazer lição
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-green-500 rounded-xl"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = lesson.questions[current];
  if (!question) return null;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <header className="p-4 border-b border-white/10 space-y-2">
        <p className="text-sm text-white/50">
          {lesson.title} • {current + 1}/{lesson.questions.length}
        </p>

        {lesson.alreadyCompleted && (
          <div className="text-xs text-yellow-400">
            🔁 Revisando lição já concluída
          </div>
        )}

        <div className="text-sm">❤️ {isUnlimited ? "∞" : (lives ?? "...")}</div>

        <div className="w-full h-2 bg-white/10 rounded-full">
          <div
            className="h-2 bg-[#e36a00] rounded-full transition-all"
            style={{
              width: `${((current + 1) / lesson.questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 gap-6">
        <h2 className="text-xl font-bold text-center">{question.question}</h2>

        <div className="w-full max-w-md space-y-3">
          {question.options.map((opt) => {
            const isSelected = selected?.id === opt.id;

            let style = "bg-white/5 border-white/10 hover:bg-white/10";

            if (isSelected && status === "idle") {
              style = "bg-blue-500/20 border-blue-500";
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
                disabled={status !== "idle" || validating}
                onClick={() => handleAnswer(opt)}
                className={`w-full p-4 rounded-xl border text-left transition ${style}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-4 border-t border-white/10">
        {status === "wrong" ? (
          <button
            onClick={() => {
              setSelected(null);
              setStatus("idle");
            }}
            className="w-full py-3 bg-red-500 rounded-xl font-semibold"
          >
            Tentar novamente
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selected || loading || validating}
            className="w-full py-3 bg-[#e36a00] rounded-xl font-semibold disabled:opacity-50"
          >
            {validating
              ? "Verificando..."
              : status === "idle"
                ? "Verificar"
                : current === lesson.questions.length - 1
                  ? "Finalizar"
                  : "Continuar"}
          </button>
        )}
      </footer>
    </div>
  );
}
