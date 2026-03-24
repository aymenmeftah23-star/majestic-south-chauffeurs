import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Download, Phone, Mail, Building2 } from "lucide-react";

const GOLD = "#C9A84C";
const COLORS = ["#C9A84C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function Clients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading, refetch } = trpc.clients.getAll.useQuery();
  const deleteMutation = trpc.clients.delete.useMutation({ onSuccess: () => refetch() });

  const clients: any[] = data ?? [];
  const filtered = clients.filter((c: any) =>
    !search || (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const getInitials = (name: string) => name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: GOLD }} />Clients
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""} enregistres</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/15 transition-all"><Download className="h-4 w-4" /> Exporter</button>
            <Link href="/clients/new"><button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1a1a2e] transition-all shadow-sm" style={{ background: "linear-gradient(135deg, #C9A84C, #a07830)" }}><Plus className="h-4 w-4" /> Nouveau client</button></Link>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Rechercher par nom, email, societe..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all" />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-5 animate-pulse h-40" />))}</div>
        ) : paginated.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center"><Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" /><p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Aucun client trouve</p><Link href="/clients/new"><button className="text-xs text-[#C9A84C] hover:underline">Ajouter un client</button></Link></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((c: any, idx: number) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={c.id} className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-lg dark:hover:shadow-black/20 hover:border-[#C9A84C]/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>{getInitials(c.name)}</div>
                      <div><h3 className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</h3>{c.company && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5"><Building2 className="h-3 w-3" />{c.company}</div>}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={"/clients/" + c.id}><button className="p-1.5 text-gray-400 hover:text-[#C9A84C] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"><Eye className="h-3.5 w-3.5" /></button></Link>
                      <Link href={"/clients/" + c.id + "/edit"}><button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit className="h-3.5 w-3.5" /></button></Link>
                      <button onClick={() => { if (confirm("Supprimer ce client ?")) deleteMutation.mutate({ id: c.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {c.email && <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: GOLD }} /><span className="truncate">{c.email}</span></div>}
                    {c.phone && <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: GOLD }} /><span>{c.phone}</span></div>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{c.missionsCount ?? 0} mission{(c.missionsCount ?? 0) !== 1 ? "s" : ""}</span>
                    <Link href={"/clients/" + c.id}><button className="text-xs font-medium transition-all hover:underline" style={{ color: GOLD }}>Voir le profil</button></Link>
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
