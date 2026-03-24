import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, User, Car, Euro, Loader2, Trash2, FileText, CreditCard, Pencil } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

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
  non_paye: 'Non payée',
  paye: 'Payée',
  remboursement: 'Remboursement',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  non_paye: 'bg-orange-100 text-orange-800',
  paye: 'bg-green-100 text-green-800',
  remboursement: 'bg-blue-100 text-blue-800',
};

export default function MissionDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: mission, isLoading, refetch } = trpc.missions.getById.useQuery({ id }, { enabled: !!id });
  const { data: chauffeurs } = trpc.chauffeurs.list.useQuery();
  const { data: vehicles } = trpc.vehicles.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

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

  const chauffeur = chauffeurs?.find(c => c.id === mission.chauffeurId);
  const vehicle = vehicles?.find(v => v.id === mission.vehicleId);
  const client = clients?.find(c => c.id === mission.clientId);

  const vatRate = (mission as any).vatRate ?? 20;
  const priceTTC = mission.price ?? 0;
  const priceHT = mission.priceHT ?? 0;
  const vatAmount = priceTTC - priceHT;

  const handleDelete = () => {
    if (confirm('Supprimer cette mission ?')) deleteMutation.mutate({ id });
  };

  const handlePaymentStatusChange = (paymentStatus: string) => {
    updateMutation.mutate({ id, paymentStatus: paymentStatus as any });
  };

  const handleVatChange = (vatRate: string) => {
    updateMutation.mutate({ id, vatRate: parseInt(vatRate) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/missions')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Mission {mission.number || `#${mission.id}`}
              </h1>
              <p className="text-muted-foreground">
                {new Date(mission.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' à '}
                {new Date(mission.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={STATUS_COLORS[mission.status || 'a_confirmer']}>
              {STATUS_LABELS[mission.status || 'a_confirmer'] || mission.status}
            </Badge>
            {nextStatus && (
              <Button size="sm" onClick={() => updateMutation.mutate({ id, status: nextStatus as any })} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `→ ${STATUS_LABELS[nextStatus]}`}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/pdf/mission/${id}`, '_blank')}>
              <FileText className="h-4 w-4 mr-1" />
              Bon de mission
            </Button>
            <Button variant="outline" size="sm" className="border-amber-500 text-amber-700 hover:bg-amber-50" onClick={() => window.open(`/api/pdf/fiche/${id}`, '_blank')}>
              <FileText className="h-4 w-4 mr-1" />
              Fiche de mission
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/missions/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1" />
              Modifier
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Itinéraire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Itinéraire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(mission as any).type && (
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{(mission as any).type}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Adresse de départ</p>
                <p className="font-medium">{mission.origin}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Adresse d'arrivée</p>
                <p className="font-medium">{mission.destination}</p>
              </div>
              <Separator />
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Passagers</p>
                  <p className="font-medium">{mission.passengers ?? 1}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bagages</p>
                  <p className="font-medium">{mission.luggage ?? 0}</p>
                </div>
              </div>
              {client && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{client.name}</p>
                    {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tarification avec TVA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Tarification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Prix HT</span>
                <span className="font-medium">{priceHT > 0 ? `${priceHT.toFixed(2)} €` : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  TVA ({vatRate}%)
                  <span className="ml-1 text-xs text-muted-foreground/70">
                    {vatRate === 10 ? '— Transfert' : '— Mise à dispo'}
                  </span>
                </span>
                <span className="font-medium">{vatAmount > 0 ? `${vatAmount.toFixed(2)} €` : '—'}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Prix TTC</span>
                <span className="font-bold text-xl text-primary">{priceTTC > 0 ? `${priceTTC.toFixed(2)} €` : '—'}</span>
              </div>

              {/* Changer taux TVA */}
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Modifier le taux de TVA</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleVatChange('10')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      vatRate === 10 ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    10% — Transferts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVatChange('20')}
                    className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      vatRate === 20 ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    20% — Mise à dispo
                  </button>
                </div>
              </div>

              <Separator />

              {/* Statut paiement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Statut paiement
                  </span>
                  <Badge className={PAYMENT_STATUS_COLORS[mission.paymentStatus || 'non_paye']}>
                    {PAYMENT_STATUS_LABELS[mission.paymentStatus || 'non_paye']}
                  </Badge>
                </div>
                <Select
                  value={mission.paymentStatus || 'non_paye'}
                  onValueChange={handlePaymentStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_paye">Non payée</SelectItem>
                    <SelectItem value="paye">Payée</SelectItem>
                    <SelectItem value="remboursement">Remboursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Chauffeur */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Chauffeur
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chauffeur ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{chauffeur.name}</p>
                  {chauffeur.phone && <p className="text-sm text-muted-foreground">{chauffeur.phone}</p>}
                  {chauffeur.email && <p className="text-sm text-muted-foreground">{chauffeur.email}</p>}
                  <Badge variant="outline" className={chauffeur.status === 'disponible' ? 'text-green-700 border-green-300' : 'text-orange-700 border-orange-300'}>
                    {chauffeur.status}
                  </Badge>
                  <div className="pt-1">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/chauffeurs/${mission.chauffeurId}`)}>
                      Voir le profil
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">Aucun chauffeur assigné</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/chauffeurs')}>
                    Assigner un chauffeur
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Véhicule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Véhicule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.registration} — {vehicle.category}</p>
                  {vehicle.color && <p className="text-sm text-muted-foreground">Couleur : {vehicle.color}</p>}
                  <Badge variant="outline" className={vehicle.status === 'disponible' ? 'text-green-700 border-green-300' : 'text-orange-700 border-orange-300'}>
                    {vehicle.status}
                  </Badge>
                  <div className="pt-1">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/vehicles/${mission.vehicleId}`)}>
                      Voir le véhicule
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">Aucun véhicule assigné</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/vehicles')}>
                    Assigner un véhicule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {(mission.notes || mission.specialInstructions) && (
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mission.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{mission.notes}</p>
                </div>
              )}
              {mission.specialInstructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800">Instructions spéciales</p>
                  <p className="text-sm text-yellow-700 mt-1">{mission.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
