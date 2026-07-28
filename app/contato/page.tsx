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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-6 mb-15">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-brand text-3xl">
            <FaCrown />
          </div>
          <h1 className="text-2xl font-bold text-brand">Plano PRO</h1>
          <p className="text-sm text-muted-foreground">
            Evolua mais rápido e sem limites 🚀
          </p>
        </div>

        {/* Preço */}
        <div className="bg-muted rounded-xl p-4">
          <p className="text-xs text-muted-foreground">A partir de</p>
          <p className="text-3xl font-bold text-brand">R$ 19,90</p>
          <p className="text-xs text-muted-foreground">/mês</p>
        </div>

        {/* Benefícios */}
        <div className="space-y-3 text-sm">
          <Benefit icon={<FaInfinity />} text="Vidas ilimitadas" />
          <Benefit icon={<FaBolt />} text="XP acelerado" />
          <Benefit icon={<FaCrown />} text="Designer exclusivo" />
        </div>

        {/* Urgência */}
        <div className="bg-brand/10 border border-brand/30 text-brand text-xs p-3 rounded-lg">
          🔥 Oferta limitada — fale agora e garanta seu acesso PRO
        </div>

        {/* CTA */}
        <button
          onClick={handleWhatsAppRedirect}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition px-4 py-3 rounded-xl font-bold text-white"
        >
          <FaWhatsapp />
          Assinar via WhatsApp
        </button>

        <p className="text-xs text-muted-foreground">
          Atendimento rápido direto com o suporte
        </p>

        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="text-xs text-brand hover:underline"
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
    <div className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2">
      <div className="text-brand">{icon}</div>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
