import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreditCard, Search, Euro, TrendingUp, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Payments() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: payments = [], isLoading } = trpc.payments.list.useQuery();
  const { data: stats } = trpc.payments.stats.useQuery();

  const filtered = (payments as any[]).filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.reference || '').toLowerCase().includes(q) ||
      (p.origin || '').toLowerCase().includes(q) ||
      (p.destination || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('payments.title')}</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} {t('payments.payments')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Euro className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('payments.totalReceived')}</p>
                  <p className="text-xl font-bold text-green-600">{(stats?.totalRevenue || 0).toFixed(2)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('payments.pending')}</p>
                  <p className="text-xl font-bold text-orange-600">{(stats?.pendingRevenue || 0).toFixed(2)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('payments.completedMissions')}</p>
                  <p className="text-xl font-bold">{stats?.completedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />{t('payments.list')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('common.noData')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{p.reference}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.origin} → {p.destination} · {new Date(p.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">+{(p.amount || 0).toFixed(2)}€</span>
                        <Badge className="bg-green-100 text-green-800">{t('payments.status.received')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
