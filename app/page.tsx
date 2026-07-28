"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaFire, FaHeart, FaSignOutAlt, FaExchangeAlt } from "react-icons/fa";
import { GiBatwingEmblem } from "react-icons/gi";
import { BsStars } from "react-icons/bs";
import { FiZap } from "react-icons/fi";

import { NavMenu } from "@/components/common/navMenu";

// 🔊 Simple sound helper
const playSound = (src: string, volume = 0.5) => {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play();
};

// 🎧 Sound map
const sounds = {
  click: "/sounds/click.mp3",
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  levelUp: "/sounds/level-up.mp3",
  loseLife: "/sounds/wrong.mp3",
};

type Stats = {
  xp: number;
  level: number;
  lives: number;
  streak: number;
  currentLevelXp?: number;
  xpToNextLevel?: number;
  plan?: {
    name: string;
    isUnlimited: boolean;
  };
  activeCourse?: any;
};

type Lesson = {
  id: string;
  title: string;
  xpReward: number;
  level: number;
  locked: boolean;
  completed: boolean;
};

export default function DashboardPage() {
  const { session, isPending } = useAuthGuard();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const isBlocked =
    !!stats && !(stats.plan?.isUnlimited ?? false) && stats.lives <= 0;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();

      setStats({
        ...data,
        plan: data.plan ?? { name: "FREE", isUnlimited: false },
      });
    } catch {
      playSound(sounds.error);
      toast.error("Não foi possível carregar seus dados");
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lesson", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLessons(data);
    } catch {
      playSound(sounds.error);
      toast.error("Falha ao carregar as lições");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) fetchStats();
  }, [session, fetchStats]);

  useEffect(() => {
    if (stats?.activeCourse) fetchLessons();
    else setLoading(false);
  }, [stats, fetchLessons]);

  useEffect(() => {
    const handleFocus = () => fetchStats();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchStats]);

  const handleLessonClick = (lesson: Lesson) => {
    playSound(sounds.click);

    if (isBlocked) {
      playSound(sounds.loseLife);
      return toast.error("Você ficou sem vidas 💔");
    }

    if (lesson.locked) {
      playSound(sounds.error);
      return toast.warning("Essa lição ainda está bloqueada 🔒");
    }

    playSound(sounds.click);
    router.push(`/lesson/${lesson.id}`);
  };

  const handleLogout = async () => {
    playSound(sounds.click);
    await authClient.signOut();
    toast("Até logo! Volte sempre");
  };

  const handleChangeCourse = async () => {
    playSound(sounds.click);

    await fetch("/api/course/select", {
      method: "POST",
      body: JSON.stringify({ courseId: null }),
    });

    toast.info("Escolha um novo curso para continuar");
    fetchStats();
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-brand animate-pulse px-4 text-center">
        Carregando...
      </div>
    );
  }

  if (!session?.user || !stats) return null;

  if (!stats.activeCourse) {
    return <CourseSelector onSelect={fetchStats} />;
  }

  const MAX_LEVEL = 300;
  const progress = Math.min((stats.level / MAX_LEVEL) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20">
      <header className="bg-background/80 backdrop-blur-xl border-b border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 className="font-bold text-lg sm:text-xl flex justify-center items-center gap-2 text-brand">
          <FiZap /> Wisdom
        </h1>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-right leading-tight">
            <p className="text-xs sm:text-sm font-medium">
              {session.user.name}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {stats.plan?.name ?? "FREE"}
            </p>
          </div>

          <button
            onClick={handleChangeCourse}
            className="flex items-center gap-1 text-[10px] sm:text-xs bg-card hover:bg-muted text-muted-foreground px-2 py-1.5 sm:px-3 rounded-lg border border-border"
          >
            <FaExchangeAlt />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] sm:text-xs bg-card hover:bg-muted text-muted-foreground px-3 py-1.5 rounded-lg border border-border"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat icon={<BsStars />} value={stats.xp} />
          <Stat icon={<GiBatwingEmblem />} value={stats.level} />
          <Stat icon={<FaFire />} value={stats.streak} />
          <Stat
            icon={<FaHeart />}
            value={stats.plan?.isUnlimited ? "∞" : stats.lives}
          />
        </div>

        <div>
          <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="bg-brand h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Level {stats.level}
          </p>
        </div>

        {isBlocked && (
          <div className="bg-brand/10 border border-brand/30 p-3 sm:p-4 rounded-xl text-center text-xs sm:text-sm text-brand">
            Sem vidas 😢 Volte mais tarde ou vire PRO
          </div>
        )}

        <div className="flex flex-col items-center gap-8 mt-6 sm:mt-10">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.level === stats.level;

            return (
              <div key={lesson.id} className="flex flex-col items-center">
                {index !== 0 && <div className="w-px h-10 sm:h-12 bg-border mb-2" />}

                <button
                  onClick={() => handleLessonClick(lesson)}
                  disabled={lesson.locked || isBlocked}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition ${
                    lesson.locked
                      ? "bg-muted text-muted-foreground"
                      : lesson.completed
                        ? "bg-brand/70 ring-2 ring-brand scale-95"
                        : isCurrent
                          ? "bg-brand scale-105"
                          : "bg-card border border-border"
                  }`}
                >
                  {lesson.locked ? "🔒" : lesson.completed ? "✓" : lesson.level}
                </button>

                <p className="text-[10px] sm:text-xs text-center mt-2 max-w-[90px] sm:max-w-[100px] text-muted-foreground">
                  {lesson.title}
                  {lesson.completed && (
                    <span className="block text-[9px] sm:text-[10px] text-brand mt-1">
                      Concluída
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <NavMenu />
    </div>
  );
}

function CourseSelector({ onSelect }: { onSelect: () => void }) {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/course")
      .then((res) => res.json())
      .then(setCourses);
  }, []);

  const handleSelect = async (courseId: string) => {
    playSound(sounds.success);

    await fetch("/api/course/select", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });

    toast.success("Curso selecionado 🚀");
    onSelect();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6 px-4 text-center">
      <h1 className="text-xl sm:text-2xl font-bold">Escolha seu curso</h1>

      {courses.map((c) => (
        <button
          key={c.id}
          onClick={() => handleSelect(c.id)}
          className="w-full max-w-xs px-6 py-3 bg-brand text-brand-foreground rounded-xl transition hover:opacity-90"
        >
          {c.sourceLanguage.name} → {c.targetLanguage.name}
        </button>
      ))}
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: any }) {
  return (
    <div className="bg-card p-3 sm:p-4 rounded-2xl text-center border border-border">
      <div className="text-brand text-base sm:text-lg flex justify-center mb-1">
        {icon}
      </div>
      <p className="text-sm sm:text-lg font-bold">{value}</p>
    </div>
  );
}
