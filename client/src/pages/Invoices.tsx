import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Receipt, Search, Download, Euro, CheckCircle2, Clock, AlertCircle,
  ChevronDown, FileText, Plus
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  payee:      { label: 'Payée',      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',  icon: CheckCircle2 },
  en_attente: { label: 'En attente', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  en_retard:  { label: 'En retard',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',    icon: AlertCircle },
  annulee:    { label: 'Annulée',    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',   icon: Receipt },
};

export default function Invoices() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: invoices = [], isLoading, refetch } = trpc.invoices.list.useQuery();
  const updateStatus = trpc.invoices.updateStatus.useMutation({ onSuccess: () => refetch() });

  const filtered = (invoices as any[]).filter(inv => {
    const matchSearch = !searchQuery || [inv.number, inv.origin, inv.destination]
      .some(v => (v || '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount   = (invoices as any[]).reduce((s, i) => s + (i.amount || 0), 0);
  const paidAmount    = (invoices as any[]).filter(i => i.status === 'payee').reduce((s, i) => s + (i.amount || 0), 0);
  const pendingAmount = (invoices as any[]).filter(i => i.status === 'en_attente').reduce((s, i) => s + (i.amount || 0), 0);
  const lateAmount    = (invoices as any[]).filter(i => i.status === 'en_retard').reduce((s, i) => s + (i.amount || 0), 0);

  const handleDownloadPDF = async (inv: any) => {
    try {
      const res = await fetch(`/api/pdf/invoice/${inv.clientId || inv.id}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${inv.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de la génération du PDF');
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status: status as any });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('invoices.title')}</h1>
            <p className="text-muted-foreground mt-1">{filtered.length} {t('invoices.invoices')}</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Euro className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total facturé</p>
                  <p className="text-xl font-bold">{totalAmount.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payé</p>
                  <p className="text-xl font-bold text-green-600">{paidAmount.toFixed(2)} €</p>
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
                  <p className="text-xl font-bold text-orange-600">{pendingAmount.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En retard</p>
                  <p className="text-xl font-bold text-red-600">{lateAmount.toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, trajet..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="payee">Payée</SelectItem>
              <SelectItem value="en_retard">En retard</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {!isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {t('invoices.list')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('common.noData')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium text-muted-foreground">Numéro</th>
                        <th className="pb-3 font-medium text-muted-foreground">Trajet</th>
                        <th className="pb-3 font-medium text-muted-foreground">Date</th>
                        <th className="pb-3 font-medium text-muted-foreground text-right">Montant HT</th>
                        <th className="pb-3 font-medium text-muted-foreground text-right">TVA</th>
                        <th className="pb-3 font-medium text-muted-foreground text-right">TTC</th>
                        <th className="pb-3 font-medium text-muted-foreground text-center">Statut</th>
                        <th className="pb-3 font-medium text-muted-foreground text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((inv: any) => {
                        const vatRate = inv.vatRate || 20;
                        const amountTTC = inv.amount || 0;
                        const amountHT = inv.priceHT || amountTTC / (1 + vatRate / 100);
                        const amountTVA = amountTTC - amountHT;
                        const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG['en_attente'];
                        const StatusIcon = cfg.icon;
                        return (
                          <tr key={inv.id} className="hover:bg-accent/30 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-mono font-medium">{inv.number}</span>
                              </div>
                            </td>
                            <td className="py-3 text-muted-foreground max-w-[200px] truncate">
                              {inv.origin} → {inv.destination}
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {new Date(inv.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 text-right font-medium">{amountHT.toFixed(2)} €</td>
                            <td className="py-3 text-right text-muted-foreground text-xs">
                              {vatRate}% · {amountTVA.toFixed(2)} €
                            </td>
                            <td className="py-3 text-right font-bold">{amountTTC.toFixed(2)} €</td>
                            <td className="py-3 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${cfg.color}`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {cfg.label}
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center">
                                  <DropdownMenuItem onClick={() => handleStatusChange(inv.id, 'en_attente')}>
                                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                    En attente
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(inv.id, 'payee')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                    Marquer comme payée
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(inv.id, 'en_retard')}>
                                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                    En retard
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(inv.id, 'annulee')}>
                                    <Receipt className="h-4 w-4 mr-2 text-gray-500" />
                                    Annuler
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                            <td className="py-3 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadPDF(inv)}
                                title="Télécharger la facture PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
