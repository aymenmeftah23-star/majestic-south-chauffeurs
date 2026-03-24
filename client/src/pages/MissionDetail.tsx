import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, User, Car, Clock, Euro, Loader2, Edit, Trash2 } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

const STATUS_LABELS: Record<string, string> = {
  a_confirmer: 'À confirmer',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  chauffeur_assigne: 'Chauffeur assigné',
  vehicule_assigne: 'Véhicule assigné',
  prete: 'Prête',
  en_cours: 'En cours',
  client_pris_en_charge: 'Client pris en charge',
  terminee: 'Terminée',
  annulee: 'Annulée',
  litige: 'Litige',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  non_paye: 'Non payé',
  paye: 'Payé',
  remboursement: 'Remboursement',
};

const STATUS_COLORS: Record<string, string> = {
  a_confirmer: 'bg-yellow-100 text-yellow-800',
  confirmee: 'bg-blue-100 text-blue-800',
  en_preparation: 'bg-orange-100 text-orange-800',
  chauffeur_assigne: 'bg-purple-100 text-purple-800',
  vehicule_assigne: 'bg-indigo-100 text-indigo-800',
  prete: 'bg-cyan-100 text-cyan-800',
  en_cours: 'bg-green-100 text-green-800',
  client_pris_en_charge: 'bg-teal-100 text-teal-800',
  terminee: 'bg-gray-100 text-gray-800',
  annulee: 'bg-red-100 text-red-800',
  litige: 'bg-red-200 text-red-900',
};

export default function MissionDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: mission, isLoading, refetch } = trpc.missions.getById.useQuery({ id }, { enabled: !!id });

  const updateMutation = trpc.missions.update.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.missions.delete.useMutation({ onSuccess: () => navigate('/missions') });

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  if (!mission) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Mission introuvable</p>
        <Button className="mt-4" onClick={() => navigate('/missions')}>{t('common.back')}</Button>
      </div>
    </DashboardLayout>
  );

  const statusWorkflow = [
    'a_confirmer', 'confirmee', 'en_preparation', 'chauffeur_assigne',
    'vehicule_assigne', 'prete', 'en_cours', 'client_pris_en_charge', 'terminee'
  ];
  const currentIdx = statusWorkflow.indexOf(mission.status || 'a_confirmer');
  const nextStatus = currentIdx < statusWorkflow.length - 1 ? statusWorkflow[currentIdx + 1] : null;

  const handleDelete = () => {
    if (confirm('Supprimer cette mission ?')) deleteMutation.mutate({ id });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/missions')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('missions.detail')} {mission.number ? `#${mission.number}` : `#${mission.id}`}</h1>
              <p className="text-muted-foreground">{new Date(mission.date ?? mission.startDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[mission.status || 'a_confirmer']}>{STATUS_LABELS[mission.status || 'a_confirmer'] ?? mission.status}</Badge>
            {nextStatus && (
              <Button size="sm" onClick={() => updateMutation.mutate({ id, status: nextStatus as any })} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `→ ${STATUS_LABELS[nextStatus] ?? nextStatus}`}
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{t('missions.route')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('missions.origin')}</p>
                <p className="font-medium">{mission.origin}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">{t('missions.destination')}</p>
                <p className="font-medium">{mission.destination}</p>
              </div>
              <Separator />
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('missions.passengers')}</p>
                  <p className="font-medium">{mission.passengers ?? 1}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('demands.luggage')}</p>
                  <p className="font-medium">{mission.luggage ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="h-5 w-5" />{t('missions.pricing')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quotes.priceTTC')}</span>
                <span className="font-bold text-lg">{mission.price ? `${mission.price} €` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quotes.priceHT')}</span>
                <span>{mission.priceHT ? `${mission.priceHT} €` : '—'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('missions.paymentStatus')}</span>
                <Badge variant={mission.paymentStatus === 'paye' ? 'default' : 'outline'}>{PAYMENT_STATUS_LABELS[mission.paymentStatus || 'non_paye'] ?? mission.paymentStatus}</Badge>
              </div>
              {mission.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('missions.paymentMethod')}</span>
                  <span>{mission.paymentMethod}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chauffeur */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t('missions.chauffeur')}</CardTitle></CardHeader>
            <CardContent>
              {mission.chauffeurId ? (
                <div className="space-y-2">
                  <p className="font-medium">{(mission as any).chauffeurName ?? `Chauffeur #${mission.chauffeurId}`}</p>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/chauffeurs/${mission.chauffeurId}`)}>
                    {t('common.viewDetails')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">{t('missions.noChauffeur')}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/chauffeurs')}>
                    {t('missions.assignChauffeur')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" />{t('missions.vehicle')}</CardTitle></CardHeader>
            <CardContent>
              {mission.vehicleId ? (
                <div className="space-y-2">
                  <p className="font-medium">{(mission as any).vehicleName ?? `Véhicule #${mission.vehicleId}`}</p>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/vehicles/${mission.vehicleId}`)}>
                    {t('common.viewDetails')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">{t('missions.noVehicle')}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/vehicles')}>
                    {t('missions.assignVehicle')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {(mission.notes || mission.specialInstructions) && (
          <Card>
            <CardHeader><CardTitle>{t('common.notes')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mission.notes && <p className="text-sm">{mission.notes}</p>}
              {mission.specialInstructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800">{t('missions.specialInstructions')}</p>
                  <p className="text-sm text-yellow-700 mt-1">{mission.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Avis clients existants */}
        <ReviewsList missionId={id} />

        {/* Formulaire de notation (visible seulement pour les missions terminées) */}
        {mission.status === 'terminee' && (
          <ReviewForm
            missionId={id}
            clientId={mission.clientId}
            chauffeurId={mission.chauffeurId ?? undefined}
            onSuccess={() => refetch()}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
