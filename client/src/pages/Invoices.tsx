import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Receipt, Search, Download, Euro, CheckCircle2, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Invoices() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: invoices = [], isLoading } = trpc.invoices.list.useQuery();

  const filtered = (invoices as any[]).filter(inv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inv.number || '').toLowerCase().includes(q) ||
      (inv.origin || '').toLowerCase().includes(q) ||
      (inv.destination || '').toLowerCase().includes(q)
    );
  });

  const totalAmount = (invoices as any[]).reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidAmount = (invoices as any[]).filter(inv => inv.status === 'payee').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const pendingAmount = (invoices as any[]).filter(inv => inv.status === 'en_attente').reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('invoices.title')}</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} {t('invoices.invoices')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Euro className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('invoices.total')}</p>
                  <p className="text-xl font-bold">{totalAmount.toFixed(2)}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('invoices.paid')}</p>
                  <p className="text-xl font-bold text-green-600">{paidAmount.toFixed(2)}€</p>
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
                  <p className="text-sm text-muted-foreground">{t('invoices.pending')}</p>
                  <p className="text-xl font-bold text-orange-600">{pendingAmount.toFixed(2)}€</p>
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
                <Receipt className="h-4 w-4" />{t('invoices.list')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('common.noData')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Receipt className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{inv.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {inv.origin} → {inv.destination} · {new Date(inv.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{(inv.amount || 0).toFixed(2)}€</span>
                        <Badge className={inv.status === 'payee' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {inv.status === 'payee' ? t('invoices.status.paid') : t('invoices.status.pending')}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
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
