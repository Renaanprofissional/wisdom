"use client";

import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";

type Stats = {
  xp: number;
  level: number;
  lives: number | string;
  streak: number;
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
};

export default function DashboardPage() {
  const { session, isPending } = useAuthGuard();

  const [loadingLesson, setLoadingLesson] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // 🚀 Buscar stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/user/me");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStats(data);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  };

  // 📚 Buscar lições
  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/lessons");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setLessons(data);
    } catch {
      toast.error("Erro ao carregar lições");
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchStats();
      fetchLessons();
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#05070F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const { user } = session;

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Sessão encerrada com sucesso!");
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      setLoadingLesson(true);

      const res = await fetch("/api/lesson/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(`+${data.xpGained} XP 🚀`);

      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingLesson(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* USER */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-white">
            {user.name || "Usuário"}
          </h1>
          <p className="text-white/50 text-sm">{user.email}</p>
        </div>

        {/* 💎 PLAN */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">
              Plano {stats?.plan?.name}
            </p>
            <span className="text-xs text-white/50">
              {stats?.plan?.isUnlimited ? "Vidas ilimitadas" : "Plano gratuito"}
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              stats?.plan?.isUnlimited
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {stats?.plan?.isUnlimited ? "PRO" : "FREE"}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <p className="text-white text-lg font-bold">{stats?.xp ?? "-"}</p>
            <span className="text-xs text-white/50">XP</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl text-center">
            <p className="text-white text-lg font-bold">
              {stats?.lives ?? "-"}
            </p>
            <span className="text-xs text-white/50">Vidas</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl text-center">
            <p className="text-white text-lg font-bold">
              🔥 {stats?.streak ?? 0}
            </p>
            <span className="text-xs text-white/50">Streak</span>
          </div>
        </div>

        {/* LEVEL */}
        <div className="bg-white/5 p-4 rounded-xl text-center">
          <p className="text-white font-bold text-lg">
            Nível {stats?.level ?? 1}
          </p>
        </div>

        {/* 📚 LIÇÕES */}
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <p className="text-white/50 text-sm text-center">
              Nenhuma lição encontrada
            </p>
          ) : (
            lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => handleCompleteLesson(lesson.id)}
                disabled={loadingLesson}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition disabled:opacity-50"
              >
                <p className="text-white font-medium">{lesson.title}</p>
                <span className="text-xs text-white/50">
                  XP: {lesson.xpReward} • Nível {lesson.level}
                </span>
              </button>
            ))
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-600 rounded-xl text-white font-semibold"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
