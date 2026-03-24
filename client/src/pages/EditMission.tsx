import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Route, Clock, Plus, Trash2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
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

const STATUSES = [
  { value: 'a_confirmer', label: 'À confirmer' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'chauffeur_assigne', label: 'Chauffeur assigné' },
  { value: 'vehicule_assigne', label: 'Véhicule assigné' },
  { value: 'prete', label: 'Prête' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'client_pris_en_charge', label: 'Client pris en charge' },
  { value: 'terminee', label: 'Terminée' },
  { value: 'annulee', label: 'Annulée' },
  { value: 'litige', label: 'Litige' },
];

interface StopPoint { address: string; time: string; note: string; }

export default function EditMission() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: mission, isLoading } = trpc.missions.getById.useQuery({ id }, { enabled: !!id });
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: chauffeurs } = trpc.chauffeurs.list.useQuery();
  const { data: vehicles } = trpc.vehicles.list.useQuery();

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
    status: 'a_confirmer',
    clientId: '',
    chauffeurId: '',
    vehicleId: '',
    notes: '',
    specialInstructions: '',
  });
  const [stops, setStops] = useState<StopPoint[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    if (mission) {
      const missionDate = mission.date ? new Date(mission.date) : null;
      const dateStr = missionDate ? missionDate.toISOString().split('T')[0] : '';
      const timeStr = missionDate ? missionDate.toTimeString().slice(0, 5) : '';
      setFormData({
        type: mission.type || 'Transfert',
        origin: mission.origin || '',
        destination: mission.destination || '',
        date: dateStr,
        time: timeStr,
        passengers: String(mission.passengers || 1),
        luggage: String((mission as any).luggage || 0),
        priceTTC: mission.price ? String(mission.price) : '',
        priceHT: (mission as any).priceHT ? String((mission as any).priceHT) : '',
        vatRate: String((mission as any).vatRate || 10),
        priceInputMode: 'ttc',
        status: mission.status || 'a_confirmer',
        clientId: mission.clientId ? String(mission.clientId) : '',
        chauffeurId: mission.chauffeurId ? String(mission.chauffeurId) : '',
        vehicleId: mission.vehicleId ? String(mission.vehicleId) : '',
        notes: mission.notes || '',
        specialInstructions: (mission as any).specialInstructions || '',
      });
    }
  }, [mission]);

  const updateMutation = trpc.missions.update.useMutation({
    onSuccess: () => navigate(`/missions/${id}`),
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

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
  const handleDestinationChange = (value: string, lat?: number) => {
    setFormData(prev => ({ ...prev, destination: value }));
    if (lat && formData.origin) computeRoute(formData.origin, value);
  };

  const handlePriceHTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ht = parseFloat(e.target.value);
    const vat = parseFloat(formData.vatRate) / 100;
    const ttc = !isNaN(ht) ? (ht * (1 + vat)).toFixed(2) : '';
    setFormData(prev => ({ ...prev, priceHT: e.target.value, priceTTC: ttc, priceInputMode: 'ht' }));
  };
  const handlePriceTTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ttc = parseFloat(e.target.value);
    const vat = parseFloat(formData.vatRate) / 100;
    const ht = !isNaN(ttc) ? (ttc / (1 + vat)).toFixed(2) : '';
    setFormData(prev => ({ ...prev, priceTTC: e.target.value, priceHT: ht, priceInputMode: 'ttc' }));
  };
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

  const addStop = () => setStops(prev => [...prev, { address: '', time: '', note: '' }]);
  const removeStop = (i: number) => setStops(prev => prev.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: keyof StopPoint, value: string) => {
    setStops(prev => { const s = [...prev]; s[i] = { ...s[i], [field]: value }; return s; });
  };

  const vatAmount = formData.priceTTC && formData.priceHT
    ? (parseFloat(formData.priceTTC) - parseFloat(formData.priceHT)).toFixed(2)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { toast.error('Veuillez sélectionner un client'); return; }
    const stopsNote = stops.length > 0
      ? '\nÉtapes : ' + stops.map((s, i) => `${i + 1}. ${s.address}${s.time ? ' à ' + s.time : ''}${s.note ? ' (' + s.note + ')' : ''}`).join(' | ')
      : '';
    updateMutation.mutate({
      id,
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
      status: formData.status as any,
      notes: (formData.notes || '') + stopsNote || undefined,
      specialInstructions: formData.specialInstructions || undefined,
    });
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/missions/${id}`)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier la mission</h1>
            <p className="text-muted-foreground mt-1">{mission?.number}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Statut */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Client */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Client *</label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.company ? ` — ${c.company}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de mission</label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MISSION_TYPES.map(mt => <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Adresses */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse de départ *</label>
                  <AddressAutocomplete
                    value={formData.origin}
                    onChange={handleOriginChange}
                    placeholder="Adresse de départ..."
                  />
                </div>

                {/* Étapes intermédiaires */}
                {stops.map((stop, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Étape {i + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeStop(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <AddressAutocomplete
                      value={stop.address}
                      onChange={(v) => updateStop(i, 'address', v)}
                      placeholder="Adresse de l'étape..."
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="time" value={stop.time} onChange={e => updateStop(i, 'time', e.target.value)} placeholder="Heure" />
                      <Input value={stop.note} onChange={e => updateStop(i, 'note', e.target.value)} placeholder="Note (optionnel)" />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={addStop} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter une étape intermédiaire
                </Button>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse d'arrivée *</label>
                  <AddressAutocomplete
                    value={formData.destination}
                    onChange={handleDestinationChange}
                    placeholder="Adresse d'arrivée..."
                  />
                </div>
              </div>

              {/* Info itinéraire */}
              {isCalculatingRoute && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Calcul de l'itinéraire...
                </div>
              )}
              {routeInfo && (
                <div className="flex gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Route className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{routeInfo.distanceText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{routeInfo.durationText}</span>
                  </div>
                </div>
              )}

              {/* Date et heure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date *</label>
                  <Input type="date" name="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure *</label>
                  <Input type="time" name="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} required />
                </div>
              </div>

              {/* Passagers et bagages */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passagers</label>
                  <Input type="number" min="1" max="20" value={formData.passengers} onChange={e => setFormData(p => ({ ...p, passengers: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bagages</label>
                  <Input type="number" min="0" max="20" value={formData.luggage} onChange={e => setFormData(p => ({ ...p, luggage: e.target.value }))} />
                </div>
              </div>

              {/* Tarification */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tarification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taux de TVA</label>
                    <Select value={formData.vatRate} onValueChange={handleVatChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">TVA 10% (Transferts)</SelectItem>
                        <SelectItem value="20">TVA 20% (Mise à disposition)</SelectItem>
                        <SelectItem value="0">Exonéré de TVA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix HT (€)</label>
                      <Input type="number" step="0.01" min="0" value={formData.priceHT} onChange={handlePriceHTChange} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix TTC (€)</label>
                      <Input type="number" step="0.01" min="0" value={formData.priceTTC} onChange={handlePriceTTCChange} placeholder="0.00" />
                    </div>
                  </div>
                  {vatAmount && (
                    <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <span className="text-muted-foreground">TVA {formData.vatRate}% calculée :</span>
                      <Badge variant="outline">{vatAmount} €</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chauffeur et véhicule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chauffeur</label>
                  <Select value={formData.chauffeurId || 'none'} onValueChange={(v) => setFormData(p => ({ ...p, chauffeurId: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {chauffeurs?.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Véhicule</label>
                  <Select value={formData.vehicleId || 'none'} onValueChange={(v) => setFormData(p => ({ ...p, vehicleId: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {vehicles?.map(v => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} — {v.licensePlate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Notes internes..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions spéciales</label>
                <Textarea value={formData.specialInstructions} onChange={e => setFormData(p => ({ ...p, specialInstructions: e.target.value }))} rows={2} placeholder="Instructions pour le chauffeur..." />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer les modifications
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(`/missions/${id}`)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
