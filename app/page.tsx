"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  FaFire,
  FaHeart,
  FaStar,
  FaUser,
  FaSignOutAlt,
  FaLock,
  FaCheck,
} from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";

type Stats = {
  xp: number;
  level: number;
  lives: number;
  streak: number;
  currentLevelXp?: number;
  xpToNextLevel?: number;
  plan: {
    name: string;
    isUnlimited: boolean;
  };
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

  const isBlocked = !!stats && !stats.plan.isUnlimited && stats.lives <= 0;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lesson", { cache: "no-store" });
      const data = await res.json();
      setLessons(data);
    } catch {
      toast.error("Erro ao carregar lições");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) fetchStats();
  }, [session, fetchStats]);

  useEffect(() => {
    if (stats) fetchLessons();
  }, [stats, fetchLessons]);

  const handleLessonClick = (lesson: Lesson) => {
    if (isBlocked) {
      toast.error("Você está sem vidas 😢");
      return;
    }

    if (lesson.locked) {
      toast.warning("Lição bloqueada 🔒");
      return;
    }

    router.push(`/lesson/${lesson.id}`);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Sessão encerrada");
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  if (!session?.user || !stats) return null;

  const { user } = session;

  const progress =
    stats.xpToNextLevel && stats.currentLevelXp !== undefined
      ? (stats.currentLevelXp / stats.xpToNextLevel) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">
      {/* HEADER */}
      <header className="border-b border-orange-500/10 px-6 py-4 flex justify-between items-center backdrop-blur">
        <h1 className="font-bold text-xl text-orange-400 tracking-wide">
          Wisdom
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm flex items-center gap-1 justify-end">
              <FaUser className="text-orange-400" /> {user.name}
            </p>
            <p className="text-xs text-orange-300/60">{stats.plan.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs bg-orange-500/10 hover:bg-orange-500/20 px-3 py-2 rounded-lg transition"
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-8">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <Stat icon={<FaStar />} label="XP" value={stats.xp} />
          <Stat icon={<MdTrendingUp />} label="Level" value={stats.level} />
          <Stat icon={<FaFire />} label="Streak" value={stats.streak} />
          <Stat
            icon={<FaHeart />}
            label="Lives"
            value={stats.plan.isUnlimited ? "∞" : stats.lives}
          />
        </div>

        {/* PROGRESS */}
        <div>
          <div className="flex justify-between text-xs mb-2 text-orange-300/70">
            <span>Progresso</span>
            <span>{Math.floor(progress)}%</span>
          </div>

          <div className="w-full bg-orange-500/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-orange-500 to-orange-300 h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* BLOQUEIO */}
        {isBlocked && (
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-center text-sm">
            Sem vidas 😢 — Faça upgrade para continuar
          </div>
        )}

        {/* MAPA */}
        <div className="flex flex-col items-center gap-8 mt-10">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.level === stats.level;

            return (
              <div
                key={lesson.id}
                className={`flex flex-col items-center ${
                  index % 2 === 0 ? "translate-x-8" : "-translate-x-8"
                }`}
              >
                {index !== 0 && (
                  <div className="w-1 h-12 bg-linear-to-b from-orange-500/30 to-transparent mb-2" />
                )}

                <button
                  onClick={() => handleLessonClick(lesson)}
                  disabled={lesson.locked || isBlocked}
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold
                    transition-all duration-300
                    shadow-lg
                    ${
                      lesson.locked
                        ? "bg-gray-700 cursor-not-allowed"
                        : lesson.completed
                          ? "bg-orange-500/70 ring-2 ring-orange-300"
                          : isCurrent
                            ? "bg-orange-500 scale-110 shadow-orange-500/50"
                            : "bg-orange-500/10 hover:bg-orange-500/20"
                    }
                  `}
                >
                  {lesson.locked ? (
                    <FaLock />
                  ) : lesson.completed ? (
                    <FaCheck />
                  ) : (
                    lesson.level
                  )}
                </button>

                <p className="text-xs text-center mt-2 max-w-[100px] text-orange-200">
                  {lesson.title}
                  {lesson.completed && (
                    <span className="block text-[10px] text-orange-400">
                      Concluída
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-orange-500/10 text-center text-xs text-orange-400/50 py-4">
        © 2026 Wisdom
      </footer>
    </div>
  );
}

function Stat({ icon, label, value }: any) {
  return (
    <div className="bg-linear-to-br from-orange-500/10 to-orange-500/5 p-4 rounded-2xl text-center shadow-md hover:scale-105 transition">
      <div className="flex justify-center mb-1 text-orange-400">{icon}</div>
      <p className="text-sm font-bold">{value}</p>
      <span className="text-[10px] text-orange-300/60">{label}</span>
    </div>
  );
}
