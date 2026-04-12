"use client";

import { useParams, useRouter } from "next/navigation";
import { userAgent } from "next/server";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaHome, FaRedo } from "react-icons/fa";
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

  const [lives, setLives] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);

  //🔊 SONS
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const wrongSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
    winSound.current = new Audio("/sounds/win.mp3");
  }, []);

  const playSound = (type: "correct" | "wrong" | "win") => {
    const map = {
      correct: correctSound.current,
      wrong: wrongSound.current,
      win: winSound.current,
    };

    const sound = map[type];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  };

  const resetLesson = () => {
    setCurrent(0);
    setSelected(null);
    setStatus("idle");
    setFinished(false);
  };

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
          toast("Você já completou essa lição");
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
        playSound("correct");
        toast.success("Correto! Clique em continuar!");
      } else {
        setStatus("wrong");
        playSound("wrong");
        toast.error("Resposta errada, Tente novamente");

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
      if (lesson.alreadyCompleted) {
        setFinished(true);
        playSound("win");
        return;
      }

      await completeLesson();
      return;
    }

    setCurrent((prev) => prev + 1);
    setSelected(null);
    setStatus("idle");
  };

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
          playSound("win");
          return;
        }

        throw new Error(data.error);
      }

      toast.success(`+${data.xpGained} XP 🚀`);
      playSound("win");
      setFinished(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-orange-400 text-lg animate-pulse">
        Carregando lição...
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl">
          {/* Ícone */}
          <div className="relative">
            <FaCheckCircle className="text-6xl text-orange-400 animate-pulse" />
            <div className="absolute inset-0 blur-2xl bg-orange-400/30 rounded-full"></div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Lição concluída!
          </h1>

          {/* Subtexto */}
          <p className="text-white/60 text-center text-sm leading-relaxed">
            {lesson.alreadyCompleted
              ? "Você revisou essa lição com sucesso. Consistência é o segredo 🚀"
              : "Parabéns! Você ganhou XP e está evoluindo cada vez mais 🔥"}
          </p>

          {/* Botões */}
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={resetLesson}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
            >
              <FaRedo />
              Refazer
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-orange-400 to-amber-500 text-black font-semibold rounded-xl shadow-lg hover:brightness-110 transition-all duration-200 active:scale-95"
            >
              <FaHome />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = lesson.questions[current];
  if (!question) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* HEADER */}
      <header className="p-5 border-b border-orange-500/10 bg-[#0a0a0a]/80 backdrop-blur-xl space-y-3">
        <p className="text-sm text-white/50">
          {lesson.title} • {current + 1}/{lesson.questions.length}
        </p>

        {lesson.alreadyCompleted && (
          <div className="text-xs text-orange-400">🔁 Revisando lição</div>
        )}

        <div className="text-sm text-orange-400">
          ❤️ {isUnlimited ? "∞" : (lives ?? "...")}
        </div>

        <div className="w-full h-2 bg-[#111] rounded-full overflow-hidden">
          <div
            className="h-2 bg-linear-to-r from-orange-400 to-amber-500 shadow-[0_0_10px_rgba(255,140,0,0.7)] transition-all"
            style={{
              width: `${((current + 1) / lesson.questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 gap-8">
        <h2 className="text-2xl font-bold text-center max-w-lg leading-snug">
          {question.question}
        </h2>

        <div className="w-full max-w-md space-y-4">
          {question.options.map((opt) => {
            const isSelected = selected?.id === opt.id;

            let style = "bg-[#0f0f0f] border-orange-500/10 hover:bg-[#1a1a1a]";

            if (isSelected && status === "idle") {
              style =
                "bg-orange-500/10 border-orange-500 shadow-[0_0_10px_rgba(255,140,0,0.5)]";
            }

            if (status === "correct" && isSelected) {
              style =
                "bg-green-500/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]";
            }

            if (status === "wrong" && isSelected) {
              style =
                "bg-red-500/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]";
            }

            return (
              <button
                key={opt.id}
                disabled={status !== "idle" || validating}
                onClick={() => handleAnswer(opt)}
                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${style}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-5 border-t border-orange-500/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        {status === "wrong" ? (
          <button
            onClick={() => {
              setSelected(null);
              setStatus("idle");
            }}
            className="w-full py-3 bg-red-500/80 hover:bg-red-500 rounded-xl font-semibold transition"
          >
            Tentar novamente
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selected || loading || validating}
            className="w-full py-3 bg-linear-to-r from-orange-400 to-amber-500 text-black font-semibold rounded-xl shadow-lg disabled:opacity-40 transition"
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
