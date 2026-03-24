import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Phone, Mail, MapPin, Globe, Loader2, Trash2, Car, FileText, Pencil } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS: Record<string, string> = {
  disponible: 'bg-green-100 text-green-800 border-green-200',
  en_mission: 'bg-blue-100 text-blue-800 border-blue-200',
  occupe: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  indisponible: 'bg-red-100 text-red-800 border-red-200',
  conge: 'bg-purple-100 text-purple-800 border-purple-200',
  suspendu: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  en_mission: 'En mission',
  occupe: 'Occupé',
  indisponible: 'Indisponible',
  conge: 'En congé',
  suspendu: 'Suspendu',
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

// Zones par défaut selon la région de Marseille
const DEFAULT_ZONES = ['Marseille', 'Aix-en-Provence', 'Toulon', 'Cassis', 'La Ciotat', 'Aubagne'];

export default function ChauffeurDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: chauffeur, isLoading } = trpc.chauffeurs.getById.useQuery({ id }, { enabled: !!id });
  const { data: allMissions } = trpc.missions.list.useQuery();
  const deleteMutation = trpc.chauffeurs.delete.useMutation({ onSuccess: () => navigate('/chauffeurs') });

  const chauffeurMissions = allMissions?.filter(m => m.chauffeurId === id) ?? [];
  const totalMissions = chauffeurMissions.length;
  const completedMissions = chauffeurMissions.filter(m => m.status === 'terminee').length;
  const totalCA = chauffeurMissions.filter(m => m.status === 'terminee').reduce((sum, m) => sum + (m.price || 0), 0);

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    </DashboardLayout>
  );

  if (!chauffeur) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chauffeur introuvable</p>
        <Button className="mt-4" onClick={() => navigate('/chauffeurs')}>{t('common.back')}</Button>
      </div>
    </DashboardLayout>
  );

  const status = chauffeur.status || 'disponible';
  const zones = chauffeur.zones
    ? chauffeur.zones.split(',').map((z: string) => z.trim())
    : DEFAULT_ZONES;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/chauffeurs')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{chauffeur.name}</h1>
              <p className="text-muted-foreground">
                {chauffeur.type === 'interne' ? 'Chauffeur interne' : 'Chauffeur partenaire'} — Licence {chauffeur.licenseNumber || 'VTC'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${STATUS_COLORS[status]} border px-3 py-1 text-sm font-medium`}>
              {STATUS_LABELS[status] || status}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate(`/chauffeurs/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1" /> Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirm('Supprimer ce chauffeur ?') && deleteMutation.mutate({ id })}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-yellow-600">{totalMissions}</p>
              <p className="text-sm text-muted-foreground mt-1">Total missions</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-green-600">{completedMissions}</p>
              <p className="text-sm text-muted-foreground mt-1">Missions terminées</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-blue-600">{totalCA.toFixed(0)} €</p>
              <p className="text-sm text-muted-foreground mt-1">Chiffre d'affaires</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-600" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chauffeur.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{chauffeur.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{chauffeur.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Langues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-yellow-600" />
                Langues parlées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chauffeur.languages ? (
                <div className="flex flex-wrap gap-2">
                  {chauffeur.languages.split(',').map((l: string) => (
                    <Badge key={l} variant="outline" className="border-yellow-300 text-yellow-700">
                      {l.trim()}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Non renseigné</p>
              )}
            </CardContent>
          </Card>

          {/* Zones couvertes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-yellow-600" />
                Zones couvertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {zones.map((z: string) => (
                  <Badge key={z} variant="secondary" className="bg-slate-100">
                    {z}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                Notes internes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{chauffeur.notes || 'Aucune note'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Missions récentes */}
        {chauffeurMissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-yellow-600" />
                Missions récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chauffeurMissions.slice(0, 5).map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/missions/${m.id}`)}
                  >
                    <div>
                      <p className="font-medium text-sm">{m.number}</p>
                      <p className="text-xs text-muted-foreground">{m.origin} → {m.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{m.price?.toFixed(2)} €</span>
                      <Badge className={`text-xs ${MISSION_STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-800'}`}>
                        {MISSION_STATUS_LABELS[m.status] || m.status}
                      </Badge>
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
