import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { MapPin, Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, Calendar, User, Car, Clock, Filter } from "lucide-react";

const GOLD = "#C9A84C";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  a_confirmer:          { label: "A confirmer",       color: "text-yellow-600 dark:text-yellow-400",  bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  confirmee:            { label: "Confirmee",          color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-50 dark:bg-blue-900/20" },
  en_preparation:       { label: "En preparation",     color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 dark:bg-purple-900/20" },
  chauffeur_assigne:    { label: "Chauffeur assigne",  color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  vehicule_assigne:     { label: "Vehicule assigne",   color: "text-cyan-600 dark:text-cyan-400",      bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  prete:                { label: "Prete",              color: "text-teal-600 dark:text-teal-400",      bg: "bg-teal-50 dark:bg-teal-900/20" },
  en_cours:             { label: "En cours",           color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20" },
  client_pris_en_charge:{ label: "Client pris",        color: "text-lime-600 dark:text-lime-400",      bg: "bg-lime-50 dark:bg-lime-900/20" },
  terminee:             { label: "Terminee",           color: "text-green-600 dark:text-green-400",    bg: "bg-green-50 dark:bg-green-900/20" },
  annulee:              { label: "Annulee",            color: "text-red-600 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-900/20" },
  litige:               { label: "Litige",             color: "text-rose-600 dark:text-rose-400",      bg: "bg-rose-50 dark:bg-rose-900/20" },
};

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "a_confirmer", label: "A confirmer" },
  { key: "confirmee", label: "Confirmees" },
  { key: "en_cours", label: "En cours" },
  { key: "terminee", label: "Terminees" },
  { key: "annulee", label: "Annulees" },
];

export default function Missions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const { data, isLoading, refetch } = trpc.missions.getAll.useQuery();
  const deleteMutation = trpc.missions.delete.useMutation({ onSuccess: () => refetch() });

  const missions: any[] = data ?? [];
  const filtered = missions.filter((m: any) => {
    const matchSearch = !search ||
      (m.number ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (m.clientName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (m.origin ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (m.destination ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const tabCounts: Record<string, number> = { all: missions.length };
  TABS.slice(1).forEach(t => { tabCounts[t.key] = missions.filter((m: any) => m.status === t.key).length; });

  const formatDate = (d: any) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return "—"; }
  };

  const formatTime = (d: any) => {
    if (!d) return "";
    try { return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5" style={{ color: GOLD }} />
              Missions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{missions.length} mission{missions.length !== 1 ? "s" : ""} au total</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/15 transition-all">
              <Download className="h-4 w-4" /> Exporter
            </button>
            <Link href="/missions/new">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1a1a2e] transition-all shadow-sm" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>
                <Plus className="h-4 w-4" /> Nouvelle mission
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all " + (statusFilter === tab.key ? "bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}>
              {tab.label}
              <span className={"px-1.5 py-0.5 rounded-full text-xs font-bold " + (statusFilter === tab.key ? "text-[#C9A84C]" : "text-gray-400")}>{tabCounts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par numero, client, trajet..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all" />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mission</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trajet</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chauffeur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>))}</tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center">
                    <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune mission trouvee</p>
                    <Link href="/missions/new"><button className="mt-3 text-xs text-[#C9A84C] hover:underline">Creer une mission</button></Link>
                  </td></tr>
                ) : (
                  paginated.map((m: any) => {
                    const sc = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.a_confirmer;
                    return (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-bold text-gray-900 dark:text-white">{m.number ?? `#${m.id}`}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{m.type ?? "Transfer"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{m.clientName ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-700 dark:text-gray-300 max-w-[180px]">
                            <div className="truncate"><span className="text-green-500">●</span> {m.origin ?? "—"}</div>
                            <div className="truncate mt-0.5"><span className="text-red-500">●</span> {m.destination ?? "—"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(m.startDate ?? m.date)}
                          </div>
                          {(m.startDate ?? m.date) && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {formatTime(m.startDate ?? m.date)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <User className="h-3 w-3" />
                            {m.chauffeurName ?? <span className="italic text-gray-400">Non assigne</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {m.price ? `${Number(m.price).toLocaleString("fr-FR")} €` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " + sc.color + " " + sc.bg}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={"/missions/" + m.id}><button className="p-1.5 text-gray-400 hover:text-[#C9A84C] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"><Eye className="h-4 w-4" /></button></Link>
                            <Link href={"/missions/" + m.id + "/edit"}><button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit className="h-4 w-4" /></button></Link>
                            <button onClick={() => { if (confirm("Supprimer cette mission ?")) deleteMutation.mutate({ id: m.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400">{(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} sur {filtered.length}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (<button key={i} onClick={() => setPage(i + 1)} className={"w-7 h-7 rounded-lg text-xs font-medium transition-all " + (page === i + 1 ? "text-[#1a1a2e] font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10")} style={page === i + 1 ? { background: "linear-gradient(135deg, #C9A84C, #a07830)" } : {}}>{i + 1}</button>))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
