import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Crown, Car, FileText, ClipboardList, User, LogOut,
  Plus, Calendar, Bell, Settings, MapPin,
  CheckCircle, Clock, XCircle, Phone, Navigation,
  ChevronDown, ChevronUp, Eye, EyeOff, ArrowLeft, Mail, Building
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const GOLD = "#d4af37";

const MISSION_STATUS: Record<string, { label: string; color: string; bg: string; step: number }> = {
  a_confirmer:           { label: "En attente de confirmation", color: "#f59e0b", bg: "#fef3c7", step: 1 },
  confirmee:             { label: "Confirmee",                  color: "#3b82f6", bg: "#dbeafe", step: 2 },
  en_preparation:        { label: "En preparation",             color: "#8b5cf6", bg: "#ede9fe", step: 3 },
  chauffeur_assigne:     { label: "Chauffeur assigne",          color: "#06b6d4", bg: "#cffafe", step: 4 },
  vehicule_assigne:      { label: "Vehicule assigne",           color: "#06b6d4", bg: "#cffafe", step: 4 },
  prete:                 { label: "Mission prete",              color: "#10b981", bg: "#d1fae5", step: 5 },
  en_cours:              { label: "En route",                   color: "#f97316", bg: "#ffedd5", step: 6 },
  client_pris_en_charge: { label: "Client a bord",              color: "#f97316", bg: "#ffedd5", step: 6 },
  terminee:              { label: "Mission terminee",            color: "#6b7280", bg: "#f3f4f6", step: 7 },
  annulee:               { label: "Annulee",                    color: "#ef4444", bg: "#fee2e2", step: 0 },
  litige:                { label: "Litige",                     color: "#ef4444", bg: "#fee2e2", step: 0 },
};

const QUOTE_STATUS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon",  color: "#6b7280" },
  envoye:    { label: "Envoye",     color: "#3b82f6" },
  consulte:  { label: "Consulte",   color: "#8b5cf6" },
  accepte:   { label: "Accepte",    color: "#10b981" },
  refuse:    { label: "Refuse",     color: "#ef4444" },
  expire:    { label: "Expire",     color: "#9ca3af" },
};

const DEMAND_STATUS: Record<string, { label: string; color: string }> = {
  nouvelle:      { label: "Nouvelle",        color: "#3b82f6" },
  a_traiter:     { label: "A traiter",       color: "#f59e0b" },
  devis_envoye:  { label: "Devis envoye",    color: "#8b5cf6" },
  en_attente:    { label: "En attente",      color: "#f59e0b" },
  convertie:     { label: "Convertie",       color: "#10b981" },
  refusee:       { label: "Refusee",         color: "#ef4444" },
  annulee:       { label: "Annulee",         color: "#6b7280" },
};

type Tab = "overview" | "missions" | "quotes" | "demands" | "profile";

function formatDate(d: any) {
  if (!d) return "--";
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(d: any) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Timeline de suivi de mission
function MissionTracker({ mission }: { mission: any }) {
  const sc = MISSION_STATUS[mission.status] ?? MISSION_STATUS.a_confirmer;
  const isAnnulee = ["annulee", "litige"].includes(mission.status);

  const steps = [
    { key: "a_confirmer",       label: "Demande recue",     icon: CheckCircle },
    { key: "confirmee",         label: "Confirmee",          icon: CheckCircle },
    { key: "chauffeur_assigne", label: "Chauffeur assigne",  icon: User },
    { key: "en_cours",          label: "En route",           icon: Navigation },
    { key: "terminee",          label: "Arrivee",            icon: CheckCircle },
  ];

  const currentStep = sc.step;

  return (
    <div className="p-5 rounded-2xl border border-amber-900/20 bg-[#111] hover:border-amber-700/40 transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ color: sc.color, background: sc.bg + "33", border: `1px solid ${sc.color}30` }}>
              {sc.label}
            </span>
            <span className="text-xs text-gray-500 font-mono">{mission.number || `#${mission.id}`}</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatDate(mission.date)} a {formatTime(mission.date)}
          </div>
        </div>
        {mission.price && (
          <div className="text-right shrink-0">
            <div className="text-lg font-bold" style={{ color: GOLD }}>
              {Number(mission.price).toFixed(2)} EUR
            </div>
            <div className="text-xs text-gray-500">TTC</div>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Depart</div>
            <div className="text-sm text-gray-200">{mission.origin}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
          <div>
            <div className="text-xs text-gray-500">Arrivee</div>
            <div className="text-sm text-gray-200">{mission.destination}</div>
          </div>
        </div>
      </div>

      {!isAnnulee && (
        <div className="flex items-center gap-1">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const done = currentStep >= stepNum;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{ background: done ? GOLD : "#1f1f1f", border: `2px solid ${done ? GOLD : "#374151"}` }}>
                    {done && <CheckCircle className="w-3 h-3 text-black" />}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 text-center leading-tight max-w-[50px]">
                    {step.label}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="h-0.5 flex-1 mx-1 mb-3 transition-all"
                    style={{ background: currentStep > stepNum ? GOLD : "#374151" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Page de login client
function ClientLogin({ onLogin }: { onLogin: (user: any, token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || "Email ou mot de passe incorrect");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, company, password, role: "client" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Auto-login apres inscription
        const loginRes = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.success) {
          onLogin(loginData.user, loginData.token);
        } else {
          setError("Compte cree. Veuillez vous connecter.");
          setMode("login");
        }
      } else {
        setError(data.message || "Erreur lors de la creation du compte");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(ellipse at 50% 50%, #d4af37 0%, transparent 60%)"}} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{background: "linear-gradient(135deg, #d4af37, #b8960c)"}}>
            <Crown className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Espace Client</h1>
          <p className="text-gray-400 text-sm mt-1">Majestic South Chauffeurs</p>
        </div>

        <div className="bg-[#111] border border-amber-900/30 rounded-3xl p-8">
          <div className="flex mb-6 bg-[#1a1a1a] rounded-xl p-1">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "text-black" : "text-gray-400"}`}
              style={mode === "login" ? {background: `linear-gradient(135deg, ${GOLD}, #b8960c)`} : {}}>
              Connexion
            </button>
            <button onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "text-black" : "text-gray-400"}`}
              style={mode === "register" ? {background: `linear-gradient(135deg, ${GOLD}, #b8960c)`} : {}}>
              Inscription
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Votre mot de passe"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm text-center">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{background: "linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)"}}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5">Prenom *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                    placeholder="Jean" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1.5">Nom *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required
                    placeholder="Dupont" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="votre@email.com" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">Telephone *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                  placeholder="+33 6 00 00 00 00" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">Societe (optionnel)</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Nom de votre societe" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">Mot de passe *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Minimum 8 caracteres" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">Confirmer *</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  placeholder="Retapez le mot de passe" className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600" />
              </div>
              {error && <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm text-center">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{background: "linear-gradient(135deg, #d4af37, #f5d56e, #b8960c)"}}>
                {loading ? "Creation..." : "Creer mon compte"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-400 hover:text-amber-400 text-sm flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour au site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard client principal
export default function ClientPortal() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [clientUser, setClientUser] = useState<any>(null);
  const [clientToken, setClientToken] = useState<string>("");
  const [showNewDemand, setShowNewDemand] = useState(false);
  const [demandForm, setDemandForm] = useState({
    origin: "", destination: "", date: "", time: "", passengers: "1", serviceType: "transfert", notes: "",
  });
  const [demandLoading, setDemandLoading] = useState(false);
  const [demandSuccess, setDemandSuccess] = useState(false);

  // Verifier si deja connecte
  useEffect(() => {
    const stored = localStorage.getItem("clientUser");
    const token = localStorage.getItem("clientToken");
    if (stored && token) {
      try {
        setClientUser(JSON.parse(stored));
        setClientToken(token);
      } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = (user: any, token: string) => {
    setClientUser(user);
    setClientToken(token);
    localStorage.setItem("clientUser", JSON.stringify(user));
    localStorage.setItem("clientToken", token);
  };

  const handleLogout = () => {
    setClientUser(null);
    setClientToken("");
    localStorage.removeItem("clientUser");
    localStorage.removeItem("clientToken");
  };

  // Si pas connecte, afficher le login
  if (!clientUser) {
    return <ClientLogin onLogin={handleLogin} />;
  }

  // Donnees depuis le serveur
  const { data: missionsData, refetch: refetchMissions } = trpc.missions.list.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: quotesData } = trpc.quotes.list.useQuery();
  const { data: demandsData } = trpc.demands.list.useQuery();

  const createDemandMutation = trpc.demands.create.useMutation({
    onSuccess: () => {
      setDemandSuccess(true);
      setDemandLoading(false);
    },
    onError: () => {
      setDemandLoading(false);
    },
  });

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
      await convertToMissionMutation.mutateAsync({ quoteId: quote.id });
    } catch { /* ignore */ }
  };

  const handleRefuseQuote = async (quote: any) => {
    try {
      await updateQuoteMutation.mutateAsync({ id: quote.id, status: "refuse" });
    } catch { /* ignore */ }
  };

  const handleSubmitDemand = async () => {
    if (!demandForm.origin || !demandForm.destination || !demandForm.date) return;
    setDemandLoading(true);
    try {
      const dateTime = demandForm.time
        ? `${demandForm.date}T${demandForm.time}:00`
        : `${demandForm.date}T09:00:00`;
      await createDemandMutation.mutateAsync({
        clientId: 1,
        origin: demandForm.origin,
        destination: demandForm.destination,
        date: dateTime,
        passengers: parseInt(demandForm.passengers),
        serviceType: demandForm.serviceType,
        notes: demandForm.notes || `Demande de ${clientUser.name} (${clientUser.email})`,
        status: "nouvelle",
      });
    } catch {
      setDemandLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-amber-900/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background: `linear-gradient(135deg, ${GOLD}, #b8960c)`}}>
              <Crown className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Majestic South</div>
              <div className="text-[10px] text-gray-500">Espace Client</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-white font-medium">{clientUser.name}</div>
              <div className="text-[10px] text-gray-500">{clientUser.email}</div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
              title="Se deconnecter">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation onglets */}
      <nav className="sticky top-[57px] z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-amber-900/10">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ACCUEIL */}
        {activeTab === "overview" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">
                Bonjour, {clientUser.name?.split(" ")[0] || "Client"}
              </h1>
              <p className="text-gray-400 text-sm">Bienvenue dans votre espace personnel</p>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Missions actives", value: activeMissions.length, color: "#f97316" },
                { label: "Missions terminees", value: pastMissions.length, color: "#10b981" },
                { label: "Devis en attente", value: quotesList.filter(q => ["envoye", "consulte"].includes(q.status)).length, color: "#3b82f6" },
                { label: "Demandes", value: demandsList.length, color: "#8b5cf6" },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-2xl border border-amber-900/20 bg-[#111]">
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Missions actives */}
            {activeMissions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Navigation className="h-5 w-5" style={{ color: GOLD }} />
                  Missions en cours
                </h2>
                <div className="space-y-4">
                  {activeMissions.slice(0, 3).map((m: any) => (
                    <MissionTracker key={m.id} mission={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Bouton nouvelle demande */}
            <div className="p-6 rounded-2xl border border-amber-700/50 bg-gradient-to-r from-[#1a1400] to-[#111]">
              <h3 className="text-lg font-bold text-white mb-2">Besoin d'un chauffeur ?</h3>
              <p className="text-gray-400 text-sm mb-4">Faites une demande de transport et recevez un devis personnalise rapidement.</p>
              <button onClick={() => { setActiveTab("demands"); setShowNewDemand(true); }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black"
                style={{background: `linear-gradient(135deg, ${GOLD}, #b8960c)`}}>
                <Plus className="h-4 w-4 inline mr-2" />
                Nouvelle demande
              </button>
            </div>
          </div>
        )}

        {/* MISSIONS */}
        {activeTab === "missions" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Mes missions</h2>
            {activeMissions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-amber-400 mb-3 uppercase tracking-wider">En cours</h3>
                <div className="space-y-4">
                  {activeMissions.map((m: any) => <MissionTracker key={m.id} mission={m} />)}
                </div>
              </div>
            )}
            {pastMissions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Historique</h3>
                <div className="space-y-4">
                  {pastMissions.map((m: any) => <MissionTracker key={m.id} mission={m} />)}
                </div>
              </div>
            )}
            {missionsList.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucune mission pour le moment</p>
              </div>
            )}
          </div>
        )}

        {/* DEVIS */}
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
                  return (
                    <div key={q.id} className="p-5 rounded-2xl border border-amber-900/20 bg-[#111]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ color: qs.color, background: qs.color + "20", border: `1px solid ${qs.color}30` }}>
                              {qs.label}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">{q.number || `#${q.id}`}</span>
                          </div>
                        </div>
                        {q.totalTTC && (
                          <div className="text-lg font-bold" style={{ color: GOLD }}>
                            {Number(q.totalTTC).toFixed(2)} EUR
                          </div>
                        )}
                      </div>

                      {q.validUntil && (
                        <div className="text-xs text-gray-500 mb-3">
                          Valide jusqu'au {new Date(q.validUntil).toLocaleDateString("fr-FR")}
                        </div>
                      )}

                      {["envoye", "consulte"].includes(q.status) && (
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleAcceptQuote(q)}
                            disabled={convertToMissionMutation.isPending || updateQuoteMutation.isPending}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}>
                            Accepter le devis
                          </button>
                          <button onClick={() => handleRefuseQuote(q)}
                            disabled={updateQuoteMutation.isPending}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-red-700/50 text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-50">
                            Refuser
                          </button>
                        </div>
                      )}

                      {q.status === "accepte" && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Devis accepte -- Mission creee automatiquement
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DEMANDES */}
        {activeTab === "demands" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mes demandes</h2>
              <button onClick={() => { setShowNewDemand(!showNewDemand); setDemandSuccess(false); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-black"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}>
                <Plus className="h-4 w-4" />
                Nouvelle demande
              </button>
            </div>

            {showNewDemand && (
              <div className="mb-6 p-6 rounded-2xl border border-amber-700/50 bg-gradient-to-b from-[#1a1400] to-[#0d0b07]">
                <h3 className="font-semibold text-white mb-4">Nouvelle demande de transport</h3>
                {demandSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
                    <p className="text-white font-semibold">Demande envoyee avec succes</p>
                    <p className="text-gray-400 text-sm mt-1">Notre equipe vous contactera rapidement avec un devis.</p>
                    <button onClick={() => { setDemandSuccess(false); setShowNewDemand(false); setDemandForm({ origin: "", destination: "", date: "", time: "", passengers: "1", serviceType: "transfert", notes: "" }); }}
                      className="mt-4 px-6 py-2 rounded-xl text-sm font-medium text-black"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}>
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Adresse de depart *</label>
                        <input type="text" value={demandForm.origin}
                          onChange={e => setDemandForm({ ...demandForm, origin: e.target.value })}
                          placeholder="Adresse de prise en charge"
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Adresse d'arrivee *</label>
                        <input type="text" value={demandForm.destination}
                          onChange={e => setDemandForm({ ...demandForm, destination: e.target.value })}
                          placeholder="Adresse de destination"
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Date *</label>
                        <input type="date" value={demandForm.date}
                          onChange={e => setDemandForm({ ...demandForm, date: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Heure *</label>
                        <input type="time" value={demandForm.time}
                          onChange={e => setDemandForm({ ...demandForm, time: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Type de service</label>
                        <select value={demandForm.serviceType}
                          onChange={e => setDemandForm({ ...demandForm, serviceType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600">
                          <option value="transfert">Transfert</option>
                          <option value="mise_a_disposition">Mise a disposition</option>
                          <option value="longue_distance">Longue distance</option>
                          <option value="evenement">Evenement</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Passagers</label>
                        <select value={demandForm.passengers}
                          onChange={e => setDemandForm({ ...demandForm, passengers: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white focus:outline-none focus:border-amber-600">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n} passager{n > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-gray-300 mb-2">Notes / Informations complementaires</label>
                      <textarea value={demandForm.notes}
                        onChange={e => setDemandForm({ ...demandForm, notes: e.target.value })}
                        placeholder="Bagages, exigences particulieres, numero de vol..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 resize-none" />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSubmitDemand}
                        disabled={!demandForm.origin || !demandForm.destination || !demandForm.date || demandLoading}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-black disabled:opacity-50"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}>
                        {demandLoading ? "Envoi en cours..." : "Envoyer la demande"}
                      </button>
                      <button onClick={() => setShowNewDemand(false)}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium border border-amber-900/30 text-gray-400 hover:text-white">
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
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ color: ds.color, background: ds.color + "20", border: `1px solid ${ds.color}30` }}>
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

        {/* PROFIL */}
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
                    <div className="text-xs text-gray-500 mb-1">Nom complet</div>
                    <div className="text-sm text-white">{clientUser.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="text-sm text-white">{clientUser.email}</div>
                  </div>
                  {clientUser.phone && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Telephone</div>
                      <div className="text-sm text-white">{clientUser.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Role</div>
                    <div className="text-sm text-white capitalize">{clientUser.role}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Membre depuis</div>
                    <div className="text-sm text-white">
                      {clientUser.createdAt ? new Date(clientUser.createdAt).toLocaleDateString("fr-FR") : "--"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-amber-900/20 bg-[#111]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" style={{ color: GOLD }} />
                  Actions
                </h3>
                <div className="space-y-3">
                  <button onClick={() => { setActiveTab("demands"); setShowNewDemand(true); }}
                    className="w-full py-3 rounded-xl text-sm font-medium text-black"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #b8960c)` }}>
                    <Plus className="h-4 w-4 inline mr-2" />
                    Nouvelle demande de transport
                  </button>
                  <a href="tel:+33695618998"
                    className="w-full py-3 rounded-xl text-sm font-medium border border-amber-700/50 text-amber-400 hover:bg-amber-900/20 transition-all flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    Appeler : +33 6 95 61 89 98
                  </a>
                  <a href="mailto:contact@mschauffeur.fr"
                    className="w-full py-3 rounded-xl text-sm font-medium border border-amber-900/30 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    contact@mschauffeur.fr
                  </a>
                  <button onClick={handleLogout}
                    className="w-full py-3 rounded-xl text-sm font-medium border border-red-700/50 text-red-400 hover:bg-red-900/20 transition-all flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Se deconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
