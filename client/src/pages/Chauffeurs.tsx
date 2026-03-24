import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { UserCheck, Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, Phone, Mail, Star, Car } from "lucide-react";

const GOLD = "#C9A84C";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  available:   { label: "Disponible",  color: "text-green-600 dark:text-green-400",  dot: "bg-green-500" },
  on_mission:  { label: "En mission",  color: "text-blue-600 dark:text-blue-400",    dot: "bg-blue-500" },
  unavailable: { label: "Indisponible", color: "text-red-600 dark:text-red-400",     dot: "bg-red-500" },
  off:         { label: "Repos",       color: "text-gray-500 dark:text-gray-400",    dot: "bg-gray-400" },
};

export default function Chauffeurs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, refetch } = trpc.chauffeurs.getAll.useQuery();
  const deleteMutation = trpc.chauffeurs.delete.useMutation({ onSuccess: () => refetch() });

  const chauffeurs: any[] = data ?? [];

  // Normalisation des statuts (la BDD utilise 'disponible', 'en_mission', 'indisponible')
  const normalizeStatus = (s: string) => {
    if (!s) return 'available';
    const map: Record<string, string> = {
      disponible: 'available', available: 'available',
      en_mission: 'on_mission', on_mission: 'on_mission', occupe: 'on_mission',
      indisponible: 'unavailable', unavailable: 'unavailable',
      conge: 'off', off: 'off', suspendu: 'unavailable',
    };
    return map[s] ?? 'available';
  };

  const filtered = chauffeurs.filter((c: any) => {
    const matchSearch = !search || (c.name ?? "").toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || normalizeStatus(c.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const counts: Record<string, number> = {
    all: chauffeurs.length,
    available: chauffeurs.filter((c: any) => normalizeStatus(c.status) === "available").length,
    on_mission: chauffeurs.filter((c: any) => normalizeStatus(c.status) === "on_mission").length,
    unavailable: chauffeurs.filter((c: any) => normalizeStatus(c.status) === "unavailable").length,
  };

  const getInitials = (name: string) => name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5" style={{ color: GOLD }} />
              Chauffeurs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{chauffeurs.length} chauffeur{chauffeurs.length !== 1 ? "s" : ""} enregistres</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/15 transition-all"><Download className="h-4 w-4" /> Exporter</button>
            <Link href="/chauffeurs/new"><button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1a1a2e] transition-all shadow-sm" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}><Plus className="h-4 w-4" /> Nouveau chauffeur</button></Link>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl overflow-x-auto">
          {[{ key: "all", label: "Tous" }, { key: "available", label: "Disponibles" }, { key: "on_mission", label: "En mission" }, { key: "unavailable", label: "Indisponibles" }].map((tab) => (
            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all " + (statusFilter === tab.key ? "bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}>
              {tab.label}
              <span className={"px-1.5 py-0.5 rounded-full text-xs font-bold " + (statusFilter === tab.key ? "text-[#C9A84C]" : "text-gray-400")}>{counts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par nom, email..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all" />
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chauffeur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicule</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (<tr key={i}>{Array.from({ length: 6 }).map((_, j) => (<td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-white/10 rounded animate-pulse" /></td>))}</tr>))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center">
                    <UserCheck className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun chauffeur trouve</p>
                    <Link href="/chauffeurs/new"><button className="mt-3 text-xs text-[#C9A84C] hover:underline">Ajouter un chauffeur</button></Link>
                  </td></tr>
                ) : (
                  paginated.map((c: any) => {
                    const sc = STATUS_CONFIG[normalizeStatus(c.status)] ?? STATUS_CONFIG.available;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}>{getInitials(c.name)}</div>
                            <div><div className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</div><div className="text-xs text-gray-400">{c.licenseNumber ?? "—"}</div></div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {c.email && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Mail className="h-3 w-3" style={{ color: GOLD }} />{c.email}</div>}
                            {c.phone && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Phone className="h-3 w-3" style={{ color: GOLD }} />{c.phone}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><Car className="h-3.5 w-3.5 text-gray-400" />{c.vehicleName ?? "Non assigne"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.rating ?? "—"}</span></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={"flex items-center gap-1.5 text-xs font-medium " + sc.color}><div className={"w-1.5 h-1.5 rounded-full " + sc.dot} />{sc.label}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={"/chauffeurs/" + c.id}><button className="p-1.5 text-gray-400 hover:text-[#C9A84C] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"><Eye className="h-4 w-4" /></button></Link>
                            <Link href={"/chauffeurs/" + c.id + "/edit"}><button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit className="h-4 w-4" /></button></Link>
                            <button onClick={() => { if (confirm("Supprimer ce chauffeur ?")) deleteMutation.mutate({ id: c.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
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
                {Array.from({ length: totalPages }).map((_, i) => (<button key={i} onClick={() => setPage(i + 1)} className={"w-7 h-7 rounded-lg text-xs font-medium transition-all " + (page === i + 1 ? "text-[#1a1a2e] font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10")} style={page === i + 1 ? { background: "linear-gradient(135deg, #C9A84C, #a07830)" } : {}}>{i + 1}</button>))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
