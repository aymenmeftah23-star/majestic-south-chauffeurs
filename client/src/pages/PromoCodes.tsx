import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, ToggleLeft, ToggleRight, Percent, Euro } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function PromoCodes() {
  const { data: codes = [], isLoading, refetch } = trpc.promoCodes.list.useQuery();
  const createMutation = trpc.promoCodes.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setForm({ code: '', type: 'pourcentage', value: '', minAmount: '', maxUses: '', expiresAt: '', description: '' }); },
  });
  const toggleMutation = trpc.promoCodes.toggle.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'pourcentage', value: '', minAmount: '', maxUses: '', expiresAt: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) return;
    createMutation.mutate({
      code: form.code.toUpperCase(),
      type: form.type as any,
      value: parseFloat(form.value),
      minAmount: form.minAmount ? parseFloat(form.minAmount) : undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      active: true,
      expiresAt: form.expiresAt || undefined,
      description: form.description || undefined,
    });
  };

  const activeCount = (codes as any[]).filter((c: any) => c.active).length;
  const totalUses = (codes as any[]).reduce((s: number, c: any) => s + (c.usedCount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Tag className="h-6 w-6" />
              Codes promotionnels
            </h1>
            <p className="text-muted-foreground mt-1">{(codes as any[]).length} codes enregistres</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau code
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Codes actifs</p>
                  <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total codes</p>
                  <p className="text-2xl font-bold">{(codes as any[]).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Euro className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Utilisations totales</p>
                  <p className="text-2xl font-bold">{totalUses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Creer un code promotionnel</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Code *</Label>
                  <Input placeholder="BIENVENUE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
                </div>
                <div>
                  <Label>Type de reduction *</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pourcentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="montant">Montant fixe (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valeur * {form.type === 'pourcentage' ? '(%)' : '(EUR)'}</Label>
                  <Input type="number" placeholder={form.type === 'pourcentage' ? '20' : '50'} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                </div>
                <div>
                  <Label>Montant minimum (EUR)</Label>
                  <Input type="number" placeholder="100" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} />
                </div>
                <div>
                  <Label>Nombre max d'utilisations</Label>
                  <Input type="number" placeholder="50" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
                <div>
                  <Label>Date d'expiration</Label>
                  <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input placeholder="Ex: Reduction bienvenue pour nouveaux clients" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>Creer le code</Button>
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
              <CardTitle className="text-base">Liste des codes</CardTitle>
            </CardHeader>
            <CardContent>
              {(codes as any[]).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun code promotionnel</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(codes as any[]).map((code: any) => (
                    <div key={code.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${code.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Tag className={`h-5 w-5 ${code.active ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm tracking-wider">{code.code}</span>
                            <Badge className={code.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                              {code.active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{code.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Min: {code.minAmount} EUR</span>
                            <span>Utilisations: {code.usedCount}/{code.maxUses}</span>
                            {code.expiresAt && <span>Expire: {new Date(code.expiresAt).toLocaleDateString('fr-FR')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          {code.type === 'pourcentage' ? `${code.value}%` : `${code.value} EUR`}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleMutation.mutate({ id: code.id, active: !code.active })}
                          className="text-xs"
                        >
                          {code.active ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
