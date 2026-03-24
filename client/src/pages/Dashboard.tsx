import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  MapPin, Users, Car, FileText, Bell, TrendingUp, TrendingDown,
  Clock, CheckCircle, AlertTriangle, Plus, Eye, Calendar,
  Euro, BarChart3, ArrowRight, Briefcase, UserCheck, Crown
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const GOLD = "#C9A84C";
const DARK = "#1a1a2e";

const monthlyCA = [
  { mois: "Oct", ca: 8200 },
  { mois: "Nov", ca: 11400 },
  { mois: "Dec", ca: 15800 },
  { mois: "Jan", ca: 9600 },
  { mois: "Fev", ca: 13200 },
  { mois: "Mar", ca: 17500 },
];

const vehicleTypes = [
  { name: "Berline", value: 45, color: "#C9A84C" },
  { name: "Van", value: 30, color: "#a07830" },
  { name: "SUV", value: 15, color: "#7a5820" },
  { name: "Minibus", value: 10, color: "#4a3410" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  // French statuses
  planifiee: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  terminee: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  annulee: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  en_attente: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  confirmee: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
  pending: "En attente",
  // French statuses
  planifiee: "Planifiée",
  a_confirmer: "À confirmer",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  chauffeur_assigne: "Chauffeur assigné",
  vehicule_assigne: "Véhicule assigné",
  prete: "Prête",
  en_cours: "En cours",
  client_pris_en_charge: "Client pris en charge",
  terminee: "Terminée",
  annulee: "Annulée",
  litige: "Litige",
  en_attente: "En attente",
};

export default function Dashboard() {
  const { t } = useLanguage();
  const statsQuery = trpc.dashboard.getStats.useQuery();
  const missionsQuery = trpc.missions.getAll.useQuery();
  const alertsQuery = trpc.alerts.getAll.useQuery();
  const quotesQuery = trpc.quotes.getAll.useQuery();

  const stats = statsQuery.data;
  const missions = missionsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];

  const todayMissions = missions.filter((m: any) => {
    if (!m.startDate) return false;
    const d = new Date(m.startDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const pendingQuotes = quotes.filter((q: any) => q.status === "pending" || q.status === "sent");
  const urgentAlerts = alerts.filter((a: any) => a.priority === "high" || a.priority === "urgent" || a.priority === "haute");

  const kpis = [
    {
      title: "Missions aujourd'hui",
      value: stats?.todayMissions ?? todayMissions.length,
      icon: MapPin,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      sub: `${missions.length} ce mois`,
      trend: "+12%", up: true, href: "/missions",
    },
    {
      title: "Dossiers en attente",
      value: stats?.pendingQuotes ?? pendingQuotes.length,
      icon: FileText,
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      sub: "Devis a traiter",
      trend: "+3", up: true, href: "/quotes",
    },
    {
      title: "Chauffeurs dispo",
      value: stats?.availableChauffeurs ?? 2,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      sub: `${stats?.availableChauffeurs ?? 3} au total`,
      trend: "Operationnel", up: true, href: "/chauffeurs",
    },
    {
      title: "CA du mois",
      value: "17 500 EUR",
      icon: TrendingUp,
      color: "from-[#C9A84C] to-[#a07830]",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-600 dark:text-yellow-400",
      sub: "vs 13 200 EUR le mois dernier",
      trend: "+32%", up: true, href: "/reporting",
    },
    {
      title: "Alertes urgentes",
      value: stats?.urgentAlerts ?? urgentAlerts.length,
      icon: Bell,
      color: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      sub: `${alerts.length} alertes totales`,
      trend: urgentAlerts.length > 0 ? "Action requise" : "Tout va bien",
      up: urgentAlerts.length === 0, href: "/alerts",
    },
    {
      title: "Clients actifs",
      value: 8,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      sub: "Clients enregistres",
      trend: "+2 ce mois", up: true, href: "/clients",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Crown className="h-6 w-6" style={{color: GOLD}} />
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/missions/new" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm text-[#1a1a2e]" style={{background: "linear-gradient(135deg, #C9A84C, #a07830)"}}>
              <Plus className="h-4 w-4" />
              Nouvelle mission
            </Link>
            <Link href="/quotes/new" className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/15 transition-all">
              <Briefcase className="h-4 w-4" />
              Nouveau dossier
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <Link key={kpi.title} href={kpi.href}>
              <div className={`${kpi.bg} rounded-xl p-4 border border-transparent hover:border-[#C9A84C]/30 transition-all cursor-pointer`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} shadow-sm`}>
                    <kpi.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.up ? "text-green-600" : "text-red-500"}`}>
                    {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${kpi.text} mb-0.5`}>{kpi.value}</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{kpi.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{kpi.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CA Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Chiffre d'affaires</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">6 derniers mois</p>
              </div>
              <Link href="/reporting" className="text-xs text-[#C9A84C] hover:underline flex items-center gap-1">
                Voir les stats <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyCA}>
                <defs>
                  <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v/1000 + "k"} />
                <Tooltip
                  contentStyle={{ background: DARK, border: "1px solid " + GOLD + "40", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(v: number) => [v.toLocaleString("fr-FR") + " EUR", "CA"]}
                />
                <Area type="monotone" dataKey="ca" stroke={GOLD} strokeWidth={2} fill="url(#caGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance */}
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Performance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Indicateurs cles</p>
            <div className="space-y-4">
              {[
                { label: "Satisfaction client", value: 98, color: "#34d399" },
                { label: "Missions a l'heure", value: 96, color: "#60a5fa" },
                { label: "Taux d'occupation", value: 82, color: GOLD },
                { label: "Devis acceptes", value: 74, color: "#a78bfa" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</span>
                    <span className="text-xs font-bold" style={{color: stat.color}}>{stat.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: stat.value + "%", background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Missions recentes */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{color: GOLD}} />
                Missions recentes
              </h2>
              <Link href="/missions" className="text-xs text-[#C9A84C] hover:underline flex items-center gap-1">
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {missions.slice(0, 5).map((m: any) => (
                <Link key={m.id} href={"/missions/" + m.id}>
                  <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background: "linear-gradient(135deg, #C9A84C, #a07830)"}}>
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {m.origin ?? m.pickupLocation ?? m.pickupAddress ?? "Prise en charge"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {m.destination ?? m.dropoffLocation ?? m.dropoffAddress ?? "Destination"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {m.date ? new Date(m.date).toLocaleDateString("fr-FR") : m.startDate ? new Date(m.startDate).toLocaleDateString("fr-FR") : "N/A"}
                        </span>
                      </div>
                    </div>
                    <span className={"px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 " + (statusColors[m.status] ?? statusColors.pending)}>
                      {statusLabels[m.status] ?? m.status}
                    </span>
                  </div>
                </Link>
              ))}
              {missions.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  <Car className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Aucune mission enregistree
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/10">
              <Link href="/missions/new" className="flex items-center justify-center gap-2 text-sm text-[#C9A84C] hover:underline font-medium">
                <Plus className="h-4 w-4" />
                Creer une nouvelle mission
              </Link>
            </div>
          </div>

          {/* Alertes + Dossiers */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-white/10">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Alertes urgentes
                </h2>
                <Link href="/alerts" className="text-xs text-[#C9A84C] hover:underline">Tout voir</Link>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {urgentAlerts.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{a.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{a.description ?? a.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {urgentAlerts.length === 0 && (
                  <div className="px-4 py-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Aucune alerte urgente</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-white/10">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Dossiers a relancer
                </h2>
                <Link href="/quotes" className="text-xs text-[#C9A84C] hover:underline">Tout voir</Link>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {pendingQuotes.slice(0, 3).map((q: any) => (
                  <Link key={q.id} href={"/quotes/" + q.id}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {q.clientName ?? "Dossier #" + q.id}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {q.totalAmount ? q.totalAmount + " EUR" : "Devis en attente"}
                        </p>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
                {pendingQuotes.length === 0 && (
                  <div className="px-4 py-4 text-center text-xs text-gray-500">
                    Aucun dossier en attente
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="rounded-xl p-5 border border-[#C9A84C]/20" style={{background: "linear-gradient(135deg, #1a1a2e, #16213e)"}}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" style={{color: GOLD}} />
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Nouvelle mission", href: "/missions/new", icon: MapPin, color: "from-blue-500 to-blue-600" },
              { label: "Nouveau dossier", href: "/quotes/new", icon: Briefcase, color: "from-amber-500 to-amber-600" },
              { label: "Nouveau client", href: "/clients/new", icon: Users, color: "from-purple-500 to-purple-600" },
              { label: "Nouveau chauffeur", href: "/chauffeurs/new", icon: UserCheck, color: "from-green-500 to-green-600" },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/15 transition-all cursor-pointer border border-white/10 hover:border-[#C9A84C]/30">
                  <div className={"p-2 rounded-lg bg-gradient-to-br " + action.color + " flex-shrink-0"}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white font-medium">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
