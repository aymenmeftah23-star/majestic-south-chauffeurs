import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Car, Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, Users, Gauge, Calendar } from "lucide-react";

const GOLD = "#C9A84C";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  available:    { label: "Disponible",   color: "text-green-600 dark:text-green-400",  dot: "bg-green-500" },
  in_use:       { label: "En service",   color: "text-blue-600 dark:text-blue-400",    dot: "bg-blue-500" },
  maintenance:  { label: "Maintenance",  color: "text-orange-600 dark:text-orange-400",dot: "bg-orange-500" },
  unavailable:  { label: "Indisponible", color: "text-red-600 dark:text-red-400",      dot: "bg-red-500" },
};

const TYPE_LABELS: Record<string, string> = {
  berline: "Berline", van: "Van", suv: "SUV", minibus: "Minibus", limousine: "Limousine", autre: "Autre",
};

export default function Vehicles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading, refetch } = trpc.vehicles.getAll.useQuery();
  const deleteMutation = trpc.vehicles.delete.useMutation({ onSuccess: () => refetch() });

  const vehicles: any[] = data ?? [];

  // Normalisation des statuts (la BDD utilise 'disponible', 'en_service', 'entretien')
  const normalizeStatus = (s: string) => {
    if (!s) return 'available';
    const map: Record<string, string> = {
      disponible: 'available', available: 'available',
      en_service: 'in_use', in_use: 'in_use', en_mission: 'in_use',
      entretien: 'maintenance', maintenance: 'maintenance',
      hors_service: 'unavailable', unavailable: 'unavailable',
      reserve: 'in_use',
    };
    return map[s] ?? 'available';
  };

  const filtered = vehicles.filter((v: any) => {
    const matchSearch = !search ||
      (v.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (v.model ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (v.licensePlate ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || normalizeStatus(v.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const counts: Record<string, number> = {
    all: vehicles.length,
    available: vehicles.filter((v: any) => normalizeStatus(v.status) === "available").length,
    in_use: vehicles.filter((v: any) => normalizeStatus(v.status) === "in_use").length,
    maintenance: vehicles.filter((v: any) => normalizeStatus(v.status) === "maintenance").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" style={{ color: GOLD }} />
              Vehicules
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{vehicles.length} vehicule{vehicles.length !== 1 ? "s" : ""} dans la flotte</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/15 transition-all"><Download className="h-4 w-4" /> Exporter</button>
            <Link href="/vehicles/new"><button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1a1a2e] transition-all shadow-sm" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}><Plus className="h-4 w-4" /> Nouveau vehicule</button></Link>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl overflow-x-auto">
          {[{ key: "all", label: "Tous" }, { key: "available", label: "Disponibles" }, { key: "in_use", label: "En service" }, { key: "maintenance", label: "Maintenance" }].map((tab) => (
            <button key={tab.key} onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all " + (statusFilter === tab.key ? "bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}>
              {tab.label}
              <span className={"px-1.5 py-0.5 rounded-full text-xs font-bold " + (statusFilter === tab.key ? "text-[#C9A84C]" : "text-gray-400")}>{counts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par marque, modele, immatriculation..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-5 animate-pulse h-40" />))}</div>
        ) : paginated.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center"><Car className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" /><p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Aucun vehicule trouve</p><Link href="/vehicles/new"><button className="text-xs text-[#C9A84C] hover:underline">Ajouter un vehicule</button></Link></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((v: any) => {
              const sc = STATUS_CONFIG[normalizeStatus(v.status)] ?? STATUS_CONFIG.available;
              const typeLabel = TYPE_LABELS[v.type?.toLowerCase()] ?? (v.type ?? "Véhicule");
              return (
                <div key={v.id} className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-lg dark:hover:shadow-black/20 hover:border-[#C9A84C]/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10 flex-shrink-0"><Car className="h-5 w-5 text-gray-500 dark:text-gray-400" /></div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{v.brand} {v.model}</h3>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded inline-block">{v.licensePlate ?? "—"}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={"/vehicles/" + v.id}><button className="p-1.5 text-gray-400 hover:text-[#C9A84C] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"><Eye className="h-3.5 w-3.5" /></button></Link>
                      <Link href={"/vehicles/" + v.id + "/edit"}><button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit className="h-3.5 w-3.5" /></button></Link>
                      <button onClick={() => { if (confirm("Supprimer ce vehicule ?")) deleteMutation.mutate({ id: v.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <Users className="h-3.5 w-3.5 mx-auto mb-1 text-gray-400" />
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{v.seats ?? v.capacity ?? "—"}</div>
                      <div className="text-xs text-gray-400">places</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 mx-auto mb-1 text-gray-400" />
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{v.year ?? "—"}</div>
                      <div className="text-xs text-gray-400">annee</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <Gauge className="h-3.5 w-3.5 mx-auto mb-1 text-gray-400" />
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{v.mileage ? `${(v.mileage/1000).toFixed(0)}k` : "—"}</div>
                      <div className="text-xs text-gray-400">km</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={"flex items-center gap-1.5 text-xs font-medium " + sc.color}>
                      <div className={"w-1.5 h-1.5 rounded-full " + sc.dot} />
                      {sc.label}
                    </div>
                    <Link href={"/vehicles/" + v.id}><button className="text-xs font-medium transition-all hover:underline" style={{ color: GOLD }}>Details →</button></Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">{(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} sur {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }).map((_, i) => (<button key={i} onClick={() => setPage(i + 1)} className={"w-7 h-7 rounded-lg text-xs font-medium transition-all " + (page === i + 1 ? "text-[#1a1a2e] font-bold" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10")} style={page === i + 1 ? { background: "linear-gradient(135deg, #C9A84C, #a07830)" } : {}}>{i + 1}</button>))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
