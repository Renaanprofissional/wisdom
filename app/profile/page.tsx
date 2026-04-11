"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FaFire, FaHeart } from "react-icons/fa";
import { GiBatwingEmblem } from "react-icons/gi";
import { BsStars } from "react-icons/bs";
import { FiUser, FiArrowLeft, FiSettings } from "react-icons/fi";
import { NavMenu } from "@/components/common/navMenu";

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
        const res = await fetch("/api/user/me", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json);
      } catch {
        console.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isPending]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-orange-400 animate-pulse px-4 text-center">
        Carregando perfil...
      </div>
    );
  }

  if (!user || !data) return null;

  const STEP = 1000;
  const progress = ((data.xp % STEP) / STEP) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white px-4 sm:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6 mb-15">
        <div className="bg-[#111] p-4 sm:p-6 rounded-2xl border border-orange-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-lg sm:text-xl">
              <FiUser />
            </div>

            <div>
              <h1 className="text-lg sm:text-2xl font-bold">{user.name}</h1>
              <p className="text-xs sm:text-sm text-gray-400 break-all">
                {user.email}
              </p>
              <p className="text-[10px] sm:text-xs text-orange-400 mt-1">
                Plano: {data.plan?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                user.role === "ADMIN"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {user.role === "ADMIN" ? "ADMIN" : "USER"}
            </span>

            <div className="flex gap-2 flex-wrap">
              {user.role === "ADMIN" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-1 text-[10px] sm:text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg border border-orange-500/20"
                >
                  <FiSettings />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Stat icon={<BsStars />} value={data.xp} label="XP" />
          <Stat icon={<GiBatwingEmblem />} value={data.level} label="Level" />
          <Stat icon={<FaFire />} value={data.streak} label="Streak" />
          <Stat icon={<FaHeart />} value={data.lives} label="Vidas" />
        </div>

        <div className="bg-[#111] p-4 sm:p-6 rounded-2xl border border-orange-500/10">
          <h2 className="font-bold mb-3 text-orange-400 text-sm sm:text-base">
            Progresso
          </h2>

          <div className="w-full bg-black/40 rounded-full h-3 sm:h-4 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-400 via-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            {data.xp % STEP} XP neste nível
          </p>
        </div>

        {data.activeCourse && (
          <div className="bg-[#111] p-4 sm:p-6 rounded-2xl border border-orange-500/10">
            <h2 className="font-bold mb-2 text-orange-400 text-sm sm:text-base">
              Curso Atual
            </h2>

            <p className="text-sm sm:text-lg text-gray-300">
              {data.activeCourse.sourceLanguage.name} →{" "}
              {data.activeCourse.targetLanguage.name}
            </p>
          </div>
        )}
      </div>
      <NavMenu />
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: any;
  label: string;
}) {
  return (
    <div className="bg-[#111] p-3 sm:p-4 rounded-xl border border-orange-500/10 text-center">
      <div className="text-orange-400 text-base sm:text-xl flex justify-center mb-1">
        {icon}
      </div>
      <p className="text-sm sm:text-lg font-bold">{value}</p>
      <span className="text-[10px] sm:text-xs text-gray-400">{label}</span>
    </div>
  );
}
