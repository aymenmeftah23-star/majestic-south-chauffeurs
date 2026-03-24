import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2, MapPin, Calendar, Users, Car, CreditCard, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

const TVA_RATE = 0.10; // TVA 10% pour le transport de personnes

export default function CreateMission() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    type: 'airport', origin: '', destination: '', date: '', time: '',
    passengers: '1', luggage: '0', price: '', priceHT: '',
    clientId: '', chauffeurId: '', vehicleId: '',
    notes: '', specialInstructions: '',
  });

  const { data: clientsList } = trpc.clients.list.useQuery();
  const { data: chauffeursList } = trpc.chauffeurs.list.useQuery();
  const { data: vehiclesList } = trpc.vehicles.list.useQuery();

  const createMutation = trpc.missions.create.useMutation({
    onSuccess: () => navigate('/missions'),
    onError: (err: any) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Calcul automatique TVA
      if (name === 'price' && value) {
        const ttc = parseFloat(value);
        updated.priceHT = String(Math.round(ttc / (1 + TVA_RATE)));
      } else if (name === 'priceHT' && value) {
        const ht = parseFloat(value);
        updated.price = String(Math.round(ht * (1 + TVA_RATE)));
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { alert('Veuillez selectionner un client'); return; }
    if (!formData.origin) { alert('Veuillez saisir le lieu de depart'); return; }
    if (!formData.destination) { alert('Veuillez saisir la destination'); return; }
    if (!formData.date) { alert('Veuillez saisir la date'); return; }

    const dateTime = formData.date && formData.time ? `${formData.date}T${formData.time}:00` : `${formData.date}T00:00:00`;

    createMutation.mutate({
      clientId: parseInt(formData.clientId),
      chauffeurId: formData.chauffeurId && formData.chauffeurId !== 'unassigned' ? parseInt(formData.chauffeurId) : undefined,
      vehicleId: formData.vehicleId && formData.vehicleId !== 'unassigned' ? parseInt(formData.vehicleId) : undefined,
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      date: dateTime,
      status: 'a_confirmer',
      passengers: parseInt(formData.passengers) || 1,
      luggage: parseInt(formData.luggage) || 0,
      price: formData.price ? parseFloat(formData.price) : undefined,
      priceHT: formData.priceHT ? parseFloat(formData.priceHT) : undefined,
      notes: formData.notes || undefined,
      specialInstructions: formData.specialInstructions || undefined,
    });
  };

  const tvaAmount = formData.price && formData.priceHT
    ? (parseInt(formData.price) - parseInt(formData.priceHT))
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/missions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouvelle mission</h1>
            <p className="text-muted-foreground mt-1">Creer une nouvelle mission de transport</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client & Type */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Client et type de service</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client *</label>
                  <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selectionner un client" /></SelectTrigger>
                    <SelectContent>
                      {clientsList?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.company ? ` (${c.company})` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de service *</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airport">Transfert Aeroport</SelectItem>
                      <SelectItem value="train">Transfert Gare / Train</SelectItem>
                      <SelectItem value="hotel">Transfert Hotel</SelectItem>
                      <SelectItem value="cruise">Transfert Port / Croisiere</SelectItem>
                      <SelectItem value="business">Deplacement Affaires</SelectItem>
                      <SelectItem value="event">Evenement</SelectItem>
                      <SelectItem value="tour">Circuit Touristique</SelectItem>
                      <SelectItem value="disposal">Mise a disposition</SelectItem>
                      <SelectItem value="intercity">Transfert inter-villes</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trajet */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Trajet</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lieu de depart *</label>
                  <AddressAutocomplete
                    name="origin"
                    value={formData.origin}
                    onChange={(v) => setFormData(p => ({ ...p, origin: v }))}
                    required
                    placeholder="Ex: Aeroport Marseille Provence"
                    variant="admin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination *</label>
                  <AddressAutocomplete
                    name="destination"
                    value={formData.destination}
                    onChange={(v) => setFormData(p => ({ ...p, destination: v }))}
                    required
                    placeholder="Ex: Hotel InterContinental Marseille"
                    variant="admin"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Passagers */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Date et passagers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date *</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure</label>
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} />
                </div>
              </div>
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
            </CardContent>
          </Card>

          {/* Chauffeur & Vehicule */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> Chauffeur et vehicule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chauffeur</label>
                  <Select value={formData.chauffeurId} onValueChange={(v) => setFormData(p => ({ ...p, chauffeurId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Assigner un chauffeur" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">-- Non assigne --</SelectItem>
                      {chauffeursList?.filter((c: any) => c.status === 'disponible').map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicule</label>
                  <Select value={formData.vehicleId} onValueChange={(v) => setFormData(p => ({ ...p, vehicleId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Assigner un vehicule" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">-- Non assigne --</SelectItem>
                      {vehiclesList?.filter((v: any) => v.status === 'disponible').map((v: any) => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} ({v.licensePlate || v.registration})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarification */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Tarification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix TTC</label>
                  <div className="relative">
                    <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0" className="pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EUR</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix HT</label>
                  <div className="relative">
                    <Input type="number" name="priceHT" value={formData.priceHT} onChange={handleChange} placeholder="0" className="pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EUR</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">TVA (10%)</label>
                  <div className="relative">
                    <Input type="number" value={tvaAmount} readOnly className="pr-8 bg-muted" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EUR</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Le calcul HT/TTC est automatique (TVA 10% transport de personnes). Modifiez l'un des deux champs.</p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Notes et instructions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes internes</label>
                <Textarea name="notes" placeholder="Notes visibles uniquement par l'equipe..." value={formData.notes} onChange={handleChange} rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions speciales (chauffeur)</label>
                <Textarea name="specialInstructions" placeholder="Instructions pour le chauffeur (panneau nom, numero de vol, etc.)" value={formData.specialInstructions} onChange={handleChange} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Creer la mission
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/missions')}>Annuler</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
