import { useState } from "react";
import { toast } from 'sonner';
import { useLocation } from "wouter";
import {
  Crown, Car, FileText, ClipboardList, User, LogOut,
  Plus, ChevronRight, Calendar, Star, Bell, Settings, MapPin
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const DEMO_CLIENT = {
  name: "Jean Dupont",
  email: "jean.dupont@email.com",
  phone: "+33 6 12 34 56 78",
  company: "Dupont & Associés",
};

const statusColors: Record<string, string> = {
  pending: "text-amber-400 bg-amber-900/20 border-amber-700/30",
  confirmed: "text-blue-400 bg-blue-900/20 border-blue-700/30",
  in_progress: "text-purple-400 bg-purple-900/20 border-purple-700/30",
  completed: "text-green-400 bg-green-900/20 border-green-700/30",
  cancelled: "text-red-400 bg-red-900/20 border-red-700/30",
  draft: "text-gray-400 bg-gray-900/20 border-gray-700/30",
  sent: "text-blue-400 bg-blue-900/20 border-blue-700/30",
  accepted: "text-green-400 bg-green-900/20 border-green-700/30",
  rejected: "text-red-400 bg-red-900/20 border-red-700/30",
  confirmee: "text-green-400 bg-green-900/20 border-green-700/30",
  en_attente: "text-amber-400 bg-amber-900/20 border-amber-700/30",
  en_cours: "text-purple-400 bg-purple-900/20 border-purple-700/30",
  terminee: "text-gray-400 bg-gray-900/20 border-gray-700/30",
  annulee: "text-red-400 bg-red-900/20 border-red-700/30",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
  confirmee: "Confirmée",
  en_attente: "En attente",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

type Tab = "overview" | "missions" | "quotes" | "demands" | "profile";

export default function ClientPortal() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showNewDemand, setShowNewDemand] = useState(false);
  const [demandForm, setDemandForm] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    date: "",
    time: "",
    passengers: "1",
    notes: "",
  });

  const { data: missions } = trpc.missions.list.useQuery({});
  const { data: quotes } = trpc.quotes.list.useQuery({});
  const { data: demands } = trpc.demands.list.useQuery({});

  const missionsList = (missions as any)?.items || [];
  const quotesList = (quotes as any)?.items || [];
  const demandsList = (demands as any)?.items || [];

  const tabs = [
    { id: "overview" as Tab, label: "Accueil", icon: Crown },
    { id: "missions" as Tab, label: "Missions", icon: Car },
    { id: "quotes" as Tab, label: "Devis", icon: FileText },
    { id: "demands" as Tab, label: "Demandes", icon: ClipboardList },
    { id: "profile" as Tab, label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-amber-900/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Majestic South" className="h-9 w-9 object-contain" />
              <div>
                <div className="font-bold text-sm tracking-wide" style={{color: '#d4af37'}}>MAJESTIC SOUTH</div>
                <div className="text-xs text-gray-500">Espace Client</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-amber-400 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm" style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}>
                  {DEMO_CLIENT.name.charAt(0)}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block">{DEMO_CLIENT.name}</span>
              </div>
              <button
                onClick={() => setLocation("/")}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-[#111] border border-amber-900/20 rounded-2xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id ? "text-black" : "text-gray-400 hover:text-gray-200"
              }`}
              style={activeTab === tab.id ? {background: 'linear-gradient(135deg, #d4af37, #b8960c)'} : {}}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-amber-900/30 bg-gradient-to-r from-[#1a1400] to-[#0d0b07]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-xl" style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}>
                  {DEMO_CLIENT.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Bonjour, {DEMO_CLIENT.name.split(' ')[0]} !</h1>
                  <p className="text-gray-400 text-sm">Bienvenue dans votre espace Majestic South</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Missions", value: missionsList.length, icon: Car, color: "#d4af37" },
                { label: "Devis", value: quotesList.length, icon: FileText, color: "#60a5fa" },
                { label: "Demandes", value: demandsList.length, icon: ClipboardList, color: "#a78bfa" },
                { label: "Étoiles", value: "5.0", icon: Star, color: "#34d399" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl border border-amber-900/20 bg-[#111] text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2" style={{color: stat.color}} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => { setActiveTab("demands"); setShowNewDemand(true); }}
                  className="p-5 rounded-2xl border border-amber-700/50 bg-gradient-to-b from-[#1a1400] to-[#0d0b07] hover:border-amber-600 transition-all text-left"
                >
                  <Plus className="h-8 w-8 mb-3" style={{color: '#d4af37'}} />
                  <div className="font-semibold text-white">Nouvelle demande</div>
                  <div className="text-xs text-gray-400 mt-1">Réserver un trajet</div>
                </button>
                <button
                  onClick={() => setActiveTab("missions")}
                  className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/50 transition-all text-left"
                >
                  <Car className="h-8 w-8 mb-3 text-blue-400" />
                  <div className="font-semibold text-white">Mes missions</div>
                  <div className="text-xs text-gray-400 mt-1">Voir mes trajets</div>
                </button>
                <button
                  onClick={() => setActiveTab("quotes")}
                  className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/50 transition-all text-left"
                >
                  <FileText className="h-8 w-8 mb-3 text-purple-400" />
                  <div className="font-semibold text-white">Mes devis</div>
                  <div className="text-xs text-gray-400 mt-1">Consulter les devis</div>
                </button>
              </div>
            </div>

            {missionsList.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Missions récentes</h2>
                  <button onClick={() => setActiveTab("missions")} className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                    Voir tout <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {missionsList.slice(0, 3).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-amber-900/20 bg-[#111]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-amber-700/30" style={{background: '#1a1400'}}>
                        <Car className="h-5 w-5" style={{color: '#d4af37'}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{m.pickupAddress || m.origin} → {m.dropoffAddress || m.destination}</div>
                        <div className="text-xs text-gray-400">{m.date ? new Date(m.date).toLocaleDateString('fr-FR') : ''}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[m.status] || statusColors.pending}`}>
                        {statusLabels[m.status] || m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Missions Tab */}
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
                  style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}
                >
                  Faire une demande
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {missionsList.map((m: any) => (
                  <div key={m.id} className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/40 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[m.status] || statusColors.pending}`}>
                            {statusLabels[m.status] || m.status}
                          </span>
                          <span className="text-xs text-gray-500">#{m.id}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-300 mb-1">
                          <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{m.pickupAddress || m.origin}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-300 mb-3">
                          <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                          <span>{m.dropoffAddress || m.destination}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {m.date ? new Date(m.date).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                          {m.price && (
                            <span className="font-semibold" style={{color: '#d4af37'}}>{m.price} €</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quotes Tab */}
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
                {quotesList.map((q: any) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[q.status] || statusColors.draft}`}>
                            {statusLabels[q.status] || q.status}
                          </span>
                          <span className="text-xs text-gray-500">Devis #{q.id}</span>
                        </div>
                        <div className="text-sm text-gray-300">{q.description || "Trajet VTC"}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-FR') : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        {q.totalTTC && (
                          <div className="text-xl font-bold" style={{color: '#d4af37'}}>{q.totalTTC} €</div>
                        )}
                        {q.status === 'sent' && (
                          <div className="flex gap-2 mt-2">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-black" style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}>
                              Accepter
                            </button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-700/50 text-red-400 hover:bg-red-900/20">
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Demands Tab */}
        {activeTab === "demands" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mes demandes</h2>
              <button
                onClick={() => setShowNewDemand(!showNewDemand)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black"
                style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}
              >
                <Plus className="h-4 w-4" />
                Nouvelle demande
              </button>
            </div>

            {showNewDemand && (
              <div className="mb-6 p-6 rounded-2xl border border-amber-700/50 bg-gradient-to-b from-[#1a1400] to-[#0d0b07]">
                <h3 className="font-semibold text-white mb-4">Nouvelle demande de transport</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Adresse de départ *</label>
                    <input type="text" value={demandForm.pickupAddress} onChange={(e) => setDemandForm({...demandForm, pickupAddress: e.target.value})} placeholder="Adresse de prise en charge" className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Adresse d&apos;arrivée *</label>
                    <input type="text" value={demandForm.dropoffAddress} onChange={(e) => setDemandForm({...demandForm, dropoffAddress: e.target.value})} placeholder="Adresse de destination" className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Date *</label>
                    <input type="date" value={demandForm.date} onChange={(e) => setDemandForm({...demandForm, date: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Heure *</label>
                    <input type="time" value={demandForm.time} onChange={(e) => setDemandForm({...demandForm, time: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Passagers</label>
                    <select value={demandForm.passengers} onChange={(e) => setDemandForm({...demandForm, passengers: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600">
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Notes</label>
                    <input type="text" value={demandForm.notes} onChange={(e) => setDemandForm({...demandForm, notes: e.target.value})} placeholder="Bagages, exigences..." className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { toast.success("Demande envoyée ! Nous vous contacterons rapidement."); setShowNewDemand(false); }} className="px-6 py-2.5 rounded-xl text-sm font-medium text-black" style={{background: 'linear-gradient(135deg, #d4af37, #b8960c)'}}>
                    Envoyer la demande
                  </button>
                  <button onClick={() => setShowNewDemand(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium border border-amber-900/30 text-gray-400 hover:text-white">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {demandsList.length === 0 && !showNewDemand ? (
              <div className="text-center py-16 text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucune demande pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandsList.map((d: any) => (
                  <div key={d.id} className="p-5 rounded-2xl border border-amber-900/20 bg-[#111]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[d.status] || statusColors.pending}`}>
                            {statusLabels[d.status] || d.status}
                          </span>
                          <span className="text-xs text-gray-500">#{d.id}</span>
                        </div>
                        <div className="text-sm text-gray-300">{d.pickupAddress} → {d.dropoffAddress}</div>
                        <div className="text-xs text-gray-400 mt-1">{d.date ? new Date(d.date).toLocaleDateString('fr-FR') : ''}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Mon profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-amber-900/20 bg-[#111]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" style={{color: '#d4af37'}} />
                  Informations personnelles
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Nom complet", value: DEMO_CLIENT.name },
                    { label: "Email", value: DEMO_CLIENT.email },
                    { label: "Téléphone", value: DEMO_CLIENT.phone },
                    { label: "Société", value: DEMO_CLIENT.company },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-sm text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium border border-amber-700/50 text-amber-400 hover:bg-amber-900/20 transition-all">
                  Modifier mes informations
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-amber-900/20 bg-[#111]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" style={{color: '#d4af37'}} />
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
                      <div className={`w-10 h-5 rounded-full ${pref.enabled ? '' : 'bg-gray-700'}`}
                        style={pref.enabled ? {background: 'linear-gradient(135deg, #d4af37, #b8960c)'} : {}}>
                        <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-all ${pref.enabled ? 'translate-x-5' : ''}`} />
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
