import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Calculator, Info } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function CreateQuote() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    demandId: '',
    priceHT: '',
    vatRate: '20',
    validUntil: '',
    notes: '',
  });

  const { data: demands } = trpc.demands.list.useQuery();

  const createMutation = trpc.quotes.create.useMutation({
    onSuccess: () => navigate('/quotes'),
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Calculs TVA automatiques
  const priceHT = parseFloat(formData.priceHT) || 0;
  const vatRate = parseFloat(formData.vatRate) || 20;
  const tvaAmount = priceHT * (vatRate / 100);
  const priceTTC = priceHT + tvaAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.demandId) { toast.error('Veuillez sélectionner une demande'); return; }
    if (!formData.priceHT || priceHT <= 0) { toast.error('Veuillez saisir le montant HT'); return; }

    const quoteNumber = 'DEV-' + Date.now();
    createMutation.mutate({
      demandId: parseInt(formData.demandId),
      number: quoteNumber,
      price: Math.round(priceTTC * 100) / 100,
      priceHT: Math.round(priceHT * 100) / 100,
      vatRate: vatRate,
      validUntil: formData.validUntil || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('quotes.create')}</h1>
            <p className="text-muted-foreground mt-1">{t('quotes.createDesc')}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Demande liée */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('quotes.demand')}</label>
                <Select value={formData.demandId} onValueChange={v => setFormData(p => ({ ...p, demandId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une demande" />
                  </SelectTrigger>
                  <SelectContent>
                    {(demands || []).map((d: any) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        #{d.id} — {d.origin} vers {d.destination} ({new Date(d.date).toLocaleDateString('fr-FR')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Taux de TVA */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Taux de TVA applicable
                  <Info className="h-4 w-4 text-muted-foreground" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, vatRate: '10' }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.vatRate === '10'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold">10%</span>
                      {formData.vatRate === '10' && (
                        <Badge className="text-xs">Sélectionné</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Transferts aéroport, gare, hôtel</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, vatRate: '20' }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.vatRate === '20'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold">20%</span>
                      {formData.vatRate === '20' && (
                        <Badge className="text-xs">Sélectionné</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Mise à disposition, événements, tourisme</p>
                  </button>
                </div>
              </div>

              {/* Montant HT */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('quotes.priceHT')} (€)</label>
                <Input
                  type="number"
                  name="priceHT"
                  value={formData.priceHT}
                  onChange={handleChange}
                  required
                  placeholder="150.00"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Récapitulatif TVA */}
              {priceHT > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Récapitulatif tarifaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant HT</span>
                        <span className="font-medium">{priceHT.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TVA ({vatRate}%)</span>
                        <span className="font-medium">{tvaAmount.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold text-base">
                        <span>Total TTC</span>
                        <span className="text-primary">{priceTTC.toFixed(2)} €</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Validité */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('quotes.validUntil')}</label>
                <Input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea
                  name="notes"
                  placeholder="Notes internes, conditions particulières..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    : <Save className="h-4 w-4 mr-2" />
                  }
                  {t('quotes.create')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/quotes')}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
