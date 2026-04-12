"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FaFire, FaHeart, FaCrown } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { FiUser, FiSettings } from "react-icons/fi";
import { NavMenu } from "@/components/common/navMenu";
import { GiBatwingEmblem } from "react-icons/gi";

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

  const isPro = data?.plan?.isUnlimited;
  const isAdmin = user?.role === "ADMIN";

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
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400 animate-pulse">
        Carregando perfil...
      </div>
    );
  }

  if (!user || !data) return null;

  const STEP = 1000;
  const progress = ((data.xp % STEP) / STEP) * 100;

  const theme = isAdmin ? "admin" : isPro ? "pro" : "free";

  return (
    <div
      className={`min-h-screen px-4 py-6 text-white
      ${
        theme === "admin"
          ? "bg-black"
          : theme === "pro"
            ? "bg-linear-to-br from-black via-[#0a0a0a] to-[#1a1a1a]"
            : "bg-[#050505]"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6 mb-16">
        {/* HEADER */}
        <div
          className={`relative p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 overflow-hidden
          ${
            theme === "admin"
              ? "bg-linear-to-r from-orange-500/15 via-yellow-400/10 to-orange-600/15 border border-orange-400/40 shadow-[0_0_50px_rgba(255,140,0,0.4)]"
              : theme === "pro"
                ? "bg-linear-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/30 shadow-[0_0_30px_rgba(255,200,0,0.25)]"
                : "bg-[#111] border border-orange-500/10"
          }`}
        >
          {(theme === "pro" || theme === "admin") && (
            <div className="absolute inset-0 blur-3xl opacity-20 bg-orange-400" />
          )}

          <div className="flex items-center gap-4 relative z-10">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl
              ${
                theme === "admin"
                  ? "bg-orange-500/30 text-yellow-300 shadow-[0_0_20px_rgba(255,140,0,0.6)]"
                  : theme === "pro"
                    ? "bg-yellow-400/20 text-yellow-300"
                    : "bg-orange-500/20 text-orange-400"
              }`}
            >
              {theme === "admin" ? <FaCrown /> : <FiUser />}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-bold
                  ${
                    theme === "admin"
                      ? "bg-linear-to-r from-yellow-300 to-orange-400 text-black"
                      : theme === "pro"
                        ? "bg-yellow-300 text-black"
                        : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {theme === "admin"
                    ? "ADMIN"
                    : theme === "pro"
                      ? "PRO"
                      : "FREE"}
                </span>

                <span className="text-xs text-gray-400">
                  Plano: {data.plan.name}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="relative z-10 p-2 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
            >
              <FiSettings />
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat icon={<BsStars />} value={data.xp} label="XP" theme={theme} />
          <Stat
            icon={<GiBatwingEmblem />}
            value={data.level}
            label="Level"
            theme={theme}
          />
          <Stat
            icon={<FaFire />}
            value={data.streak}
            label="Streak"
            theme={theme}
          />
          <Stat
            icon={<FaHeart />}
            value={data.lives}
            label="Vidas"
            theme={theme}
          />
        </div>

        {/* PROGRESS */}
        <div
          className={`p-6 rounded-2xl
          ${
            theme === "admin"
              ? "bg-black border border-orange-400/40 shadow-[0_0_40px_rgba(255,140,0,0.25)]"
              : theme === "pro"
                ? "bg-yellow-400/10 border border-yellow-400/30"
                : "bg-[#111] border border-orange-500/10"
          }`}
        >
          <h2 className="font-bold mb-3">Progresso</h2>

          <div className="w-full h-4 bg-black rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500
              ${
                theme === "admin"
                  ? "bg-linear-to-r from-yellow-300 via-orange-400 to-orange-500"
                  : theme === "pro"
                    ? "bg-linear-to-r from-yellow-300 to-orange-500"
                    : "bg-linear-to-r from-orange-400 to-yellow-400"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-400 mt-2">
            {data.xp % STEP} XP neste nível
          </p>
        </div>

        {/* COURSE */}
        {data.activeCourse && (
          <div
            className={`relative p-6 rounded-2xl overflow-hidden
            ${
              theme === "admin"
                ? "bg-linear-to-r from-orange-500/10 to-yellow-400/10 border border-orange-400/40 shadow-[0_0_30px_rgba(255,140,0,0.25)]"
                : theme === "pro"
                  ? "bg-linear-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/30"
                  : "bg-[#111] border border-orange-500/10"
            }`}
          >
            {(theme === "pro" || theme === "admin") && (
              <div className="absolute inset-0 blur-3xl opacity-20 bg-orange-400" />
            )}

            <div className="relative z-10">
              <h2
                className={`font-bold mb-2
                ${
                  theme === "admin"
                    ? "text-orange-300"
                    : theme === "pro"
                      ? "text-yellow-300"
                      : "text-orange-400"
                }`}
              >
                Curso Atual
              </h2>

              <p className="text-lg text-gray-300">
                {data.activeCourse.sourceLanguage.name} →{" "}
                {data.activeCourse.targetLanguage.name}
              </p>
            </div>
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
  theme,
}: {
  icon: React.ReactNode;
  value: any;
  label: string;
  theme: string;
}) {
  return (
    <div
      className={`p-4 rounded-xl text-center
      ${
        theme === "admin"
          ? "bg-black border border-orange-400/40 text-orange-300"
          : theme === "pro"
            ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-300"
            : "bg-[#111] border border-orange-500/10 text-orange-400"
      }`}
    >
      <div className="text-xl flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
