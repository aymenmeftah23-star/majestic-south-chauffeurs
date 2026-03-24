import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2, Calculator, Route, Clock, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import AddressAutocomplete, { calculateRouteGoogle } from '@/components/AddressAutocomplete';

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

interface StopPoint {
  address: string;
  time: string;
  note: string;
}

export default function CreateMission() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    type: 'Transfert',
    origin: '',
    destination: '',
    date: '',
    time: '',
    passengers: '1',
    luggage: '0',
    priceTTC: '',
    priceHT: '',
    vatRate: '10',
    priceInputMode: 'ttc' as 'ht' | 'ttc',
    clientId: '',
    chauffeurId: '',
    vehicleId: '',
    notes: '',
    specialInstructions: '',
  });
  const [stops, setStops] = useState<StopPoint[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: chauffeurs } = trpc.chauffeurs.list.useQuery();
  const { data: vehicles } = trpc.vehicles.list.useQuery();

  const createMutation = trpc.missions.create.useMutation({
    onSuccess: () => navigate('/missions'),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  // Calcul automatique de l'itinéraire (distance + durée uniquement)
  const computeRoute = async (origin: string, dest: string) => {
    if (!origin || !dest || origin.length < 5 || dest.length < 5) return;
    setIsCalculatingRoute(true);
    try {
      const result = await calculateRouteGoogle(origin, dest);
      if (result) setRouteInfo({ distanceText: result.distanceText, durationText: result.durationText });
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleOriginChange = (value: string, lat?: number) => {
    setFormData(prev => ({ ...prev, origin: value }));
    if (lat && formData.destination) computeRoute(value, formData.destination);
  };

  const handleDestChange = (value: string, lat?: number) => {
    setFormData(prev => ({ ...prev, destination: value }));
    if (lat && formData.origin) computeRoute(formData.origin, value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Saisie HT → calcule TTC automatiquement
  const handlePriceHTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ht = parseFloat(e.target.value);
    const vat = parseFloat(formData.vatRate) / 100;
    const ttc = !isNaN(ht) ? (ht * (1 + vat)).toFixed(2) : '';
    setFormData(prev => ({ ...prev, priceHT: e.target.value, priceTTC: ttc, priceInputMode: 'ht' }));
  };

  // Saisie TTC → calcule HT automatiquement
  const handlePriceTTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ttc = parseFloat(e.target.value);
    const vat = parseFloat(formData.vatRate) / 100;
    const ht = !isNaN(ttc) ? (ttc / (1 + vat)).toFixed(2) : '';
    setFormData(prev => ({ ...prev, priceTTC: e.target.value, priceHT: ht, priceInputMode: 'ttc' }));
  };

  // Changement TVA → recalcule l'autre prix selon le mode actif
  const handleVatChange = (vatRate: string) => {
    const vat = parseFloat(vatRate) / 100;
    if (formData.priceInputMode === 'ht' && formData.priceHT) {
      const ht = parseFloat(formData.priceHT);
      setFormData(prev => ({ ...prev, vatRate, priceTTC: (ht * (1 + vat)).toFixed(2) }));
    } else if (formData.priceInputMode === 'ttc' && formData.priceTTC) {
      const ttc = parseFloat(formData.priceTTC);
      setFormData(prev => ({ ...prev, vatRate, priceHT: (ttc / (1 + vat)).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, vatRate }));
    }
  };

  const handleTypeChange = (type: string) => {
    const missionType = MISSION_TYPES.find(mt => mt.value === type);
    const vatDefault = String(missionType?.vatDefault ?? 20);
    setFormData(prev => ({ ...prev, type }));
    handleVatChange(vatDefault);
  };

  // Gestion des étapes intermédiaires
  const addStop = () => setStops(prev => [...prev, { address: '', time: '', note: '' }]);
  const removeStop = (i: number) => setStops(prev => prev.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: keyof StopPoint, value: string) => {
    setStops(prev => {
      const s = [...prev];
      s[i] = { ...s[i], [field]: value };
      return s;
    });
  };

  const vatAmount = formData.priceTTC && formData.priceHT
    ? (parseFloat(formData.priceTTC) - parseFloat(formData.priceHT)).toFixed(2)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { alert('Veuillez sélectionner un client'); return; }
    if (!formData.origin) { alert('Veuillez saisir une adresse de départ'); return; }
    if (!formData.destination) { alert('Veuillez saisir une adresse d\'arrivée'); return; }

    const stopsNote = stops.length > 0
      ? '\nÉtapes : ' + stops.map((s, i) => `${i + 1}. ${s.address}${s.time ? ' à ' + s.time : ''}${s.note ? ' (' + s.note + ')' : ''}`).join(' | ')
      : '';

    createMutation.mutate({
      clientId: parseInt(formData.clientId),
      chauffeurId: formData.chauffeurId && formData.chauffeurId !== 'none' ? parseInt(formData.chauffeurId) : undefined,
      vehicleId: formData.vehicleId && formData.vehicleId !== 'none' ? parseInt(formData.vehicleId) : undefined,
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      date: formData.date && formData.time ? `${formData.date}T${formData.time}:00` : formData.date,
      passengers: parseInt(formData.passengers),
      luggage: parseInt(formData.luggage),
      price: formData.priceTTC ? parseFloat(formData.priceTTC) : undefined,
      priceHT: formData.priceHT ? parseFloat(formData.priceHT) : undefined,
      vatRate: parseInt(formData.vatRate),
      notes: (formData.notes || '') + stopsNote || undefined,
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
            <p className="text-muted-foreground mt-1">Remplissez les informations de la nouvelle mission</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Client */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('missions.client')} *</label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}{c.company ? ` — ${c.company}` : ''}
                      </SelectItem>
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

              {/* Itinéraire avec étapes */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Itinéraire *</label>

                {/* Départ */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center self-stretch pt-3 pb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                    <div className="w-0.5 flex-1 bg-border mt-1" />
                  </div>
                  <div className="flex-1">
                    <AddressAutocomplete
                      value={formData.origin}
                      onChange={handleOriginChange}
                      placeholder="Adresse de départ"
                      id="origin"
                      required
                      clearable
                    />
                  </div>
                </div>

                {/* Étapes intermédiaires */}
                {stops.map((stop, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center self-stretch pt-3 pb-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                      <div className="w-0.5 flex-1 bg-border mt-1" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <AddressAutocomplete
                        value={stop.address}
                        onChange={(v) => updateStop(i, 'address', v)}
                        placeholder={`Étape ${i + 1} — adresse`}
                        clearable
                      />
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={stop.time}
                          onChange={e => updateStop(i, 'time', e.target.value)}
                          className="w-32"
                        />
                        <Input
                          type="text"
                          value={stop.note}
                          onChange={e => updateStop(i, 'note', e.target.value)}
                          placeholder="Note (optionnel)"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button" variant="ghost" size="icon"
                      onClick={() => removeStop(i)}
                      className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Bouton ajouter étape */}
                <div className="pl-6">
                  <Button type="button" variant="outline" size="sm" onClick={addStop} className="text-xs gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Ajouter une étape intermédiaire
                  </Button>
                </div>

                {/* Arrivée */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-3" />
                  <div className="flex-1">
                    <AddressAutocomplete
                      value={formData.destination}
                      onChange={handleDestChange}
                      placeholder="Adresse d'arrivée"
                      id="destination"
                      required
                      clearable
                    />
                  </div>
                </div>

                {/* Résultat itinéraire */}
                {isCalculatingRoute && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Calcul de l'itinéraire...
                  </div>
                )}
                {routeInfo && !isCalculatingRoute && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20 ml-6">
                    <Route className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{routeInfo.distanceText}</span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{routeInfo.durationText}</span>
                  </div>
                )}
              </div>

              {/* Date & Heure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date *</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure *</label>
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>

              {/* Passagers & Bagages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passagers</label>
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
                  <label className="text-sm font-medium">Chauffeur</label>
                  <Select value={formData.chauffeurId} onValueChange={(v) => setFormData(p => ({ ...p, chauffeurId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Aucun —</SelectItem>
                      {chauffeurs?.filter(c => c.status === 'disponible').map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Véhicule</label>
                  <Select value={formData.vehicleId} onValueChange={(v) => setFormData(p => ({ ...p, vehicleId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Aucun —</SelectItem>
                      {vehicles?.filter(v => v.status === 'disponible').map(v => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} ({v.registration})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tarification */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    Tarification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Taux TVA */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taux de TVA</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleVatChange('10')}
                        className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${formData.vatRate === '10' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'}`}
                      >
                        10% — Transfert
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVatChange('20')}
                        className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${formData.vatRate === '20' ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'}`}
                      >
                        20% — Mise à dispo
                      </button>
                    </div>
                  </div>

                  {/* Prix HT / TTC — saisie libre dans les deux sens */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Prix HT (€)
                        <span className="ml-1 text-xs text-muted-foreground">— calcule le TTC</span>
                      </label>
                      <Input
                        type="number"
                        name="priceHT"
                        value={formData.priceHT}
                        onChange={handlePriceHTChange}
                        placeholder="ex: 150.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Prix TTC (€)
                        <span className="ml-1 text-xs text-muted-foreground">— calcule le HT</span>
                      </label>
                      <Input
                        type="number"
                        name="priceTTC"
                        value={formData.priceTTC}
                        onChange={handlePriceTTCChange}
                        placeholder="ex: 165.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  {vatAmount && parseFloat(vatAmount) > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                      <span className="text-sm text-muted-foreground">TVA {formData.vatRate}%</span>
                      <Badge variant="outline" className="font-mono">{vatAmount} €</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  name="notes"
                  placeholder="Numéro de vol, informations particulières..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions spéciales</label>
                <Textarea
                  name="specialInstructions"
                  placeholder="Panneau avec nom, accueil VIP, eau minérale..."
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création...</>
                    : <><Save className="h-4 w-4 mr-2" /> Créer la mission</>
                  }
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/missions')}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
