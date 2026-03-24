import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Quotes() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { data: quotes, isLoading } = trpc.quotes.list.useQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'envoye', label: 'Envoyé' },
    { value: 'consulte', label: 'Consulté' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'refuse', label: 'Refusé' },
    { value: 'expire', label: 'Expiré' },
  ];

  const filteredQuotes = quotes?.filter(quote => {
    const matchesSearch = 
      quote.number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      brouillon: 'bg-gray-100 text-gray-800',
      envoye: 'bg-blue-100 text-blue-800',
      accepte: 'bg-green-100 text-green-800',
      refuse: 'bg-red-100 text-red-800',
      expire: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('quotes.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {filteredQuotes.length} {t('quotes.list')}
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate('/quotes/new')}>
            <Plus className="h-4 w-4" />
            {t('quotes.new')}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('common.filter')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('common.search')}</label>
                <Input
                  placeholder={t('quotes.number')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t('common.status')}</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Quotes List */}
        {!isLoading && filteredQuotes.length > 0 && (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-sm font-semibold text-muted-foreground">
                          {quote.number || `Q-${quote.id}`}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status || '')}`}>
                          {statuses.find(s => s.value === quote.status)?.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Price */}
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('quotes.price')}</p>
                            <p className="font-medium text-lg">
                              {quote.price ? Number(quote.price).toFixed(2) : '0.00'} €
                            </p>
                          </div>
                        </div>

                        {/* Price HT */}
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('quotes.priceHT')}</p>
                            <p className="font-medium">
                              {quote.priceHT ? Number(quote.priceHT).toFixed(2) : '0.00'} €
                            </p>
                          </div>
                        </div>

                        {/* Validity */}
                        {quote.validUntil && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-muted-foreground">{t('quotes.validUntil')}</p>
                              <p className="font-medium">
                                {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {quote.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-1">{t('common.notes')}</p>
                          <p className="text-sm">{quote.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/quotes/${quote.id}`)}>
                        {t('common.view')}
                      </Button>
                      {quote.status === 'envoye' && (
                        <Button size="sm" className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {t('quotes.accept')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredQuotes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('message.noResults')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
