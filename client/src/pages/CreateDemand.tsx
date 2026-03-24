import { toast } from 'sonner';
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

export default function CreateDemand() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    clientId: '', type: 'airport', origin: '', destination: '',
    date: '', time: '', passengers: '1', luggage: '0',
    vehicleType: '', priority: 'normale', message: '',
  });

  const { data: clients } = trpc.clients.list.useQuery();

  const createMutation = trpc.demands.create.useMutation({
    onSuccess: () => navigate('/demands'),
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { toast.error('Veuillez sélectionner un client'); return; }
    const dateTime = formData.date && formData.time ? `${formData.date}T${formData.time}:00` : formData.date;
    createMutation.mutate({
      clientId: parseInt(formData.clientId),
      type: formData.type,
      origin: formData.origin,
      destination: formData.destination,
      date: dateTime,
      passengers: parseInt(formData.passengers),
      luggage: parseInt(formData.luggage),
      vehicleType: formData.vehicleType || undefined,
      priority: formData.priority as any,
      message: formData.message || undefined,
      source: 'backoffice',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/demands')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('demands.new')}</h1>
            <p className="text-muted-foreground mt-1">{t('demands.createNew')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('missions.client')}</label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({ ...p, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.type')}</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airport">{t('demands.airport')}</SelectItem>
                      <SelectItem value="business">{t('demands.business')}</SelectItem>
                      <SelectItem value="event">{t('demands.event')}</SelectItem>
                      <SelectItem value="tour">{t('demands.tour')}</SelectItem>
                      <SelectItem value="other">{t('demands.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.priority')}</label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basse">{t('demands.low')}</SelectItem>
                      <SelectItem value="normale">{t('demands.normal')}</SelectItem>
                      <SelectItem value="haute">{t('demands.high')}</SelectItem>
                      <SelectItem value="urgente">{t('demands.urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Route */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.origin')}</label>
                  <Input name="origin" value={formData.origin} onChange={handleChange} required placeholder={t('demands.originPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.destination')}</label>
                  <Input name="destination" value={formData.destination} onChange={handleChange} required placeholder={t('demands.destinationPlaceholder')} />
                </div>
              </div>
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.date')}</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.time')}</label>
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>
              {/* Passengers & Luggage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.passengers')}</label>
                  <Input type="number" name="passengers" value={formData.passengers} onChange={handleChange} min="1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('demands.luggage')}</label>
                  <Input type="number" name="luggage" value={formData.luggage} onChange={handleChange} min="0" />
                </div>
              </div>
              {/* Vehicle Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('demands.vehicleType')}</label>
                <Select value={formData.vehicleType} onValueChange={(v) => setFormData(p => ({ ...p, vehicleType: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('chauffeurs.selectVehicleType')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="berline">Berline</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="limousine">Limousine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('demands.message')}</label>
                <Textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Message du client..." />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('demands.new')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/demands')}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
