"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

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
        console.log("ADMIN CHECK:", data);

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
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  //  loading da sessão
  if (isPending || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  // bloqueado
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#05070F] text-white flex items-center justify-center">
      <div className="bg-white/5 p-6 rounded-2xl w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center">Admin Panel</h1>

        <input
          type="email"
          placeholder="Email do usuário"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-black/50 border border-white/10"
        />

        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full p-2 rounded bg-black/50 border border-white/10"
        >
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
        </select>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-green-500 py-2 rounded-lg font-bold"
        >
          {loading ? "Atualizando..." : "Atualizar Plano"}
        </button>
      </div>
    </div>
  );
}
