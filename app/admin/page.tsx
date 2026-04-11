"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiGrid,
  FiBookOpen,
  FiLayers,
  FiArrowLeft,
  FiMail,
  FiZap,
} from "react-icons/fi";

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("PRO");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/authentication");
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();

        if (!data.isAdmin) {
          toast.error("Acesso negado 🚫");
          router.push("/");
        } else {
          setIsAdmin(true);
        }
      } catch {
        toast.error("Erro ao verificar admin");
        router.push("/");
      }
    };

    checkAdmin();
  }, [session, isPending]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/update-plan", {
        method: "POST",
        body: JSON.stringify({
          email,
          planName: plan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Plano atualizado 🚀");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-400 animate-pulse text-lg">
        Carregando...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white flex">
      <aside className="w-64 bg-[#0f0f0f] border-r border-orange-500/10 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-orange-400 flex items-center gap-2">
            <FiZap /> Admin
          </h2>

          <nav className="flex flex-col gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-500/10 text-gray-300 hover:text-white transition"
            >
              <FiGrid /> Dashboard
            </Link>

            <Link
              href="/admin/create-lesson"
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-500/10 text-gray-300 hover:text-white transition"
            >
              <FiBookOpen /> Criar lição
            </Link>

            <Link
              href="/admin/create-course"
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-500/10 text-gray-300 hover:text-white transition"
            >
              <FiLayers /> Criar curso
            </Link>
          </nav>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition"
        >
          <FiArrowLeft /> Voltar
        </Link>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-[#111] p-8 rounded-2xl w-full max-w-md space-y-6 shadow-[0_0_40px_rgba(255,115,0,0.08)] border border-orange-500/10">
          <h1 className="text-2xl font-bold text-center bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Atualizar Plano
          </h1>

          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-black/40 border border-orange-500/20 rounded-lg px-3">
              <FiMail className="text-orange-400" />
              <input
                type="email"
                placeholder="Email do usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-transparent focus:outline-none"
              />
            </div>

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-orange-500/20 focus:outline-none focus:border-orange-500"
            >
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:opacity-90 transition py-3 rounded-lg font-bold shadow-lg active:scale-[0.98]"
          >
            {loading ? "Atualizando..." : "Atualizar Plano"}
          </button>
        </div>
      </main>
    </div>
  );
}
