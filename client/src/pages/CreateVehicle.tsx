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

export default function CreateVehicle() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    brand: '', model: '', registration: '', category: 'premium',
    color: '', year: '', seats: '4', luggage: '3', mileage: '',
    status: 'disponible' as 'disponible' | 'reserve' | 'en_mission' | 'entretien' | 'indisponible' | 'hors_service',
    nextMaintenance: '', notes: '',
  });

  const createMutation = trpc.vehicles.create.useMutation({
    onSuccess: () => navigate('/vehicles'),
    onError: (err) => alert('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      brand: formData.brand,
      model: formData.model,
      registration: formData.registration,
      category: formData.category,
      color: formData.color || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      seats: formData.seats ? parseInt(formData.seats) : undefined,
      luggage: formData.luggage ? parseInt(formData.luggage) : undefined,
      mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      status: formData.status,
      nextMaintenance: formData.nextMaintenance || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('vehicles.create')}</h1>
            <p className="text-muted-foreground mt-1">{t('vehicles.createDesc')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.brand')}</label>
                  <Input name="brand" value={formData.brand} onChange={handleChange} required placeholder="Mercedes, BMW..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.model')}</label>
                  <Input name="model" value={formData.model} onChange={handleChange} required placeholder="Classe E, Série 5..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.registration')}</label>
                  <Input name="registration" value={formData.registration} onChange={handleChange} required placeholder="AB-123-CD" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.color')}</label>
                  <Input name="color" value={formData.color} onChange={handleChange} placeholder="Noir, Blanc..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.category')}</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economique">{t('vehicles.economique')}</SelectItem>
                      <SelectItem value="confort">{t('vehicles.confort')}</SelectItem>
                      <SelectItem value="premium">{t('vehicles.premium')}</SelectItem>
                      <SelectItem value="luxe">{t('vehicles.luxe')}</SelectItem>
                      <SelectItem value="van">{t('vehicles.van')}</SelectItem>
                      <SelectItem value="suv">SUV Premium</SelectItem>
                      <SelectItem value="minibus">Minibus (8-16 places)</SelectItem>
                      <SelectItem value="electrique">Électrique / Hybride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.status')}</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">{t('vehicles.available')}</SelectItem>
                      <SelectItem value="reserve">Réservé</SelectItem>
                      <SelectItem value="en_mission">En mission</SelectItem>
                      <SelectItem value="entretien">{t('status.maintenance')}</SelectItem>
                      <SelectItem value="indisponible">{t('common.inactive')}</SelectItem>
                      <SelectItem value="hors_service">Hors service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.year')}</label>
                  <Input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="2023" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.seats')}</label>
                  <Input type="number" name="seats" value={formData.seats} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('vehicles.mileage')}</label>
                  <Input type="number" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="50000" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('vehicles.nextMaintenance')}</label>
                <Input type="date" name="nextMaintenance" value={formData.nextMaintenance} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.notes')}</label>
                <Textarea name="notes" placeholder={t('vehicles.notesPlaceholder')} value={formData.notes} onChange={handleChange} rows={4} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('vehicles.create')}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/vehicles')}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
