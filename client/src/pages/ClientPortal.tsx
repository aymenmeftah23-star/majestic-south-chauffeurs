import { useState } from "react";
import { useLocation } from "wouter";
import {
  Crown, Car, FileText, ClipboardList, User, LogOut,
  Plus, ChevronRight, Calendar, Star, Bell, Settings, MapPin,
  CheckCircle, Clock, XCircle, Phone, Navigation, AlertCircle,
  ChevronDown, ChevronUp
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const GOLD = "#d4af37";

// Correspondance statuts mission → label + couleur
const MISSION_STATUS: Record<string, { label: string; color: string; bg: string; step: number }> = {
  a_confirmer:           { label: "En attente de confirmation", color: "#f59e0b", bg: "#fef3c7", step: 1 },
  confirmee:             { label: "Confirmée",                  color: "#3b82f6", bg: "#dbeafe", step: 2 },
  en_preparation:        { label: "En préparation",             color: "#8b5cf6", bg: "#ede9fe", step: 3 },
  chauffeur_assigne:     { label: "Chauffeur assigné",          color: "#06b6d4", bg: "#cffafe", step: 4 },
  vehicule_assigne:      { label: "Véhicule assigné",           color: "#06b6d4", bg: "#cffafe", step: 4 },
  prete:                 { label: "Mission prête",              color: "#10b981", bg: "#d1fae5", step: 5 },
  en_cours:              { label: "En route",                   color: "#f97316", bg: "#ffedd5", step: 6 },
  client_pris_en_charge: { label: "Client à bord",             color: "#f97316", bg: "#ffedd5", step: 6 },
  terminee:              { label: "Mission terminée",           color: "#6b7280", bg: "#f3f4f6", step: 7 },
  annulee:               { label: "Annulée",                   color: "#ef4444", bg: "#fee2e2", step: 0 },
  litige:                { label: "Litige",                    color: "#ef4444", bg: "#fee2e2", step: 0 },
};

const QUOTE_STATUS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon",  color: "#6b7280" },
  envoye:    { label: "Envoyé",     color: "#3b82f6" },
  consulte:  { label: "Consulté",   color: "#8b5cf6" },
  accepte:   { label: "Accepté",    color: "#10b981" },
  refuse:    { label: "Refusé",     color: "#ef4444" },
  expire:    { label: "Expiré",     color: "#9ca3af" },
};

const DEMAND_STATUS: Record<string, { label: string; color: string }> = {
  nouvelle:      { label: "Nouvelle",        color: "#3b82f6" },
  a_traiter:     { label: "A traiter",       color: "#f59e0b" },
  devis_envoye:  { label: "Devis envoyé",    color: "#8b5cf6" },
  en_attente:    { label: "En attente",      color: "#f59e0b" },
  convertie:     { label: "Convertie",       color: "#10b981" },
  refusee:       { label: "Refusée",         color: "#ef4444" },
  annulee:       { label: "Annulée",         color: "#6b7280" },
};

type Tab = "overview" | "missions" | "quotes" | "demands" | "profile";

function formatDate(d: any) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(d: any) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Composant de suivi de mission avec timeline
function MissionTracker({ mission }: { mission: any }) {
  const sc = MISSION_STATUS[mission.status] ?? MISSION_STATUS.a_confirmer;
  const isActive = ["en_cours", "client_pris_en_charge", "prete", "chauffeur_assigne", "vehicule_assigne"].includes(mission.status);
  const isTerminee = mission.status === "terminee";
  const isAnnulee = ["annulee", "litige"].includes(mission.status);

  const steps = [
    { key: "a_confirmer",       label: "Demande reçue",     icon: CheckCircle },
    { key: "confirmee",         label: "Confirmée",          icon: CheckCircle },
    { key: "chauffeur_assigne", label: "Chauffeur assigné",  icon: User },
    { key: "en_cours",          label: "En route",           icon: Navigation },
    { key: "terminee",          label: "Arrivée",            icon: CheckCircle },
  ];

  const currentStep = sc.step;

  return (
    <div className="p-5 rounded-2xl border bg-[#111] hover:border-amber-700/40 transition-all"
      style={{ borderColor: isActive ? "#f97316/50" : isAnnulee ? "#ef444430" : "#1f1f1f" }}>
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ color: sc.color, background: sc.bg + "33", border: `1px solid ${sc.color}30` }}
            >
              {sc.label}
            </span>
            <span className="text-xs text-gray-500 font-mono">{mission.number || `#${mission.id}`}</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatDate(mission.date)} à {formatTime(mission.date)}
          </div>
        </div>
        {mission.price && (
          <div className="text-right shrink-0">
            <div className="text-lg font-bold" style={{ color: GOLD }}>
              {(mission.price / 100).toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">TTC</div>
          </div>
        )}
      </div>

      {/* Trajet */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Départ</div>
            <div className="text-sm text-gray-200">{mission.origin}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Arrivée</div>
            <div className="text-sm text-gray-200">{mission.destination}</div>
          </div>
        </div>
      </div>

      {/* Chauffeur assigné */}
      {mission.chauffeurName && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #a07830)` }}>
            {mission.chauffeurName.charAt(0)}
          </div>
          <div>
            <div className="text-xs text-gray-500">Votre chauffeur</div>
            <div className="text-sm font-semibold text-white">{mission.chauffeurName}</div>
          </div>
          {mission.vehicleName && (
            <div className="ml-auto text-right">
              <div className="text-xs text-gray-500">Véhicule</div>
              <div className="text-xs text-gray-300">{mission.vehicleName}</div>
            </div>
          )}
        </div>
      )}

      {/* Timeline de progression (uniquement si pas annulée) */}
      {!isAnnulee && (
        <div className="flex items-center gap-1">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const done = currentStep >= stepNum;
            const active = currentStep === stepNum;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: done ? GOLD : "#1f1f1f",
                      border: `2px solid ${done ? GOLD : "#374151"}`,
                    }}
                  >
                    {done && <CheckCircle className="w-3 h-3 text-black" />}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 text-center leading-tight max-w-[50px]">
                    {step.label}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="h-0.5 flex-1 mx-1 mb-3 transition-all"
                    style={{ background: currentStep > stepNum ? GOLD : "#374151" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ClientPortal() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showNewDemand, setShowNewDemand] = useState(false);
  const [demandForm, setDemandForm] = useState({
    origin: "",
    destination: "",
    date: "",
    time: "",
    passengers: "1",
    notes: "",
  });
  const [demandLoading, setDemandLoading] = useState(false);
  const [demandSuccess, setDemandSuccess] = useState(false);

  // Données depuis le serveur
  const { data: missionsData, refetch: refetchMissions } = trpc.missions.list.useQuery(undefined, {
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes pour le suivi temps réel
  });
  const { data: quotesData } = trpc.quotes.list.useQuery();
  const { data: demandsData } = trpc.demands.list.useQuery();
  const { data: clientsData } = trpc.clients.list.useQuery();

  const updateQuoteMutation = trpc.quotes.update.useMutation();
  const convertToMissionMutation = trpc.quotes.convertToMission.useMutation({
    onSuccess: () => {
      refetchMissions();
      setActiveTab("missions");
    },
  });

  const missionsList: any[] = Array.isArray(missionsData) ? missionsData : [];
  const quotesList: any[] = Array.isArray(quotesData) ? quotesData : [];
  const demandsList: any[] = Array.isArray(demandsData) ? demandsData : [];

  // Missions actives (en cours ou prochaines)
  const activeMissions = missionsList.filter(m =>
    !["terminee", "annulee", "litige"].includes(m.status)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastMissions = missionsList.filter(m =>
    ["terminee", "annulee"].includes(m.status)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { id: "overview" as Tab, label: "Accueil",   icon: Crown },
    { id: "missions" as Tab, label: "Missions",  icon: Car },
    { id: "quotes" as Tab,   label: "Devis",     icon: FileText },
    { id: "demands" as Tab,  label: "Demandes",  icon: ClipboardList },
    { id: "profile" as Tab,  label: "Profil",    icon: User },
  ];

  const handleAcceptQuote = async (quote: any) => {
    try {
      await updateQuoteMutation.mutateAsync({ id: quote.id, status: "accepte" });
      // Convertir automatiquement en mission
      await convertToMissionMutation.mutateAsync({ quoteId: quote.id });
    } catch (e) {
      console.error("Erreur lors de l'acceptation du devis:", e);
    }
  };

  const handleRefuseQuote = async (quote: any) => {
    try {
      await updateQuoteMutation.mutateAsync({ id: quote.id, status: "refuse" });
    } catch (e) {
      console.error("Erreur lors du refus du devis:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-amber-900/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Majestic South" className="h-9 w-9 object-contain" />
              <div>
                <div className="font-bold text-sm tracking-wide" style={{ color: GOLD }}>MAJESTIC SOUTH</div>
                <div className="text-xs text-gray-500">Espace Client</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeMissions.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "#f9731620", color: "#f97316", border: "1px solid #f9731630" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  {activeMissions.length} mission{activeMissions.length > 1 ? "s" : ""} active{activeMissions.length > 1 ? "s" : ""}
                </div>
              )}
              <button
                onClick={() => setLocation("/")}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
        <div className="flex gap-1 mb-8 bg-[#111] border border-amber-900/20 rounded-2xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id ? "text-black" : "text-gray-400 hover:text-gray-200"
              }`}
              style={activeTab === tab.id ? { background: `linear-gradient(135deg, ${GOLD}, #b8960c)` } : {}}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── ONGLET ACCUEIL ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Bannière de bienvenue */}
            <div className="p-6 rounded-2xl border border-amber-900/30 bg-gradient-to-r from-[#1a1400] to-[#0d0b07]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-xl"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}>
                  M
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Bienvenue dans votre espace</h1>
                  <p className="text-gray-400 text-sm">Majestic South Chauffeurs — Service premium</p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Missions",  value: missionsList.length,  icon: Car,           color: GOLD },
                { label: "Actives",   value: activeMissions.length, icon: Navigation,    color: "#f97316" },
                { label: "Devis",     value: quotesList.length,     icon: FileText,      color: "#60a5fa" },
                { label: "Demandes",  value: demandsList.length,    icon: ClipboardList, color: "#a78bfa" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl border border-amber-900/20 bg-[#111] text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Missions actives en cours */}
            {activeMissions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Missions en cours
                  </h2>
                  <button onClick={() => setActiveTab("missions")} className="text-sm flex items-center gap-1" style={{ color: GOLD }}>
                    Voir tout <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {activeMissions.slice(0, 2).map((m: any) => (
                    <MissionTracker key={m.id} mission={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => { setActiveTab("demands"); setShowNewDemand(true); }}
                  className="p-5 rounded-2xl border border-amber-700/50 bg-gradient-to-b from-[#1a1400] to-[#0d0b07] hover:border-amber-600 transition-all text-left"
                >
                  <Plus className="h-8 w-8 mb-3" style={{ color: GOLD }} />
                  <div className="font-semibold text-white">Nouvelle demande</div>
                  <div className="text-xs text-gray-400 mt-1">Réserver un trajet</div>
                </button>
                <button
                  onClick={() => setActiveTab("missions")}
                  className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/50 transition-all text-left"
                >
                  <Car className="h-8 w-8 mb-3 text-blue-400" />
                  <div className="font-semibold text-white">Mes missions</div>
                  <div className="text-xs text-gray-400 mt-1">Suivre mes trajets</div>
                </button>
                <button
                  onClick={() => setActiveTab("quotes")}
                  className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/50 transition-all text-left"
                >
                  <FileText className="h-8 w-8 mb-3 text-purple-400" />
                  <div className="font-semibold text-white">Mes devis</div>
                  <div className="text-xs text-gray-400 mt-1">Consulter et accepter</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET MISSIONS ── */}
        {activeTab === "missions" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Mes missions</h2>

            {missionsList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucune mission pour le moment</p>
                <button
                  onClick={() => { setActiveTab("demands"); setShowNewDemand(true); }}
                  className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium text-black"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}
                >
                  Faire une demande
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {activeMissions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      Missions actives et à venir
                    </h3>
                    <div className="space-y-3">
                      {activeMissions.map((m: any) => (
                        <MissionTracker key={m.id} mission={m} />
                      ))}
                    </div>
                  </div>
                )}

                {pastMissions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Historique
                    </h3>
                    <div className="space-y-3">
                      {pastMissions.map((m: any) => (
                        <MissionTracker key={m.id} mission={m} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET DEVIS ── */}
        {activeTab === "quotes" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Mes devis</h2>
            {quotesList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucun devis pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotesList.map((q: any) => {
                  const qs = QUOTE_STATUS[q.status] ?? QUOTE_STATUS.brouillon;
                  const canAct = q.status === "envoye" || q.status === "consulte";
                  return (
                    <div key={q.id} className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/40 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ color: qs.color, background: qs.color + "20", border: `1px solid ${qs.color}30` }}
                            >
                              {qs.label}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">Devis #{q.id}</span>
                          </div>
                          {(q.demandOrigin || q.demandDestination) && (
                            <div className="space-y-1 mb-2">
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                <span className="text-sm text-gray-300">{q.demandOrigin}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <span className="text-sm text-gray-300">{q.demandDestination}</span>
                              </div>
                            </div>
                          )}
                          {q.validUntil && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Valable jusqu&apos;au {new Date(q.validUntil).toLocaleDateString("fr-FR")}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {q.price && (
                            <div className="text-xl font-bold" style={{ color: GOLD }}>
                              {(q.price / 100).toFixed(2)} €
                            </div>
                          )}
                          {q.priceHT && (
                            <div className="text-xs text-gray-500">HT : {(q.priceHT / 100).toFixed(2)} €</div>
                          )}
                        </div>
                      </div>

                      {/* Boutons Accepter / Refuser */}
                      {canAct && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                          <button
                            onClick={() => handleAcceptQuote(q)}
                            disabled={convertToMissionMutation.isPending || updateQuoteMutation.isPending}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}
                          >
                            Accepter le devis
                          </button>
                          <button
                            onClick={() => handleRefuseQuote(q)}
                            disabled={updateQuoteMutation.isPending}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-red-700/50 text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-50"
                          >
                            Refuser
                          </button>
                        </div>
                      )}

                      {q.status === "accepte" && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Devis accepté — Mission créée automatiquement
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET DEMANDES ── */}
        {activeTab === "demands" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mes demandes</h2>
              <button
                onClick={() => setShowNewDemand(!showNewDemand)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}
              >
                <Plus className="h-4 w-4" />
                Nouvelle demande
              </button>
            </div>

            {/* Formulaire nouvelle demande */}
            {showNewDemand && (
              <div className="mb-6 p-6 rounded-2xl border border-amber-700/50 bg-gradient-to-b from-[#1a1400] to-[#0d0b07]">
                <h3 className="font-semibold text-white mb-4">Nouvelle demande de transport</h3>
                {demandSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                    <p className="text-white font-semibold">Demande envoyée avec succès !</p>
                    <p className="text-gray-400 text-sm mt-1">Notre équipe vous contactera rapidement avec un devis.</p>
                    <button
                      onClick={() => { setDemandSuccess(false); setShowNewDemand(false); }}
                      className="mt-4 px-6 py-2 rounded-xl text-sm font-medium text-black"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Adresse de départ *</label>
                        <input
                          type="text"
                          value={demandForm.origin}
                          onChange={(e) => setDemandForm({ ...demandForm, origin: e.target.value })}
                          placeholder="Adresse de prise en charge"
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Adresse d&apos;arrivée *</label>
                        <input
                          type="text"
                          value={demandForm.destination}
                          onChange={(e) => setDemandForm({ ...demandForm, destination: e.target.value })}
                          placeholder="Adresse de destination"
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Date *</label>
                        <input
                          type="date"
                          value={demandForm.date}
                          onChange={(e) => setDemandForm({ ...demandForm, date: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Heure *</label>
                        <input
                          type="time"
                          value={demandForm.time}
                          onChange={(e) => setDemandForm({ ...demandForm, time: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Passagers</label>
                        <select
                          value={demandForm.passengers}
                          onChange={(e) => setDemandForm({ ...demandForm, passengers: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n} passager{n > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Notes</label>
                        <input
                          type="text"
                          value={demandForm.notes}
                          onChange={(e) => setDemandForm({ ...demandForm, notes: e.target.value })}
                          placeholder="Bagages, exigences particulières..."
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setDemandSuccess(true)}
                        disabled={!demandForm.origin || !demandForm.destination || !demandForm.date}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-black disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}
                      >
                        Envoyer la demande
                      </button>
                      <button
                        onClick={() => setShowNewDemand(false)}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium border border-amber-900/30 text-gray-400 hover:text-white"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {demandsList.length === 0 && !showNewDemand ? (
              <div className="text-center py-16 text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucune demande pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandsList.map((d: any) => {
                  const ds = DEMAND_STATUS[d.status] ?? DEMAND_STATUS.nouvelle;
                  return (
                    <div key={d.id} className="p-5 rounded-2xl border border-amber-900/20 bg-[#111]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ color: ds.color, background: ds.color + "20", border: `1px solid ${ds.color}30` }}
                            >
                              {ds.label}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">#{d.id}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                              <span className="text-sm text-gray-300">{d.origin}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              <span className="text-sm text-gray-300">{d.destination}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {d.date ? new Date(d.date).toLocaleDateString("fr-FR") : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ONGLET PROFIL ── */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Mon profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-amber-900/20 bg-[#111]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" style={{ color: GOLD }} />
                  Informations personnelles
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Espace</div>
                    <div className="text-sm text-white">Majestic South Chauffeurs — Client</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Contact</div>
                    <div className="text-sm text-white">+33 6 95 61 89 98</div>
                  </div>
                </div>
                <button className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium border border-amber-700/50 text-amber-400 hover:bg-amber-900/20 transition-all">
                  Modifier mes informations
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-amber-900/20 bg-[#111]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" style={{ color: GOLD }} />
                  Préférences
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Notifications email", enabled: true },
                    { label: "Notifications SMS", enabled: true },
                    { label: "Newsletter", enabled: false },
                  ].map((pref) => (
                    <div key={pref.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{pref.label}</span>
                      <div
                        className="w-10 h-5 rounded-full"
                        style={pref.enabled ? { background: `linear-gradient(135deg, ${GOLD}, #b8960c)` } : { background: "#374151" }}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-all ${pref.enabled ? "translate-x-5" : ""}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLocation("/")}
                  className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium border border-red-700/50 text-red-400 hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
