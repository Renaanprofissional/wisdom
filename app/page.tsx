"use client";

import { authClient } from "@/lib/auth-client";
import { Bounce, toast } from "react-toastify";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaFire, FaHeart, FaSignOutAlt, FaExchangeAlt } from "react-icons/fa";
import { GiBatwingEmblem } from "react-icons/gi";
import { BsStars } from "react-icons/bs";
import { FiZap } from "react-icons/fi";

import { NavMenu } from "@/components/common/navMenu";

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
    if (isBlocked) return toast.error("Você ficou sem vidas 💔");
    if (lesson.locked)
      return toast.warning("Essa lição ainda está bloqueada 🔒");
    router.push(`/lesson/${lesson.id}`);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    toast("Até logo! Volte sempre");
  };

  const handleChangeCourse = async () => {
    await fetch("/api/course/select", {
      method: "POST",
      body: JSON.stringify({ courseId: null }),
    });

    toast.info("Escolha um novo curso para continuar");
    fetchStats();
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-orange-400 animate-pulse px-4 text-center">
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
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white flex flex-col pb-20">
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-orange-500/10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 className="font-bold text-lg sm:text-xl flex justify-center items-center gap-2 bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          <FiZap /> Wisdom
        </h1>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-right leading-tight">
            <p className="text-xs sm:text-sm font-medium">
              {session.user.name}
            </p>
            <p className="text-[10px] sm:text-xs text-orange-400/70">
              {stats.plan?.name ?? "FREE"}
            </p>
          </div>

          <button
            onClick={handleChangeCourse}
            className="flex items-center gap-1 text-[10px] sm:text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-2 py-1.5 sm:px-3 rounded-lg border border-orange-500/20"
          >
            <FaExchangeAlt />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] sm:text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-lg border border-orange-500/20"
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
          <div className="w-full bg-[#111] rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-orange-400 via-orange-500 to-amber-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-orange-400/70 mt-2 text-center">
            Level {stats.level}
          </p>
        </div>

        {isBlocked && (
          <div className="bg-orange-500/10 border border-orange-500/30 p-3 sm:p-4 rounded-xl text-center text-xs sm:text-sm text-orange-300">
            Sem vidas 😢 Volte mais tarde ou vire PRO
          </div>
        )}

        <div className="flex flex-col items-center gap-8 mt-6 sm:mt-10">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.level === stats.level;

            return (
              <div key={lesson.id} className="flex flex-col items-center">
                {index !== 0 && (
                  <div className="w-1 h-10 sm:h-12 bg-linear-to-b from-orange-500/30 to-transparent mb-2" />
                )}

                <button
                  onClick={() => handleLessonClick(lesson)}
                  disabled={lesson.locked || isBlocked}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold transition ${
                    lesson.locked
                      ? "bg-[#1a1a1a] text-gray-500"
                      : lesson.completed
                        ? "bg-orange-500/70 ring-2 ring-orange-300 scale-95"
                        : isCurrent
                          ? "bg-linear-to-br from-orange-400 to-amber-500 scale-105"
                          : "bg-[#111] border border-orange-500/10"
                  }`}
                >
                  {lesson.locked ? "🔒" : lesson.completed ? "✓" : lesson.level}
                </button>

                <p className="text-[10px] sm:text-xs text-center mt-2 max-w-[90px] sm:max-w-[100px] text-gray-300">
                  {lesson.title}
                  {lesson.completed && (
                    <span className="block text-[9px] sm:text-[10px] text-orange-400 mt-1">
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
    await fetch("/api/course/select", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });

    toast.success("Curso selecionado 🚀");
    onSelect();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white gap-6 px-4 text-center">
      <h1 className="text-xl sm:text-2xl font-bold text-orange-400">
        Escolha seu curso
      </h1>

      {courses.map((c) => (
        <button
          key={c.id}
          onClick={() => handleSelect(c.id)}
          className="w-full max-w-xs px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 rounded-xl transition"
        >
          {c.sourceLanguage.name} → {c.targetLanguage.name}
        </button>
      ))}
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: any }) {
  return (
    <div className="bg-[#0f0f0f] p-3 sm:p-4 rounded-2xl text-center border border-orange-500/10">
      <div className="text-orange-400 text-base sm:text-lg flex justify-center mb-1">
        {icon}
      </div>
      <p className="text-sm sm:text-lg font-bold">{value}</p>
    </div>
  );
}
