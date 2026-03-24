import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, MapPin, Users, Car, ClipboardList, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmée', in_progress: 'En cours', completed: 'Terminée',
  cancelled: 'Annulée', pending: 'En attente',
  planifiee: 'Planifiée', en_cours: 'En cours', terminee: 'Terminée',
  annulee: 'Annulée', en_attente: 'En attente', confirmee: 'Confirmée',
  sent: 'Envoyé', accepted: 'Accepté', rejected: 'Refusé',
  actif: 'Actif', disponible: 'Disponible', indisponible: 'Indisponible',
  particulier: 'Particulier', business: 'Business', hotel: 'Hôtel', vip: 'VIP',
};

export default function Search() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: results, isLoading } = trpc.search.global.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) setSearchQuery(query.trim());
  };

  const totalResults = results
    ? (results.missions?.length || 0) + (results.clients?.length || 0) +
      (results.chauffeurs?.length || 0) + (results.demands?.length || 0) + (results.quotes?.length || 0)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('search.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('search.subtitle')}</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" disabled={query.length < 2}>
            {t('search.search')}
          </Button>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* No results */}
        {!isLoading && searchQuery && totalResults === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t('search.noResults')}</p>
              <p className="text-muted-foreground mt-1">{t('search.noResultsHint')}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && totalResults > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {totalResults} {t('search.results')} pour "{searchQuery}"
            </p>

            {/* Missions */}
            {results.missions && results.missions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />{t('nav.missions')} ({results.missions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.missions.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/missions/${m.id}`)}
                    >
                      <div>
                        <p className="font-medium">{m.origin} → {m.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(m.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="outline">{statusLabels[m.status] ?? m.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Clients */}
            {results.clients && results.clients.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />{t('nav.clients')} ({results.clients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.clients.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/clients/${c.id}`)}
                    >
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.email} {c.company ? `· ${c.company}` : ''}</p>
                      </div>
                      <Badge variant="outline">{statusLabels[c.type] ?? c.type ?? 'Client'}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Chauffeurs */}
            {results.chauffeurs && results.chauffeurs.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Car className="h-4 w-4" />{t('nav.chauffeurs')} ({results.chauffeurs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.chauffeurs.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/chauffeurs/${c.id}`)}
                    >
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.email}</p>
                      </div>
                      <Badge variant="outline">{statusLabels[c.status] ?? c.status ?? 'Actif'}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Demandes */}
            {results.demands && results.demands.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />{t('nav.demands')} ({results.demands.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.demands.map((d: any) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/demands/${d.id}`)}
                    >
                      <div>
                        <p className="font-medium">{d.origin} → {d.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(d.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="outline">{statusLabels[d.status] ?? d.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Devis */}
            {results.quotes && results.quotes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />{t('nav.quotes')} ({results.quotes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.quotes.map((q: any) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/quotes/${q.id}`)}
                    >
                      <div>
                        <p className="font-medium">{t('quotes.quote')} #{q.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {q.totalTtc ? `${q.totalTtc}€ TTC` : '-'}
                        </p>
                      </div>
                      <Badge variant="outline">{statusLabels[q.status] ?? q.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Hint when empty */}
        {!searchQuery && (
          <Card>
            <CardContent className="py-12 text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('search.hint')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
