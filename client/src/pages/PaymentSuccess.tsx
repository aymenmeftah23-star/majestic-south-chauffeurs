import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Download } from "lucide-react";

const GOLD = "#C9A84C";
const DARK = "#0a0a0a";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: DARK }}>
      <div className="text-center max-w-md mx-auto px-4">
        {/* Icône de succès */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Paiement confirme</h1>
        <p className="text-gray-400 mb-2">
          Votre paiement a ete traite avec succes.
        </p>
        <p className="text-gray-400 mb-8">
          Un email de confirmation vous a ete envoye. Notre equipe vous contactera
          pour confirmer les details de votre mission.
        </p>

        {sessionId && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs text-gray-400 mb-1">Reference de paiement</div>
            <div className="text-xs font-mono text-gray-300 break-all">{sessionId}</div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setLocation("/booking")}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-[#1a1a2e] transition-all"
            style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}
          >
            <div className="flex items-center justify-center gap-2">
              Nouvelle reservation
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
          <button
            onClick={() => setLocation("/")}
            className="w-full py-3 rounded-xl text-sm font-medium text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
          >
            Retour a l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
