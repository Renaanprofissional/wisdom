"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FaFire, FaHeart } from "react-icons/fa";
import { GiBatwingEmblem } from "react-icons/gi";
import { BsStars } from "react-icons/bs";

type UserSession = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: "ADMIN" | "USER";
};

type ProfileData = {
  xp: number;
  level: number;
  lives: number | string;
  streak: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  plan: {
    name: string;
    isUnlimited: boolean;
  };
  activeCourse: any;
};

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user as UserSession | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.push("/authentication");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/me", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar perfil");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isPending]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-orange-400 animate-pulse">
        Carregando perfil...
      </div>
    );
  }

  if (!user || !data) return null;

  const STEP = 1000;
  const progress = ((data.xp % STEP) / STEP) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#05070F] to-[#0A0F1F] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-white/60">{user.email}</p>
            <p className="text-xs text-orange-400 mt-1">
              Plano: {data.plan?.name}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                user.role === "ADMIN"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {user.role === "ADMIN" ? "ADMIN" : "USER"}
            </span>

            <div className="flex gap-2">
              {/* BOTÃO ADMIN */}
              {user.role === "ADMIN" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg border border-orange-500/20"
                >
                  gerenciar
                </button>
              )}

              <button
                onClick={() => router.push("/")}
                className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg border border-orange-500/20"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label={<BsStars />} value={data.xp} />
          <Stat label={<GiBatwingEmblem />} value={data.level} />
          <Stat label={<FaFire />} value={data.streak} />
          <Stat label={<FaHeart />} value={data.lives} />
        </div>

        {/* PROGRESS */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="font-bold mb-3">Progresso</h2>

          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-400 via-orange-500 to-amber-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-white/60 mt-2">
            {data.xp % STEP} (XP atual)
          </p>
        </div>

        {/* CURSO */}
        {data.activeCourse && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="font-bold mb-2">Curso Atual</h2>
            <p className="text-white/80">
              {data.activeCourse.sourceLanguage.name} →{" "}
              {data.activeCourse.targetLanguage.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: React.ReactNode; value: any }) {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center hover:scale-105 transition">
      <p className="text-lg font-bold text-orange-400">{value}</p>
      <span className="text-sm text-orange-400/60 flex justify-center mt-1">
        {label}
      </span>
    </div>
  );
}
