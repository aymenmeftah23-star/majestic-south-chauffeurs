import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageSquare, FileText, MapPin, Users, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function DemandDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: demand, isLoading, error, refetch } = trpc.demands.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  const updateMutation = trpc.demands.update.useMutation({
    onSuccess: () => refetch(),
  });

  const statuses = [
    { value: 'en_attente', label: t('demands.status.en_attente'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'en_cours', label: t('demands.status.en_cours'), color: 'bg-blue-100 text-blue-800' },
    { value: 'traitee', label: t('demands.status.traitee'), color: 'bg-green-100 text-green-800' },
    { value: 'annulee', label: t('demands.status.annulee'), color: 'bg-red-100 text-red-800' },
  ];

  const types = [
    { value: 'airport', label: t('demands.type.airport') },
    { value: 'business', label: t('demands.type.business') },
    { value: 'event', label: t('demands.type.event') },
    { value: 'tourism', label: t('demands.type.tourism') },
    { value: 'other', label: t('demands.type.other') },
  ];

  const getStatusInfo = (s: string) => statuses.find(x => x.value === s) || statuses[0];
  const getTypeLabel = (type: string) => types.find(x => x.value === type)?.label || type;

  const handleStatusChange = (newStatus: string) => {
    if (!demand) return;
    updateMutation.mutate({ id: demand.id, status: newStatus as any });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !demand) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{t('common.notFound')}</p>
          <Button onClick={() => navigate('/demands')}>{t('common.back')}</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = getStatusInfo(demand.status || 'en_attente');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/demands')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t('demands.demand')} #{demand.id}
              </h1>
              <p className="text-muted-foreground mt-1">
                {demand.origin} → {demand.destination}
              </p>
            </div>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />{t('common.date')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">
                {new Date(demand.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(demand.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />{t('demands.passengers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{demand.passengers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />{t('demands.type.label')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{getTypeLabel(demand.type || '')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Trajet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />{t('demands.route')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">{t('demands.origin')}</p>
                <p className="font-semibold text-lg">{demand.origin || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('demands.destination')}</p>
                <p className="font-semibold text-lg">{demand.destination || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut */}
        <Card>
          <CardHeader>
            <CardTitle>{t('common.status')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Select value={demand.status || 'en_attente'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updateMutation.isPending && (
              <span className="text-sm text-muted-foreground">{t('common.saving')}...</span>
            )}
            {updateMutation.isSuccess && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />{t('common.saved')}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Message client */}
        {demand.message && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />{t('demands.message')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{demand.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/demands')} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />{t('common.back')}
          </Button>
          <Button onClick={() => navigate('/quotes/new')} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />{t('quotes.createFromDemand')}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
