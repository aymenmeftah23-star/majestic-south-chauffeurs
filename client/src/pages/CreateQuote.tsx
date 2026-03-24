import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function CreateQuote() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    demandId: '', price: '', priceHT: '', validUntil: '', notes: '',
  });

  const { data: demands } = trpc.demands.list.useQuery();

  const createMutation = trpc.quotes.create.useMutation({
    onSuccess: () => navigate('/quotes'),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.demandId) { alert('Veuillez selectionner une demande'); return; }
    if (!formData.price || !formData.priceHT) { alert('Veuillez saisir les prix'); return; }
    const quoteNumber = 'DEV-' + Date.now();
    createMutation.mutate({
      demandId: parseInt(formData.demandId),
      number: quoteNumber,
      price: parseFloat(formData.price),
      priceHT: parseFloat(formData.priceHT),
      validUntil: formData.validUntil || undefined,
      notes: formData.notes || undefined,
    });
  };

  const tvaAmount = formData.price && formData.priceHT
    ? (parseFloat(formData.price) - parseFloat(formData.priceHT)).toFixed(2)
    : null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('quotes.create')}</h1>
            <p className="text-muted-foreground mt-1">{t('quotes.createDesc')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('quotes.demand')}</label>
                <Select value={formData.demandId} onValueChange={(v) => setFormData(p => ({ ...p, demandId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selectionner une demande" /></SelectTrigger>
                  <SelectContent>
                    {demands?.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        #{d.id} - {d.origin} vers {d.destination} ({new Date(d.date).toLocaleDateString('fr-FR')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('quotes.priceTTC')} (EUR)</label>
                  <Input type="number" name="price" value={formData.price} onChange={handleChange} required placeholder="180.00" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('quotes.priceHT')} (EUR)</label>
                  <Input type="number" name="priceHT" value={formData.priceHT} onChange={handleChange} required placeholder="150.00" step="0.01" />
                </div>
              </div>
              {tvaAmount && (
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <span className="font-medium">TVA : </span>{tvaAmount} EUR
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('quotes.validUntil')}</label>
                <Input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea name="notes" placeholder="Notes internes..." value={formData.notes} onChange={handleChange} rows={4} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('quotes.create')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/quotes')}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
