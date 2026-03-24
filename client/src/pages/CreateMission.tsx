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

export default function CreateMission() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    type: 'airport', origin: '', destination: '', date: '', time: '',
    passengers: '1', luggage: '0', price: '', priceHT: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { alert('Veuillez sélectionner un client'); return; }
    const dateTime = formData.date && formData.time ? `${formData.date}T${formData.time}:00` : formData.date;
    const missionNumber = `MSN-${Date.now()}`;
    createMutation.mutate({
      number: missionNumber,
      clientId: parseInt(formData.clientId),
      chauffeurId: formData.chauffeurId ? parseInt(formData.chauffeurId) : undefined,
      vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      date: dateTime,
      passengers: parseInt(formData.passengers),
      luggage: parseInt(formData.luggage),
      price: formData.price ? parseInt(formData.price) : undefined,
      priceHT: formData.priceHT ? parseInt(formData.priceHT) : undefined,
      notes: formData.notes || undefined,
      specialInstructions: formData.specialInstructions || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/missions')}><ArrowLeft className="h-4 w-4" /></Button>
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
                <label className="text-sm font-medium">{t('missions.client')}</label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('missions.selectClient') || 'Sélectionner un client'} /></SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('demands.type')}</label>
                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airport">{t('demands.airport')}</SelectItem>
                    <SelectItem value="train">Transfert Gare / Train</SelectItem>
                    <SelectItem value="hotel">Transfert Hôtel</SelectItem>
                    <SelectItem value="cruise">Transfert Port / Croisière</SelectItem>
                    <SelectItem value="business">{t('demands.business')}</SelectItem>
                    <SelectItem value="event">{t('demands.event')}</SelectItem>
                    <SelectItem value="tour">{t('demands.tour')}</SelectItem>
                    <SelectItem value="disposal">Mise à disposition</SelectItem>
                    <SelectItem value="intercity">Transfert inter-villes</SelectItem>
                    <SelectItem value="other">{t('demands.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Route */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.origin')}</label>
                  <Input name="origin" value={formData.origin} onChange={handleChange} required placeholder={t('demands.originPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.destination')}</label>
                  <Input name="destination" value={formData.destination} onChange={handleChange} required placeholder={t('demands.destinationPlaceholder')} />
                </div>
              </div>
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.startDate')}</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.startTime')}</label>
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>
              {/* Passengers & Luggage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.passengers')}</label>
                  <Input type="number" name="passengers" value={formData.passengers} onChange={handleChange} min="1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.luggage')}</label>
                  <Input type="number" name="luggage" value={formData.luggage} onChange={handleChange} min="0" />
                </div>
              </div>
              {/* Chauffeur & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.chauffeur')}</label>
                  <Select value={formData.chauffeurId} onValueChange={(v) => setFormData(p => ({ ...p, chauffeurId: v }))}>
                    <SelectTrigger><SelectValue placeholder={t('missions.selectChauffeur')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">— {t('missions.selectChauffeur')} —</SelectItem>
                      {chauffeurs?.filter(c => c.status === 'disponible').map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('missions.vehicle')}</label>
                  <Select value={formData.vehicleId} onValueChange={(v) => setFormData(p => ({ ...p, vehicleId: v }))}>
                    <SelectTrigger><SelectValue placeholder={t('missions.selectVehicle')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">— {t('missions.selectVehicle')} —</SelectItem>
                      {vehicles?.filter(v => v.status === 'disponible').map(v => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} ({v.registration})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prix TTC (€)</label>
                  <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="150" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('quotes.priceHT')} (€)</label>
                  <Input type="number" name="priceHT" value={formData.priceHT} onChange={handleChange} placeholder="125" />
                </div>
              </div>
              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea name="notes" placeholder={t('missions.notesPlaceholder')} value={formData.notes} onChange={handleChange} rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('missions.specialInstructions') || 'Instructions spéciales'}</label>
                <Textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} rows={2} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('missions.create')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/missions')}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
