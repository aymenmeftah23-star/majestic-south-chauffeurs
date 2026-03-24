import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Phone, Mail, Building, MapPin, Loader2, Trash2, Star } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

const TYPE_COLORS: Record<string, string> = {
  particulier: 'bg-gray-100 text-gray-800',
  business: 'bg-blue-100 text-blue-800',
  hotel: 'bg-purple-100 text-purple-800',
  agence: 'bg-indigo-100 text-indigo-800',
  partenaire: 'bg-green-100 text-green-800',
  vip: 'bg-yellow-100 text-yellow-800',
};

const TYPE_LABELS: Record<string, string> = {
  particulier: 'Particulier',
  business: 'Entreprise',
  hotel: 'Hôtel',
  agence: 'Agence',
  partenaire: 'Partenaire',
  vip: 'VIP',
};

const MISSION_STATUS_LABELS: Record<string, string> = {
  a_confirmer: 'À confirmer',
  planifiee: 'Planifiée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

const MISSION_STATUS_COLORS: Record<string, string> = {
  a_confirmer: 'bg-yellow-100 text-yellow-800',
  planifiee: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-indigo-100 text-indigo-800',
  terminee: 'bg-green-100 text-green-800',
  annulee: 'bg-red-100 text-red-800',
};

export default function ClientDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id }, { enabled: !!id });
  const { data: missions } = trpc.missions.list.useQuery();
  const deleteMutation = trpc.clients.delete.useMutation({ onSuccess: () => navigate('/clients') });

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
  if (!client) return <DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Client introuvable</p><Button className="mt-4" onClick={() => navigate('/clients')}>{t('common.back')}</Button></div></DashboardLayout>;

  const clientMissions = missions?.filter(m => m.clientId === id) || [];
  const completedMissions = clientMissions.filter(m => m.status === 'terminee');
  const totalRevenue = completedMissions.reduce((sum, m) => sum + (m.price || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              {client.company && <p className="text-muted-foreground">{client.company}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={TYPE_COLORS[client.type || 'particulier']}>{TYPE_LABELS[client.type || 'particulier'] || client.type}</Badge>
            <Button size="sm" onClick={() => navigate('/missions/new')}>+ {t('missions.create')}</Button>
            <Button variant="destructive" size="sm" onClick={() => confirm('Supprimer ?') && deleteMutation.mutate({ id })} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{clientMissions.length}</p>
              <p className="text-sm text-muted-foreground">{t('clients.totalMissions')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{completedMissions.length}</p>
              <p className="text-sm text-muted-foreground">{t('clients.completedMissions')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{totalRevenue} €</p>
              <p className="text-sm text-muted-foreground">{t('clients.totalRevenue')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t('common.contact')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {client.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{client.email}</span></div>}
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{client.phone}</span></div>
              {client.company && <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span>{client.company}</span></div>}
              {client.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{client.address}</span></div>}
            </CardContent>
          </Card>

          {client.preferences && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />{t('clients.preferences')}</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{client.preferences}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Recent missions */}
        {clientMissions.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t('clients.recentMissions')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientMissions.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => navigate(`/missions/${m.id}`)}>
                    <div>
                      <p className="font-medium text-sm">{m.number}</p>
                      <p className="text-xs text-muted-foreground">{m.origin} → {m.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(m.date).toLocaleDateString('fr-FR')}</p>
                      <Badge className={`text-xs ${MISSION_STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-800'}`}>{MISSION_STATUS_LABELS[m.status] || m.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
