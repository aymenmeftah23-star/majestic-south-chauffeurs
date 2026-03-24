import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  MapPin, Clock, User, Phone, Car, CheckCircle, XCircle,
  Navigation, ChevronRight, LogOut, Calendar, AlertTriangle,
  ArrowRight, Briefcase, Users
} from "lucide-react";
import { useLocation } from "wouter";

const GOLD = "#C9A84C";
const DARK = "#0a0a0a";

// Statuts de mission avec labels et couleurs
const MISSION_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  a_confirmer:        { label: "A confirmer",       color: "#f59e0b", bg: "#fef3c7" },
  confirmee:          { label: "Confirmee",          color: "#3b82f6", bg: "#dbeafe" },
  en_preparation:     { label: "En preparation",     color: "#8b5cf6", bg: "#ede9fe" },
  chauffeur_assigne:  { label: "Assigne",            color: "#06b6d4", bg: "#cffafe" },
  vehicule_assigne:   { label: "Vehicule assigne",   color: "#06b6d4", bg: "#cffafe" },
  prete:              { label: "Prete",              color: "#10b981", bg: "#d1fae5" },
  en_cours:           { label: "En cours",           color: "#f97316", bg: "#ffedd5" },
  client_pris_en_charge: { label: "Client a bord",  color: "#f97316", bg: "#ffedd5" },
  terminee:           { label: "Terminee",           color: "#6b7280", bg: "#f3f4f6" },
  annulee:            { label: "Annulee",            color: "#ef4444", bg: "#fee2e2" },
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function isToday(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  const date = new Date(d);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isTomorrow(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  const date = new Date(d);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

export default function DriverPortal() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "history">("today");
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const { data: missionsData, isLoading } = trpc.missions.list.useQuery();
  const updateMissionMutation = trpc.missions.update.useMutation({
    onSuccess: () => setSelectedMission(null),
  });

  const allMissions: any[] = missionsData ?? [];

  // Filtrer les missions selon l'onglet
  const todayMissions = allMissions.filter(m => isToday(m.date));
  const upcomingMissions = allMissions.filter(m => {
    const d = new Date(m.date);
    const now = new Date();
    return d > now && !isToday(m.date) && !["terminee", "annulee"].includes(m.status);
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const historyMissions = allMissions.filter(m =>
    ["terminee", "annulee"].includes(m.status)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

  const displayedMissions = activeTab === "today" ? todayMissions
    : activeTab === "upcoming" ? upcomingMissions
    : historyMissions;

  const handleStatusChange = (missionId: number, newStatus: string) => {
    updateMissionMutation.mutate({ id: missionId, status: newStatus });
  };

  return (
    <div className="min-h-screen" style={{ background: DARK }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Majestic South" className="h-8 w-8 object-contain" />
            <div>
              <div className="font-bold text-xs tracking-widest" style={{ color: GOLD }}>MAJESTIC SOUTH</div>
              <div className="text-xs text-gray-500">Espace Chauffeur</div>
            </div>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Quitter</span>
          </button>
        </div>
      </header>

      {/* Statistiques rapides */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold" style={{ color: GOLD }}>{todayMissions.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Aujourd'hui</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{upcomingMissions.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">A venir</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">
              {allMissions.filter(m => m.status === "en_cours").length}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">En cours</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-4">
          {[
            { key: "today", label: "Aujourd'hui" },
            { key: "upcoming", label: "A venir" },
            { key: "history", label: "Historique" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={"flex-1 py-2 text-xs font-medium rounded-lg transition-all " +
                (activeTab === tab.key
                  ? "text-[#1a1a2e] font-semibold"
                  : "text-gray-400 hover:text-white")}
              style={activeTab === tab.key ? { background: "linear-gradient(135deg, #C9A84C, #a07830)" } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liste des missions */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : displayedMissions.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">
              {activeTab === "today" ? "Aucune mission aujourd'hui"
               : activeTab === "upcoming" ? "Aucune mission a venir"
               : "Aucun historique"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedMissions.map((m: any) => {
              const sc = MISSION_STATUS[m.status] ?? MISSION_STATUS.a_confirmer;
              const isActive = m.status === "en_cours" || m.status === "client_pris_en_charge";
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMission(m)}
                  className={"w-full text-left rounded-xl border p-4 transition-all " +
                    (isActive
                      ? "border-amber-500/50 bg-amber-900/10"
                      : "border-white/10 bg-white/5 hover:border-white/20")}
                >
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono text-gray-500">{m.number}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3" style={{ color: GOLD }} />
                        <span className="text-sm font-bold text-white">{formatTime(m.date)}</span>
                        <span className="text-xs text-gray-400">
                          {isToday(m.date) ? "Aujourd'hui"
                           : isTomorrow(m.date) ? "Demain"
                           : formatDate(m.date)}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: sc.color, background: sc.bg + "33" }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* Trajet */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-gray-300 leading-relaxed">{m.origin}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-gray-300 leading-relaxed">{m.destination}</span>
                    </div>
                  </div>

                  {/* Infos client */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {m.passengers ?? 1} pax
                      </span>
                      {m.price && (
                        <span className="font-medium" style={{ color: GOLD }}>
                          {(m.price / 100).toFixed(0)} EUR
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal détail mission */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-t-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto">
            {/* En-tête modal */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-gray-500">{selectedMission.number}</span>
                <h2 className="text-base font-bold text-white mt-0.5">Detail de la mission</h2>
              </div>
              <button
                onClick={() => setSelectedMission(null)}
                className="p-2 text-gray-400 hover:text-white bg-white/10 rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            {/* Statut actuel */}
            {(() => {
              const sc = MISSION_STATUS[selectedMission.status] ?? MISSION_STATUS.a_confirmer;
              return (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border border-white/10 bg-white/5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.color }} />
                  <span className="text-sm font-medium text-white">{sc.label}</span>
                </div>
              );
            })()}

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">Date</div>
                <div className="text-sm font-semibold text-white">{formatDate(selectedMission.date)}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">Heure</div>
                <div className="text-xl font-bold" style={{ color: GOLD }}>{formatTime(selectedMission.date)}</div>
              </div>
            </div>

            {/* Trajet */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400">Depart</div>
                  <div className="text-sm text-white font-medium">{selectedMission.origin}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400">Arrivee</div>
                  <div className="text-sm text-white font-medium">{selectedMission.destination}</div>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">Passagers</div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm font-semibold text-white">{selectedMission.passengers ?? 1}</span>
                </div>
              </div>
              {selectedMission.price && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">Tarif</div>
                  <div className="text-sm font-bold" style={{ color: GOLD }}>
                    {(selectedMission.price / 100).toFixed(2)} EUR
                  </div>
                </div>
              )}
            </div>

            {/* Notes / instructions */}
            {(selectedMission.notes || selectedMission.specialInstructions) && (
              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl mb-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Instructions</span>
                </div>
                {selectedMission.notes && (
                  <p className="text-xs text-gray-300">{selectedMission.notes}</p>
                )}
                {selectedMission.specialInstructions && (
                  <p className="text-xs text-gray-300 mt-1">{selectedMission.specialInstructions}</p>
                )}
              </div>
            )}

            {/* Actions selon le statut */}
            <div className="space-y-2">
              {["chauffeur_assigne", "vehicule_assigne", "prete", "confirmee"].includes(selectedMission.status) && (
                <button
                  onClick={() => handleStatusChange(selectedMission.id, "en_cours")}
                  disabled={updateMissionMutation.isPending}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-[#1a1a2e] transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Demarrer la mission
                  </div>
                </button>
              )}
              {selectedMission.status === "en_cours" && (
                <button
                  onClick={() => handleStatusChange(selectedMission.id, "client_pris_en_charge")}
                  disabled={updateMissionMutation.isPending}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 bg-orange-600 hover:bg-orange-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    Client pris en charge
                  </div>
                </button>
              )}
              {["en_cours", "client_pris_en_charge"].includes(selectedMission.status) && (
                <button
                  onClick={() => handleStatusChange(selectedMission.id, "terminee")}
                  disabled={updateMissionMutation.isPending}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 bg-green-700 hover:bg-green-600"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Terminer la mission
                  </div>
                </button>
              )}
              {!["terminee", "annulee", "en_cours", "client_pris_en_charge"].includes(selectedMission.status) && (
                <button
                  onClick={() => handleStatusChange(selectedMission.id, "annulee")}
                  disabled={updateMissionMutation.isPending}
                  className="w-full py-3 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-900/20 transition-all disabled:opacity-50"
                >
                  Signaler un probleme / Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
