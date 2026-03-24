import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Phone, Mail, MapPin, Globe, Loader2, Trash2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS: Record<string, string> = {
  disponible: 'bg-green-100 text-green-800',
  occupe: 'bg-yellow-100 text-yellow-800',
  indisponible: 'bg-red-100 text-red-800',
  conge: 'bg-blue-100 text-blue-800',
  suspendu: 'bg-gray-100 text-gray-800',
};

export default function ChauffeurDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: chauffeur, isLoading } = trpc.chauffeurs.getById.useQuery({ id }, { enabled: !!id });
  const deleteMutation = trpc.chauffeurs.delete.useMutation({ onSuccess: () => navigate('/chauffeurs') });

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></DashboardLayout>;
  if (!chauffeur) return <DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Chauffeur introuvable</p><Button className="mt-4" onClick={() => navigate('/chauffeurs')}>{t('common.back')}</Button></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/chauffeurs')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{chauffeur.name}</h1>
              <p className="text-muted-foreground">{chauffeur.type === 'interne' ? t('chauffeurs.internal') : t('chauffeurs.external')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[chauffeur.status || 'disponible']}>{chauffeur.status}</Badge>
            <Button variant="destructive" size="sm" onClick={() => confirm('Supprimer ?') && deleteMutation.mutate({ id })} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t('common.contact')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {chauffeur.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{chauffeur.email}</span></div>}
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{chauffeur.phone}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />{t('chauffeurs.languages')}</CardTitle></CardHeader>
            <CardContent>
              {chauffeur.languages ? (
                <div className="flex flex-wrap gap-2">
                  {chauffeur.languages.split(',').map((l: string) => <Badge key={l} variant="outline">{l.trim()}</Badge>)}
                </div>
              ) : <p className="text-muted-foreground text-sm">—</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{t('chauffeurs.zones')}</CardTitle></CardHeader>
            <CardContent>
              {chauffeur.zones ? (
                <div className="flex flex-wrap gap-2">
                  {chauffeur.zones.split(',').map((z: string) => <Badge key={z} variant="secondary">{z.trim()}</Badge>)}
                </div>
              ) : <p className="text-muted-foreground text-sm">—</p>}
            </CardContent>
          </Card>

          {chauffeur.notes && (
            <Card>
              <CardHeader><CardTitle>{t('common.notes')}</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{chauffeur.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
