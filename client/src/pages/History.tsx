import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History as HistoryIcon, Search, MapPin, Calendar, Filter, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function History() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: missions = [], isLoading } = trpc.history.list.useQuery({
    limit: 100,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });

  const statuses = [
    { value: 'all', label: 'Tous' },
    { value: 'terminee', label: 'Terminée' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'a_confirmer', label: 'À confirmer' },
    { value: 'planifiee', label: 'Planifiée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      terminee: 'bg-green-100 text-green-800',
      annulee: 'bg-red-100 text-red-800',
      en_cours: 'bg-blue-100 text-blue-800',
      planifiee: 'bg-yellow-100 text-yellow-800',
      a_confirmer: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredMissions = (missions as any[]).filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.origin || '').toLowerCase().includes(q) ||
      (m.destination || '').toLowerCase().includes(q)
    );
  });

  const grouped: Record<string, any[]> = {};
  filteredMissions.forEach((m) => {
    const date = new Date(m.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ ...m, _monthLabel: label });
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('history.title')}</h1>
          <p className="text-muted-foreground mt-1">{filteredMissions.length} {t('history.missions')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('common.status')} />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && filteredMissions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t('common.noData')}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && sortedKeys.map(key => {
          const items = grouped[key];
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide capitalize">
                  {items[0]._monthLabel}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{items.length} {t('history.missions')}</span>
              </div>
              <div className="space-y-2">
                {items.map((mission: any) => (
                  <Card key={mission.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/missions/${mission.id}`)}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{mission.origin} → {mission.destination}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(mission.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {mission.price && <span className="font-semibold">{mission.price}€</span>}
                          <Badge className={getStatusColor(mission.status || '')}>{statuses.find(s => s.value === mission.status)?.label || mission.status}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
