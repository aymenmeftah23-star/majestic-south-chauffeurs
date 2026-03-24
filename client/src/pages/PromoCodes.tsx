import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Percent, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function PromoCodes() {
  const { t } = useLanguage();
  const [isLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  // Mock promo codes data
  const promoCodes = [
    {
      id: 1,
      code: 'WELCOME20',
      discount: 20,
      type: 'percentage',
      description: 'Bienvenue - 20% de réduction',
      usageLimit: 100,
      usageCount: 45,
      expiryDate: '2026-06-30',
      active: true,
      applicableTo: 'all',
    },
    {
      id: 2,
      code: 'SUMMER15',
      discount: 15,
      type: 'percentage',
      description: 'Offre été - 15% de réduction',
      usageLimit: 200,
      usageCount: 128,
      expiryDate: '2026-08-31',
      active: true,
      applicableTo: 'missions',
    },
    {
      id: 3,
      code: 'FIXED10',
      discount: 1000,
      type: 'fixed',
      description: 'Réduction fixe - 10€',
      usageLimit: 50,
      usageCount: 50,
      expiryDate: '2026-04-30',
      active: false,
      applicableTo: 'all',
    },
    {
      id: 4,
      code: 'CORPORATE25',
      discount: 25,
      type: 'percentage',
      description: 'Tarif corporate - 25% de réduction',
      usageLimit: null,
      usageCount: 312,
      expiryDate: '2026-12-31',
      active: true,
      applicableTo: 'corporate',
    },
  ];

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getUsagePercentage = (code: any) => {
    if (!code.usageLimit) return 0;
    return (code.usageCount / code.usageLimit) * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('promoCodes.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('promoCodes.description')}</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('promoCodes.new')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('promoCodes.active')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promoCodes.filter((c) => c.active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('promoCodes.totalUsage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promoCodes.reduce((sum, c) => sum + c.usageCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t('promoCodes.totalSavings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€2,450</div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Promo Codes List */}
        {!isLoading && promoCodes.length > 0 && (
          <div className="space-y-3">
            {promoCodes.map((promoCode) => (
              <Card key={promoCode.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold font-mono">{promoCode.code}</h3>
                          <Badge variant={promoCode.active ? 'default' : 'secondary'}>
                            {promoCode.active ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {promoCode.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Percent className="h-4 w-4" />
                            <span>
                              {promoCode.type === 'percentage'
                                ? `${promoCode.discount}%`
                                : `€${(promoCode.discount / 100).toFixed(2)}`}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {t('promoCodes.expiry')}: {new Date(promoCode.expiryDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => copyToClipboard(promoCode.code, promoCode.id)}
                        >
                          <Copy className="h-4 w-4" />
                          {copied === promoCode.id ? t('promoCodes.copied') : t('common.copy')}
                        </Button>
                        <Button size="sm" variant="ghost">
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Usage Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('promoCodes.usage')}</span>
                        <span className="text-sm text-muted-foreground">
                          {promoCode.usageCount}
                          {promoCode.usageLimit ? ` / ${promoCode.usageLimit}` : '+'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${Math.min(getUsagePercentage(promoCode), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && promoCodes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Percent className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('promoCodes.noPromoCodes')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
