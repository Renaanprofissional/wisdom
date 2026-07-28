"use client";

import { useParams, useRouter } from "next/navigation";
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
      <div className="min-h-screen flex items-center justify-center bg-background text-brand text-lg animate-pulse">
        Carregando lição...
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 flex flex-col items-center gap-6">
          <FaCheckCircle className="text-6xl text-brand" />

          <h1 className="text-3xl font-bold text-center">Lição concluída!</h1>

          <p className="text-muted-foreground text-center text-sm leading-relaxed">
            {lesson.alreadyCompleted
              ? "Você revisou essa lição com sucesso. Consistência é o segredo 🚀"
              : "Parabéns! Você ganhou XP e está evoluindo cada vez mais 🔥"}
          </p>

          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={resetLesson}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/70 rounded-xl transition-all duration-200 active:scale-95"
            >
              <FaRedo />
              Refazer
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand text-brand-foreground font-semibold rounded-xl hover:opacity-90 transition-all duration-200 active:scale-95"
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* HEADER */}
      <header className="p-5 border-b border-border bg-background/80 backdrop-blur-xl space-y-3">
        <p className="text-sm text-muted-foreground">
          {lesson.title} • {current + 1}/{lesson.questions.length}
        </p>

        {lesson.alreadyCompleted && (
          <div className="text-xs text-brand">🔁 Revisando lição</div>
        )}

        <div className="text-sm text-brand">
          ❤️ {isUnlimited ? "∞" : (lives ?? "...")}
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-2 bg-brand transition-all"
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

            let style = "bg-card border-border hover:bg-muted";

            if (isSelected && status === "idle") {
              style = "bg-brand/10 border-brand";
            }

            if (status === "correct" && isSelected) {
              style = "bg-green-500/15 border-green-500";
            }

            if (status === "wrong" && isSelected) {
              style = "bg-destructive/15 border-destructive";
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
      <footer className="p-5 border-t border-border bg-background/80 backdrop-blur-xl">
        {status === "wrong" ? (
          <button
            onClick={() => {
              setSelected(null);
              setStatus("idle");
            }}
            className="w-full py-3 bg-destructive/15 hover:bg-destructive/25 text-destructive rounded-xl font-semibold transition"
          >
            Tentar novamente
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selected || loading || validating}
            className="w-full py-3 bg-brand text-brand-foreground font-semibold rounded-xl disabled:opacity-40 transition hover:opacity-90"
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
