"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#05070F] to-[#0A0F1F] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 p-6 space-y-4">
        <h2 className="text-lg font-bold mb-4">Admin</h2>

        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="p-2 rounded hover:bg-white/10">
            Dashboard
          </Link>
          <Link
            href="/admin/create-lesson"
            className="p-2 rounded hover:bg-white/10"
          >
            Criar lição
          </Link>
          <Link
            href="/admin/create-course"
            className="p-2 rounded hover:bg-white/10"
          >
            Criar curso
          </Link>
          <Link href="/" className="p-2 rounded hover:bg-white/10">
            voltar
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md space-y-6 shadow-xl border border-white/10">
          <h1 className="text-2xl font-bold text-center">Atualizar Plano</h1>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email do usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none"
            >
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 transition py-3 rounded-lg font-bold"
          >
            {loading ? "Atualizando..." : "Atualizar Plano"}
          </button>
        </div>
      </main>
    </div>
  );
}
