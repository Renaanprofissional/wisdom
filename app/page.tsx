"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // 🔐 Guard de autenticação
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/authentication");
    }
  }, [isPending, session, router]);

  // ⏳ Loading State (melhor UX)
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#05070F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  // 🚫 Evita render enquanto redireciona
  if (!session?.user) return null;

  const { user } = session;

  // 🔓 Logout handler
  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Sessão encerrada com sucesso!");
    router.replace("/authentication");
  };

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(255,255,255,0.05)] p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-white/60 text-sm">
              Bem-vindo de volta 👋
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-left">
            <p className="text-white text-sm">
              <span className="text-white/50">Nome:</span>{" "}
              <span className="font-medium">
                {user.name || "Usuário"}
              </span>
            </p>

            <p className="text-white text-sm">
              <span className="text-white/50">Email:</span>{" "}
              <span className="font-medium">
                {user.email}
              </span>
            </p>
          </div>

          {/* Action */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl font-semibold text-white 
            bg-red-600 
            hover:opacity-90 transition-all shadow-lg"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
