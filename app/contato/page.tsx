"use client";

import { FaWhatsapp, FaCrown, FaInfinity, FaBolt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { NavMenu } from "@/components/common/navMenu";

export default function ContatoPage() {
  const router = useRouter();

  const phoneNumber = "5511987160499"; // Número do admin
  const message = encodeURIComponent("Olá! Quero assinar o plano PRO 🚀");

  const handleWhatsAppRedirect = () => {
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0d0d0d] to-[#121212] text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-[#111] border border-orange-500/10 rounded-2xl p-6 space-y-6 shadow-xl mb-15">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-orange-400 text-3xl animate-pulse">
            <FaCrown />
          </div>
          <h1 className="text-2xl font-bold text-orange-400">Plano PRO</h1>
          <p className="text-sm text-gray-400">
            Evolua mais rápido e sem limites 🚀
          </p>
        </div>

        {/* Preço */}
        <div className="bg-[#0f0f0f] border border-orange-500/10 rounded-xl p-4">
          <p className="text-xs text-gray-400">A partir de</p>
          <p className="text-3xl font-bold text-orange-400">R$ 19,90</p>
          <p className="text-xs text-gray-500">/mês</p>
        </div>

        {/* Benefícios */}
        <div className="space-y-3 text-sm">
          <Benefit icon={<FaInfinity />} text="Vidas ilimitadas" />
          <Benefit icon={<FaBolt />} text="XP acelerado" />
          <Benefit icon={<FaCrown />} text="Designer exclusivo" />
        </div>

        {/* Urgência */}
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs p-3 rounded-lg">
          🔥 Oferta limitada — fale agora e garanta seu acesso PRO
        </div>

        {/* CTA */}
        <button
          onClick={handleWhatsAppRedirect}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition px-4 py-3 rounded-xl font-bold text-white"
        >
          <FaWhatsapp />
          Assinar via WhatsApp
        </button>

        <p className="text-xs text-gray-500">
          Atendimento rápido direto com o suporte
        </p>

        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="text-xs text-orange-400 hover:underline"
        >
          Voltar
        </button>
      </div>
      <NavMenu />
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0f0f0f] border border-orange-500/10 rounded-lg px-3 py-2">
      <div className="text-orange-400">{icon}</div>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}
