import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Calendar, Gauge, Users, Loader2, Trash2, Wrench } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS: Record<string, string> = {
  disponible: 'bg-green-100 text-green-800',
  reserve: 'bg-yellow-100 text-yellow-800',
  en_mission: 'bg-blue-100 text-blue-800',
  entretien: 'bg-orange-100 text-orange-800',
  indisponible: 'bg-red-100 text-red-800',
  hors_service: 'bg-gray-100 text-gray-800',
};

export default function VehicleDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: vehicle, isLoading, refetch } = trpc.vehicles.getById.useQuery({ id }, { enabled: !!id });
  const updateMutation = trpc.vehicles.update.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.vehicles.delete.useMutation({ onSuccess: () => navigate('/vehicles') });

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
  if (!vehicle) return <DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Vehicule introuvable</p><Button className="mt-4" onClick={() => navigate('/vehicles')}>{t('common.back')}</Button></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-muted-foreground">{vehicle.registration} {vehicle.color ? `• ${vehicle.color}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[vehicle.status || 'disponible']}>{vehicle.status}</Badge>
            {vehicle.status !== 'entretien' && (
              <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id, status: 'entretien' })}>
                <Wrench className="h-4 w-4 mr-1" />{t('status.maintenance')}
              </Button>
            )}
            {vehicle.status === 'entretien' && (
              <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id, status: 'disponible' })}>
                {t('vehicles.available')}
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => confirm('Supprimer ?') && deleteMutation.mutate({ id })} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" />{t('vehicles.specs')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('vehicles.category')}</span><span className="font-medium capitalize">{vehicle.category}</span></div>
              {vehicle.year && <div className="flex justify-between"><span className="text-muted-foreground">{t('vehicles.year')}</span><span>{vehicle.year}</span></div>}
              {vehicle.seats && <div className="flex justify-between"><span className="text-muted-foreground"><Users className="h-4 w-4 inline mr-1" />{t('vehicles.seats')}</span><span>{vehicle.seats}</span></div>}
              {vehicle.luggage && <div className="flex justify-between"><span className="text-muted-foreground">{t('vehicles.luggage')}</span><span>{vehicle.luggage}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />{t('vehicles.maintenance')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {vehicle.mileage && <div className="flex justify-between"><span className="text-muted-foreground"><Gauge className="h-4 w-4 inline mr-1" />{t('vehicles.mileage')}</span><span>{vehicle.mileage.toLocaleString()} km</span></div>}
              {vehicle.nextMaintenance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground"><Calendar className="h-4 w-4 inline mr-1" />{t('vehicles.nextMaintenance')}</span>
                  <span>{new Date(vehicle.nextMaintenance).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {vehicle.notes && (
            <Card className="md:col-span-2">
              <CardHeader><CardTitle>{t('common.notes')}</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{vehicle.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
