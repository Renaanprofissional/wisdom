"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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

  // ================= FETCH STATS =================
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me", {
        cache: "no-store",
      });

      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }, []);

  // ================= FETCH LESSONS =================
  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lesson", {
        cache: "no-store",
      });

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

  useEffect(() => {
    const handleFocus = () => fetchStats();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchStats]);

  // ================= CLICK LESSON =================
  const handleLessonClick = (lesson: Lesson) => {
    if (isBlocked) {
      toast.error("Você está sem vidas 😢");
      return;
    }

    if (lesson.locked) {
      toast.warning("Lição bloqueada 🔒");
      return;
    }

    //  AGORA PERMITE REFAZER
    if (lesson.completed) {
      toast.info("Refazendo lição 🔁");
      router.push(`/lesson/${lesson.id}`);
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
    <div className="min-h-screen bg-[#05070F] text-white flex flex-col">
      {/* HEADER */}
      <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Wisdom</h1>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm">{user.name}</p>
            <p className="text-xs text-white/50">{stats.plan.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs bg-red-500/20 px-3 py-1 rounded-lg"
          >
            Sair
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 space-y-8">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-3">
          <Stat label="XP" value={stats.xp} />
          <Stat label="Nível" value={stats.level} />
          <Stat label="🔥" value={stats.streak} />
          <Stat label="❤️" value={stats.plan.isUnlimited ? "∞" : stats.lives} />
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* BLOQUEIO */}
        {isBlocked && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center text-sm">
            Sem vidas 😢 Volte mais tarde ou vire PRO
          </div>
        )}

        {/* MAPA */}
        <div className="flex flex-col items-center gap-6 mt-10">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.level === stats.level;

            return (
              <div
                key={lesson.id}
                className={`flex flex-col items-center ${
                  index % 2 === 0 ? "translate-x-6" : "-translate-x-6"
                }`}
              >
                {index !== 0 && <div className="w-1 h-10 bg-white/10 mb-2" />}

                <button
                  onClick={() => handleLessonClick(lesson)}
                  disabled={lesson.locked || isBlocked}
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold
                    transition
                    ${
                      lesson.locked
                        ? "bg-gray-700 cursor-not-allowed"
                        : lesson.completed
                          ? "bg-blue-500 opacity-70 ring-2 ring-blue-300"
                          : isCurrent
                            ? "bg-green-500 scale-110 shadow-lg"
                            : "bg-white/10 hover:bg-white/20"
                    }
                  `}
                >
                  {lesson.locked
                    ? "🔒"
                    : lesson.completed
                      ? "✅"
                      : lesson.level}
                </button>

                <p className="text-xs text-center mt-2 max-w-[90px]">
                  {lesson.title}
                  {lesson.completed && (
                    <span className="block text-[10px] text-blue-400">
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
      <footer className="border-t border-white/10 text-center text-xs text-white/40 py-4">
        © 2026 Wisdom
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white/5 p-3 rounded-xl text-center">
      <p className="text-sm font-bold">{value}</p>
      <span className="text-[10px] text-white/50">{label}</span>
    </div>
  );
}
