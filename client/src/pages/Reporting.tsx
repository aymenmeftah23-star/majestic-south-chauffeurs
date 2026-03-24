import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Download, TrendingUp, Users, Euro, Car, Calendar, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const GOLD = "#C9A84C";
const COLORS = ["#C9A84C", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const MONTHS_FR = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const TYPE_LABELS: Record<string, string> = {
  airport: 'Aeroport', business: 'Affaires', event: 'Evenement',
  tour: 'Tourisme', disposal: 'Mise a dispo', intercity: 'Inter-villes',
  hotel: 'Hotel', cruise: 'Croisiere', train: 'Gare', other: 'Autre',
};

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10">
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{title}</div>
      {sub && <div className="text-xs mt-1" style={{ color }}>{sub}</div>}
    </div>
  );
}

export default function Reporting() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('year');

  const { data: missionsData, isLoading: loadingMissions } = trpc.missions.list.useQuery();
  const { data: clientsData, isLoading: loadingClients } = trpc.clients.getAll.useQuery();
  const { data: chauffeursData, isLoading: loadingChauffeurs } = trpc.chauffeurs.getAll.useQuery();

  const isLoading = loadingMissions || loadingClients || loadingChauffeurs;

  const missions: any[] = missionsData ?? [];
  const clients: any[] = clientsData ?? [];
  const chauffeurs: any[] = chauffeursData ?? [];

  // ── Filtrage par période ──────────────────────────────────────────────────
  const filteredMissions = useMemo(() => {
    const now = new Date();
    return missions.filter(m => {
      const d = new Date(m.date);
      if (dateRange === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (dateRange === 'quarter') {
        const q = Math.floor(now.getMonth() / 3);
        return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
      } else {
        return d.getFullYear() === now.getFullYear();
      }
    });
  }, [missions, dateRange]);

  // ── CA mensuel ────────────────────────────────────────────────────────────
  const monthlyRevenue = useMemo(() => {
    const map: Record<number, { missions: number; revenue: number }> = {};
    for (let i = 0; i < 12; i++) map[i] = { missions: 0, revenue: 0 };
    missions.forEach(m => {
      const month = new Date(m.date).getMonth();
      map[month].missions += 1;
      map[month].revenue += (m.price || 0) / 100;
    });
    return Object.entries(map).map(([i, v]) => ({
      month: MONTHS_FR[parseInt(i)],
      missions: v.missions,
      revenue: Math.round(v.revenue),
    }));
  }, [missions]);

  // ── Répartition par type ──────────────────────────────────────────────────
  const missionTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMissions.forEach(m => {
      const type = m.type || 'other';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map)
      .map(([type, count]) => ({ name: TYPE_LABELS[type] || type, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMissions]);

  // ── Performance chauffeurs ────────────────────────────────────────────────
  const chauffeurPerf = useMemo(() => {
    return chauffeurs.map(ch => {
      const chMissions = filteredMissions.filter(m => m.chauffeurId === ch.id);
      const completed = chMissions.filter(m => m.status === 'terminee').length;
      const revenue = chMissions.reduce((s, m) => s + (m.price || 0) / 100, 0);
      return {
        name: ch.name?.split(' ')[0] || `Chauffeur ${ch.id}`,
        missions: chMissions.length,
        completed,
        revenue: Math.round(revenue),
      };
    }).filter(c => c.missions > 0).sort((a, b) => b.missions - a.missions);
  }, [chauffeurs, filteredMissions]);

  // ── Taux d'occupation des véhicules ──────────────────────────────────────
  const vehicleOccupancy = useMemo(() => {
    const map: Record<number, number> = {};
    filteredMissions.forEach(m => {
      if (m.vehicleId) map[m.vehicleId] = (map[m.vehicleId] || 0) + 1;
    });
    const total = filteredMissions.length || 1;
    return Object.entries(map).map(([id, count]) => ({
      id: parseInt(id),
      count,
      pct: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [filteredMissions]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevenue = filteredMissions.reduce((s, m) => s + (m.price || 0) / 100, 0);
  const completedMissions = filteredMissions.filter(m => m.status === 'terminee').length;
  const completionRate = filteredMissions.length > 0
    ? Math.round((completedMissions / filteredMissions.length) * 100)
    : 0;
  const avgPrice = completedMissions > 0
    ? Math.round(filteredMissions.filter(m => m.status === 'terminee').reduce((s, m) => s + (m.price || 0) / 100, 0) / completedMissions)
    : 0;

  const periodLabel = dateRange === 'month' ? 'ce mois' : dateRange === 'quarter' ? 'ce trimestre' : 'cette annee';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques & Reporting</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyse des performances et du chiffre d'affaires
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filtre période */}
            <div className="flex gap-1 bg-gray-100 dark:bg-white/10 rounded-lg p-1">
              {[
                { key: 'month', label: 'Mois' },
                { key: 'quarter', label: 'Trimestre' },
                { key: 'year', label: 'Annee' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setDateRange(opt.key as any)}
                  className={"px-3 py-1.5 text-xs font-medium rounded-md transition-all " +
                    (dateRange === opt.key
                      ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <a
              href="/api/calendar/all.ics"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <Calendar className="h-3.5 w-3.5" />
              Export iCal
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={`Missions ${periodLabel}`}
                value={filteredMissions.length}
                sub={`${completedMissions} terminees`}
                icon={BarChart2}
                color="#3b82f6"
              />
              <StatCard
                title={`CA ${periodLabel}`}
                value={`${totalRevenue.toLocaleString('fr-FR')} EUR`}
                sub={`Moy. ${avgPrice} EUR/mission`}
                icon={Euro}
                color="#10b981"
              />
              <StatCard
                title="Taux de completion"
                value={`${completionRate}%`}
                sub={`${filteredMissions.filter(m => m.status === 'annulee').length} annulees`}
                icon={CheckCircle}
                color={GOLD}
              />
              <StatCard
                title="Clients actifs"
                value={clients.length}
                sub={`${chauffeurs.length} chauffeurs`}
                icon={Users}
                color="#8b5cf6"
              />
            </div>

            {/* Graphique CA mensuel */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Chiffre d'affaires mensuel (annee en cours)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `${value} EUR` : value,
                      name === 'revenue' ? 'CA (EUR)' : 'Missions',
                    ]}
                  />
                  <Legend formatter={(v) => v === 'revenue' ? 'CA (EUR)' : 'Missions'} />
                  <Bar dataKey="revenue" fill={GOLD} name="revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missions" fill="#3b82f6" name="missions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition types + Performance chauffeurs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Types de missions */}
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Repartition par type de mission
                </h2>
                {missionTypeData.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">Aucune donnee</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={missionTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {missionTypeData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Performance chauffeurs */}
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Performance par chauffeur
                </h2>
                {chauffeurPerf.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">Aucune donnee</div>
                ) : (
                  <div className="space-y-3">
                    {chauffeurPerf.map((ch, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}>
                          {ch.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-900 dark:text-white truncate">{ch.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                              {ch.missions} missions
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${chauffeurPerf[0].missions > 0 ? (ch.missions / chauffeurPerf[0].missions) * 100 : 0}%`,
                                background: COLORS[i % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0 w-16 text-right">
                          {ch.revenue} EUR
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tableau récapitulatif */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Recapitulatif {periodLabel}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total missions', value: filteredMissions.length },
                  { label: 'Missions terminees', value: completedMissions },
                  { label: 'Missions annulees', value: filteredMissions.filter(m => m.status === 'annulee').length },
                  { label: 'En cours', value: filteredMissions.filter(m => m.status === 'en_cours').length },
                  { label: 'CA total', value: `${Math.round(totalRevenue).toLocaleString('fr-FR')} EUR` },
                  { label: 'Prix moyen', value: `${avgPrice} EUR` },
                  { label: 'Taux de completion', value: `${completionRate}%` },
                  { label: 'Chauffeurs actifs', value: chauffeurPerf.length },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
