import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Euro, CheckCircle, XCircle, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { trpc } from '@/lib/trpc';

const STATUS_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-800',
  envoye: 'bg-blue-100 text-blue-800',
  consulte: 'bg-yellow-100 text-yellow-800',
  accepte: 'bg-green-100 text-green-800',
  refuse: 'bg-red-100 text-red-800',
  expire: 'bg-gray-200 text-gray-600',
};

export default function QuoteDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || '0');

  const { data: quote, isLoading, refetch } = trpc.quotes.getById.useQuery({ id }, { enabled: !!id });

  const updateMutation = trpc.quotes.update.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.quotes.delete.useMutation({ onSuccess: () => navigate('/quotes') });
  const convertMutation = trpc.quotes.convertToMission.useMutation({
    onSuccess: (data) => {
      toast.success('Mission créée : ' + data.missionNumber);
      navigate('/missions');
    },
    onError: (err) => toast.error('Erreur : ' + err.message),
  });

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  if (!quote) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Devis introuvable</p>
        <Button className="mt-4" onClick={() => navigate('/quotes')}>{t('common.back')}</Button>
      </div>
    </DashboardLayout>
  );

  const handleConvert = () => {
    if (confirm('Convertir ce devis en mission ?')) {
      convertMutation.mutate({ quoteId: id });
    }
  };

  const handleDelete = () => {
    if (confirm('Supprimer ce devis ?')) deleteMutation.mutate({ id });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('quotes.detail')} #{quote.number}</h1>
              <p className="text-muted-foreground">{t('quotes.createdAt')} {new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[quote.status || 'brouillon']}>{quote.status}</Badge>
            {quote.status === 'brouillon' && (
              <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id, status: 'envoye' })}>
                {t('quotes.send')}
              </Button>
            )}
            {(quote.status === 'envoye' || quote.status === 'consulte') && (
              <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateMutation.mutate({ id, status: 'accepte' })}>
                  <CheckCircle className="h-4 w-4 mr-1" />{t('quotes.accept')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateMutation.mutate({ id, status: 'refuse' })}>
                  <XCircle className="h-4 w-4 mr-1" />{t('quotes.reject')}
                </Button>
              </>
            )}
            {quote.status === 'accepte' && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleConvert} disabled={convertMutation.isPending}>
                {convertMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-1" />}
                {t('quotes.convertToMission')}
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Euro className="h-5 w-5" />{t('quotes.pricing')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('quotes.priceTTC')}</span>
                <span className="font-bold text-2xl">{quote.price} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('quotes.priceHT')}</span>
                <span>{quote.priceHT} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA</span>
                <span>{quote.price - quote.priceHT} €</span>
              </div>
              <Separator />
              {quote.validUntil && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('quotes.validUntil')}</span>
                  <span>{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demand link */}
          <Card>
            <CardHeader><CardTitle>{t('quotes.demand')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Demande associee #{quote.demandId}</p>
              <Button variant="outline" size="sm" onClick={() => navigate(`/demands/${quote.demandId}`)}>
                {t('common.viewDetails')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {quote.notes && (
          <Card>
            <CardHeader><CardTitle>{t('common.notes')}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{quote.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
