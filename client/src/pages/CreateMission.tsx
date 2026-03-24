import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Calculator } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

const MISSION_TYPES = [
  { value: 'Transfert', label: 'Transfert', vatDefault: 10 },
  { value: 'Mise à disposition', label: 'Mise à disposition', vatDefault: 20 },
  { value: 'Aéroport', label: 'Aéroport', vatDefault: 10 },
  { value: 'Gare', label: 'Gare', vatDefault: 10 },
  { value: 'Événement', label: 'Événement', vatDefault: 20 },
  { value: 'Affaires', label: 'Affaires', vatDefault: 20 },
  { value: 'Tourisme', label: 'Tourisme', vatDefault: 20 },
  { value: 'Autre', label: 'Autre', vatDefault: 20 },
];

export default function CreateMission() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    type: 'Transfert',
    origin: '', destination: '', date: '', time: '',
    passengers: '1', luggage: '0',
    priceTTC: '', priceHT: '', vatRate: '10',
    clientId: '', chauffeurId: '', vehicleId: '',
    notes: '', specialInstructions: '',
  });

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: chauffeurs } = trpc.chauffeurs.list.useQuery();
  const { data: vehicles } = trpc.vehicles.list.useQuery();

  const createMutation = trpc.missions.create.useMutation({
    onSuccess: () => navigate('/missions'),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Calcul automatique HT depuis TTC
  const handlePriceTTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ttc = parseFloat(e.target.value);
    const vat = parseFloat(formData.vatRate) / 100;
    const ht = ttc ? (ttc / (1 + vat)).toFixed(2) : '';
    setFormData(prev => ({ ...prev, priceTTC: e.target.value, priceHT: ht }));
  };

  // Calcul automatique TTC depuis HT
  const handlePriceHTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ht = parseFloat(e.target.value);
    const vat = parseFloat(formData.vatRate) / 100;
    const ttc = ht ? (ht * (1 + vat)).toFixed(2) : '';
    setFormData(prev => ({ ...prev, priceHT: e.target.value, priceTTC: ttc }));
  };

  // Changement de TVA : recalcul TTC depuis HT
  const handleVatChange = (vatRate: string) => {
    const ht = parseFloat(formData.priceHT);
    const vat = parseFloat(vatRate) / 100;
    const ttc = ht ? (ht * (1 + vat)).toFixed(2) : formData.priceTTC;
    setFormData(prev => ({ ...prev, vatRate, priceTTC: ht ? ttc : prev.priceTTC }));
  };

  // Changement de type : mise à jour TVA par défaut
  const handleTypeChange = (type: string) => {
    const missionType = MISSION_TYPES.find(t => t.value === type);
    const vatDefault = String(missionType?.vatDefault ?? 20);
    const ht = parseFloat(formData.priceHT);
    const vat = parseFloat(vatDefault) / 100;
    const ttc = ht ? (ht * (1 + vat)).toFixed(2) : formData.priceTTC;
    setFormData(prev => ({ ...prev, type, vatRate: vatDefault, priceTTC: ht ? ttc : prev.priceTTC }));
  };

  const vatAmount = formData.priceTTC && formData.priceHT
    ? (parseFloat(formData.priceTTC) - parseFloat(formData.priceHT)).toFixed(2)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { alert('Veuillez sélectionner un client'); return; }
    const dateTime = formData.date && formData.time ? `${formData.date}T${formData.time}:00` : formData.date;
    const missionNumber = `MSN-${Date.now()}`;
    createMutation.mutate({
      number: missionNumber,
      clientId: parseInt(formData.clientId),
      chauffeurId: formData.chauffeurId && formData.chauffeurId !== 'none' ? parseInt(formData.chauffeurId) : undefined,
      vehicleId: formData.vehicleId && formData.vehicleId !== 'none' ? parseInt(formData.vehicleId) : undefined,
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      date: dateTime,
      passengers: parseInt(formData.passengers),
      luggage: parseInt(formData.luggage),
      price: formData.priceTTC ? parseFloat(formData.priceTTC) : undefined,
      priceHT: formData.priceHT ? parseFloat(formData.priceHT) : undefined,
      vatRate: parseInt(formData.vatRate),
      notes: formData.notes || undefined,
      specialInstructions: formData.specialInstructions || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/missions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('missions.create')}</h1>
            <p className="text-muted-foreground mt-1">{t('missions.createDesc')}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Client */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('missions.client')} *</label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.company ? ` — ${c.company}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type de mission */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de mission</label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MISSION_TYPES.map(mt => (
                      <SelectItem key={mt.value} value={mt.value}>
                        {mt.label}
                        <span className="ml-2 text-xs text-muted-foreground">TVA {mt.vatDefault}%</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Itinéraire */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.origin')} *</label>
                  <Input name="origin" value={formData.origin} onChange={handleChange} required placeholder="Adresse de départ" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.destination')} *</label>
                  <Input name="destination" value={formData.destination} onChange={handleChange} required placeholder="Adresse d'arrivée" />
                </div>
              </div>

              {/* Date & Heure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.startDate')} *</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.startTime')} *</label>
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>

              {/* Passagers & Bagages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.passengers')}</label>
                  <Input type="number" name="passengers" value={formData.passengers} onChange={handleChange} min="1" max="20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bagages</label>
                  <Input type="number" name="luggage" value={formData.luggage} onChange={handleChange} min="0" max="20" />
                </div>
              </div>

              {/* Chauffeur & Véhicule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.chauffeur')}</label>
                  <Select value={formData.chauffeurId} onValueChange={(v) => setFormData(p => ({ ...p, chauffeurId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un chauffeur" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Aucun chauffeur —</SelectItem>
                      {chauffeurs?.filter(c => c.status === 'disponible').map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.vehicle')}</label>
                  <Select value={formData.vehicleId} onValueChange={(v) => setFormData(p => ({ ...p, vehicleId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un véhicule" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Aucun véhicule —</SelectItem>
                      {vehicles?.filter(v => v.status === 'disponible').map(v => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} ({v.registration})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tarification avec TVA */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    Tarification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Taux de TVA */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taux de TVA</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleVatChange('10')}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.vatRate === '10'
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        10% — Transferts
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVatChange('20')}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.vatRate === '20'
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        20% — Mise à disposition
                      </button>
                    </div>
                  </div>

                  {/* Prix HT / TTC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix HT (€)</label>
                      <Input
                        type="number"
                        name="priceHT"
                        value={formData.priceHT}
                        onChange={handlePriceHTChange}
                        placeholder="150.00"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix TTC (€)</label>
                      <Input
                        type="number"
                        name="priceTTC"
                        value={formData.priceTTC}
                        onChange={handlePriceTTCChange}
                        placeholder="165.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Récapitulatif TVA */}
                  {vatAmount && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                      <span className="text-sm text-muted-foreground">
                        TVA {formData.vatRate}% calculée
                      </span>
                      <Badge variant="outline" className="font-mono">
                        {vatAmount} €
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea name="notes" placeholder="Numéro de vol, informations particulières..." value={formData.notes} onChange={handleChange} rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions spéciales</label>
                <Textarea name="specialInstructions" placeholder="Panneau avec nom, accueil VIP..." value={formData.specialInstructions} onChange={handleChange} rows={2} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Créer la mission
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/missions')}>
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
