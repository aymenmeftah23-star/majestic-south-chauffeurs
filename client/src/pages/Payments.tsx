import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Search, Euro, TrendingUp, Clock, Download,
  ArrowUpRight, ArrowDownLeft, RefreshCw, CheckCircle,
  XCircle, AlertCircle, ExternalLink, Filter
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Statuts de paiement
const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  recu:       { label: "Reçu",        color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  en_attente: { label: "En attente",  color: "#d97706", bg: "#fef3c7", icon: Clock },
  rembourse:  { label: "Remboursé",   color: "#7c3aed", bg: "#ede9fe", icon: ArrowDownLeft },
  echec:      { label: "Échoué",      color: "#dc2626", bg: "#fee2e2", icon: XCircle },
  litige:     { label: "Litige",      color: "#9f1239", bg: "#ffe4e6", icon: AlertCircle },
};

const METHOD_LABELS: Record<string, string> = {
  stripe:   "Stripe",
  virement: "Virement bancaire",
  especes:  "Espèces",
  cheque:   "Chèque",
  cb:       "Carte bancaire",
};

function exportCSV(data: any[]) {
  const headers = ["Référence", "Date", "Trajet", "Montant (€)", "Méthode", "Statut"];
  const rows = data.map(p => [
    p.reference,
    new Date(p.date).toLocaleDateString("fr-FR"),
    `${p.origin} → ${p.destination}`,
    (p.amount || 0).toFixed(2),
    METHOD_LABELS[p.method] || p.method,
    PAYMENT_STATUS[p.status]?.label || p.status,
  ]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `paiements_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Payments() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: payments = [], isLoading, refetch } = trpc.payments.list.useQuery();
  const { data: stats } = trpc.payments.stats.useQuery();

  const allPayments = payments as any[];

  // Filtrage
  const filtered = allPayments.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (dateFrom && new Date(p.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(p.date) > new Date(dateTo + "T23:59:59")) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (p.reference || "").toLowerCase().includes(q) ||
        (p.origin || "").toLowerCase().includes(q) ||
        (p.destination || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calcul des totaux filtrés
  const totalFiltered = filtered.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalReceived = filtered.filter((p: any) => p.status === "recu").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalPending = filtered.filter((p: any) => p.status === "en_attente").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const totalRefunded = filtered.filter((p: any) => p.status === "rembourse").reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("payments.title")}</h1>
            <p className="text-muted-foreground mt-1">{filtered.length} paiement{filtered.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)} className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Euro className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CA Total</p>
                  <p className="text-xl font-bold text-green-600">{(stats?.totalRevenue || 0).toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold text-orange-600">{(stats?.pendingRevenue || 0).toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Missions terminées</p>
                  <p className="text-xl font-bold">{stats?.completedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <ArrowDownLeft className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remboursés</p>
                  <p className="text-xl font-bold text-purple-600">{totalRefunded.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(PAYMENT_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
                placeholder="Du"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
                placeholder="Au"
              />
            </div>
          </CardContent>
        </Card>

        {/* Résumé de la sélection */}
        {(statusFilter !== "all" || dateFrom || dateTo || searchQuery) && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border text-sm">
            <span className="text-muted-foreground">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""} — Total : <strong>{totalFiltered.toFixed(2)} €</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setSearchQuery(""); }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Liste des paiements */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Historique des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun paiement trouvé</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((p: any) => {
                    const sc = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.en_attente;
                    const StatusIcon = sc.icon;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: sc.bg }}
                          >
                            <StatusIcon className="h-5 w-5" style={{ color: sc.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{p.reference}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(p.date).toLocaleDateString("fr-FR", {
                                  day: "numeric", month: "short", year: "numeric"
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {p.origin} → {p.destination}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {METHOD_LABELS[p.method] || p.method}
                              </span>
                              {p.stripePaymentId && (
                                <a
                                  href={`https://dashboard.stripe.com/payments/${p.stripePaymentId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                                >
                                  Stripe <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div
                              className="font-bold text-lg"
                              style={{ color: p.status === "rembourse" ? "#7c3aed" : p.status === "echec" ? "#dc2626" : "#16a34a" }}
                            >
                              {p.status === "rembourse" ? "-" : "+"}{(p.amount || 0).toFixed(2)} €
                            </div>
                            {p.amountDeposit && (
                              <div className="text-xs text-muted-foreground">
                                Acompte : {(p.amountDeposit / 100).toFixed(2)} €
                              </div>
                            )}
                          </div>
                          <Badge
                            className="text-xs font-medium"
                            style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.color}30` }}
                          >
                            {sc.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
