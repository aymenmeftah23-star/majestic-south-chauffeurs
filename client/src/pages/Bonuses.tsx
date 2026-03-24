import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Award, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  verse: { label: 'Verse', color: 'bg-green-100 text-green-800' },
  annule: { label: 'Annule', color: 'bg-red-100 text-red-800' },
};

const TYPE_LABELS: Record<string, string> = {
  performance: 'Performance',
  avis: 'Avis clients',
  missions: 'Volume missions',
  special: 'Special',
};

export default function Bonuses() {
  const { data: bonuses = [], isLoading, refetch } = trpc.bonuses.list.useQuery();
  const { data: chauffeurs = [] } = trpc.chauffeurs.list.useQuery();
  const createMutation = trpc.bonuses.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setForm({ chauffeurId: '', type: 'performance', amount: '', month: '', description: '' });
    },
  });
  const updateStatusMutation = trpc.bonuses.updateStatus.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ chauffeurId: '', type: 'performance', amount: '', month: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chauffeurId || !form.amount || !form.month) return;
    createMutation.mutate({
      chauffeurId: parseInt(form.chauffeurId),
      type: form.type as any,
      amount: parseFloat(form.amount),
      month: form.month,
      description: form.description || undefined,
      status: 'en_attente',
    });
  };

  const totalVerse = (bonuses as any[]).filter((b: any) => b.status === 'verse').reduce((s: number, b: any) => s + b.amount, 0);
  const totalEnAttente = (bonuses as any[]).filter((b: any) => b.status === 'en_attente').reduce((s: number, b: any) => s + b.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6" />
              Primes chauffeurs
            </h1>
            <p className="text-muted-foreground mt-1">{(bonuses as any[]).length} primes enregistrees</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle prime
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total verse</p>
                  <p className="text-2xl font-bold text-green-600">{totalVerse} EUR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En attente de versement</p>
                  <p className="text-2xl font-bold text-yellow-600">{totalEnAttente} EUR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nombre de primes</p>
                  <p className="text-2xl font-bold">{(bonuses as any[]).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attribuer une prime</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Chauffeur *</Label>
                  <Select value={form.chauffeurId} onValueChange={v => setForm(f => ({ ...f, chauffeurId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selectionner un chauffeur" /></SelectTrigger>
                    <SelectContent>
                      {(chauffeurs as any[]).map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de prime *</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="avis">Avis clients</SelectItem>
                      <SelectItem value="missions">Volume missions</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Montant (EUR) *</Label>
                  <Input type="number" placeholder="150" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <Label>Mois *</Label>
                  <Input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} required />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input placeholder="Ex: Bonus performance - 98% ponctualite" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>Attribuer la prime</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {!isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des primes</CardTitle>
            </CardHeader>
            <CardContent>
              {(bonuses as any[]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune prime enregistree</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(bonuses as any[]).map((bonus: any) => {
                    const statusInfo = STATUS_LABELS[bonus.status] || STATUS_LABELS.en_attente;
                    return (
                      <div key={bonus.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {(bonus.chauffeurName || 'C').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{bonus.chauffeurName}</p>
                            <p className="text-xs text-muted-foreground">{bonus.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{TYPE_LABELS[bonus.type] || bonus.type}</Badge>
                              <span className="text-xs text-muted-foreground">{bonus.month}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{bonus.amount} EUR</span>
                          {bonus.status === 'en_attente' ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-7"
                                onClick={() => updateStatusMutation.mutate({ id: bonus.id, status: 'verse' })}
                              >
                                Marquer verse
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 text-xs h-7"
                                onClick={() => updateStatusMutation.mutate({ id: bonus.id, status: 'annule' })}
                              >
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          )}
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
