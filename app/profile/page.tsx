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
      <div className="min-h-screen flex items-center justify-center bg-background text-brand animate-pulse">
        Carregando perfil...
      </div>
    );
  }

  if (!user || !data) return null;

  const STEP = 1000;
  const progress = ((data.xp % STEP) / STEP) * 100;

  const planLabel = isAdmin ? "ADMIN" : isPro ? "PRO" : "FREE";

  return (
    <div className="min-h-screen px-4 py-6 bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-6 mb-16">
        {/* HEADER */}
        <div className="p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl bg-brand/15 text-brand">
              {isAdmin ? <FaCrown /> : <FiUser />}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 rounded-full font-bold bg-brand/15 text-brand">
                  {planLabel}
                </span>

                <span className="text-xs text-muted-foreground">
                  Plano: {data.plan.name}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 self-start"
            >
              <FiSettings />
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat icon={<BsStars />} value={data.xp} label="XP" />
          <Stat icon={<GiBatwingEmblem />} value={data.level} label="Level" />
          <Stat icon={<FaFire />} value={data.streak} label="Streak" />
          <Stat icon={<FaHeart />} value={data.lives} label="Vidas" />
        </div>

        {/* PROGRESS */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="font-bold mb-3">Progresso</h2>

          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            {data.xp % STEP} XP neste nível
          </p>
        </div>

        {/* COURSE */}
        {data.activeCourse && (
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="font-bold mb-2 text-brand">Curso Atual</h2>

            <p className="text-lg text-muted-foreground">
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
    <div className="p-4 rounded-xl text-center bg-card border border-border text-brand">
      <div className="text-xl flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
