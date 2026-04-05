"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaFire, FaHeart } from "react-icons/fa";
import { GiBatwingEmblem } from "react-icons/gi";
import { BsStars } from "react-icons/bs";

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
      const res = await fetch("/api/user/me", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar stats");
      }

      const data = await res.json();

      setStats({
        ...data,
        plan: data.plan ?? {
          name: "FREE",
          isUnlimited: false,
        },
      });
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lesson", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar lições");
      }

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

  const handleLessonClick = (lesson: Lesson) => {
    if (isBlocked) {
      toast.error("Você está sem vidas 😢");
      return;
    }

    if (lesson.locked) {
      toast.warning("Lição bloqueada 🔒");
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-orange-400 text-lg animate-pulse">
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
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pb-20">
      {/* HEADER */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-orange-500/10 px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-xl tracking-wide bg-linear-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          Wisdom
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-orange-400/70">
              {stats.plan?.name ?? "FREE"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition px-4 py-1.5 rounded-lg border border-orange-500/20"
          >
            Sair
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 space-y-10">
        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <Stat label={<BsStars />} value={stats.xp} />
          <Stat label={<GiBatwingEmblem />} value={stats.level} />
          <Stat label={<FaFire />} value={stats.streak} />
          <Stat
            label={<FaHeart />}
            value={stats.plan?.isUnlimited ? "∞" : stats.lives}
          />
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-[#111] rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-linear-to-r from-orange-400 via-orange-500 to-amber-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* BLOQUEIO */}
        {isBlocked && (
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-center text-sm backdrop-blur-md shadow-md text-orange-300">
            Sem vidas 😢 Volte mais tarde ou vire PRO
          </div>
        )}

        {/* 🔥 MAPA (DUOLINGO STYLE RESTAURADO) */}
        <div className="flex flex-col items-center gap-8 mt-10">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.level === stats.level;

            return (
              <div
                key={lesson.id}
                className={`flex flex-col items-center transition-all duration-300 ${
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
              ${
                lesson.locked
                  ? "bg-[#1a1a1a] text-gray-500 cursor-not-allowed"
                  : lesson.completed
                    ? "bg-orange-500/70 ring-2 ring-orange-300 shadow-lg scale-95"
                    : isCurrent
                      ? "bg-linear-to-br from-orange-400 to-amber-500 hover:scale-110 shadow-[0_0_25px_rgba(255,140,0,0.7)]"
                      : "bg-[#111] hover:bg-[#1a1a1a] border border-orange-500/10 hover:scale-105"
              }
            `}
                >
                  {lesson.locked
                    ? "🔒"
                    : lesson.completed
                      ? "✅"
                      : lesson.level}
                </button>

                <p className="text-xs text-center mt-2 max-w-[100px] leading-tight text-white/80">
                  {lesson.title}
                  {lesson.completed && (
                    <span className="block text-[10px] text-orange-400 mt-1">
                      Concluída
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* 🔥 BOTTOM MENU */}
      <NavMenu />
    </div>
  );
}

function Stat({ label, value }: { label: React.ReactNode; value: any }) {
  return (
    <div className="bg-[#0f0f0f] p-4 rounded-2xl text-center border border-orange-500/10 shadow-md hover:scale-105 transition">
      <p className="text-lg font-bold text-orange-400">{value}</p>
      <span className="text-sm text-orange-400/60 flex justify-center mt-1">
        {label}
      </span>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-xs transition ${
        active ? "text-orange-400 scale-110" : "text-white/40 hover:text-white"
      }`}
    >
      <div className="text-lg">{icon}</div>
      <span>{label}</span>
    </button>
  );
}
