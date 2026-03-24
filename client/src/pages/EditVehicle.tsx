import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function EditVehicle() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: vehicle, isLoading } = trpc.vehicles.getById.useQuery({ id }, { enabled: !!id });

  const [formData, setFormData] = useState({
    brand: '', model: '', registration: '', category: 'premium',
    color: '', year: '', seats: '4', luggage: '3', mileage: '',
    status: 'disponible' as 'disponible' | 'reserve' | 'en_mission' | 'entretien' | 'indisponible' | 'hors_service',
    nextMaintenance: '', notes: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        registration: vehicle.licensePlate || '',
        category: vehicle.category || 'premium',
        color: vehicle.color || '',
        year: vehicle.year ? String(vehicle.year) : '',
        seats: vehicle.seats ? String(vehicle.seats) : '4',
        luggage: (vehicle as any).luggage ? String((vehicle as any).luggage) : '3',
        mileage: vehicle.mileage ? String(vehicle.mileage) : '',
        status: (vehicle.status as any) || 'disponible',
        nextMaintenance: vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toISOString().split('T')[0] : '',
        notes: vehicle.notes || '',
      });
    }
  }, [vehicle]);

  const updateMutation = trpc.vehicles.update.useMutation({
    onSuccess: () => navigate(`/vehicles/${id}`),
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id,
      brand: formData.brand,
      model: formData.model,
      licensePlate: formData.registration,
      category: formData.category,
      color: formData.color || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      seats: formData.seats ? parseInt(formData.seats) : undefined,
      mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      status: formData.status,
      nextMaintenance: formData.nextMaintenance ? new Date(formData.nextMaintenance) : undefined,
      notes: formData.notes || undefined,
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
          <Button variant="ghost" size="icon" onClick={() => navigate(`/vehicles/${id}`)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier le véhicule</h1>
            <p className="text-muted-foreground mt-1">{vehicle?.brand} {vehicle?.model}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Marque *</label>
                  <Input name="brand" value={formData.brand} onChange={handleChange} required placeholder="Mercedes, BMW..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modèle *</label>
                  <Input name="model" value={formData.model} onChange={handleChange} required placeholder="Classe E, Série 5..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Immatriculation *</label>
                  <Input name="registration" value={formData.registration} onChange={handleChange} required placeholder="AB-123-CD" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Couleur</label>
                  <Input name="color" value={formData.color} onChange={handleChange} placeholder="Noir, Blanc..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economique">Économique</SelectItem>
                      <SelectItem value="confort">Confort</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="luxe">Luxe</SelectItem>
                      <SelectItem value="van">Van / Minibus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="en_mission">En mission</SelectItem>
                      <SelectItem value="reserve">Réservé</SelectItem>
                      <SelectItem value="entretien">En entretien</SelectItem>
                      <SelectItem value="indisponible">Indisponible</SelectItem>
                      <SelectItem value="hors_service">Hors service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Année</label>
                  <Input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="2023" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Places</label>
                  <Input type="number" name="seats" value={formData.seats} onChange={handleChange} min="1" max="20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kilométrage</label>
                  <Input type="number" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="50000" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prochaine maintenance</label>
                <Input type="date" name="nextMaintenance" value={formData.nextMaintenance} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes internes</label>
                <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Notes internes..." />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer les modifications
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(`/vehicles/${id}`)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
