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
import { Loader2, Plus, MapPin, Users, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Demands() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { data: demands, isLoading } = trpc.demands.list.useQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const statuses = [
    { value: 'nouvelle', label: 'Nouvelle' },
    { value: 'a_traiter', label: 'À traiter' },
    { value: 'devis_envoye', label: 'Devis envoyé' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'confirmee', label: 'Confirmée' },
    { value: 'convertie', label: 'Convertie' },
    { value: 'refusee', label: 'Refusée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  const priorities = [
    { value: 'basse', label: t('alerts.low') },
    { value: 'normale', label: t('alerts.normal') },
    { value: 'haute', label: t('alerts.high') },
    { value: 'urgente', label: t('alerts.urgent') },
  ];

  const filteredDemands = demands?.filter(demand => {
    const matchesSearch = 
      demand.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || demand.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || demand.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      nouvelle: 'bg-blue-100 text-blue-800',
      a_traiter: 'bg-yellow-100 text-yellow-800',
      devis_envoye: 'bg-purple-100 text-purple-800',
      en_attente: 'bg-orange-100 text-orange-800',
      confirmee: 'bg-green-100 text-green-800',
      convertie: 'bg-teal-100 text-teal-800',
      refusee: 'bg-red-100 text-red-800',
      annulee: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      basse: 'text-green-600',
      normale: 'text-blue-600',
      haute: 'text-orange-600',
      urgente: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('demands.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {filteredDemands.length} {t('demands.list')}
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate('/demands/new')}>
            <Plus className="h-4 w-4" />
            {t('demands.new')}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('common.filter')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('common.search')}</label>
                <Input
                  placeholder={t('demands.origin')}
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

              <div>
                <label className="text-sm font-medium mb-2 block">{t('demands.priority')}</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
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
                    setPriorityFilter('all');
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

        {/* Demands List */}
        {!isLoading && filteredDemands.length > 0 && (
          <div className="space-y-3">
            {filteredDemands.map((demand) => (
              <Card key={demand.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/demands/${demand.id}`)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(demand.status || '')}`}>
                          {statuses.find(s => s.value === demand.status)?.label}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(demand.priority || '')}`}>
                          {priorities.find(p => p.value === demand.priority)?.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('demands.origin')}</p>
                            <p className="font-medium">{demand.origin || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('demands.destination')}</p>
                            <p className="font-medium">{demand.destination || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('demands.passengers')}</p>
                            <p className="font-medium">{demand.passengers} {t('demands.passengers')}</p>
                          </div>
                        </div>
                      </div>

                      {demand.message && (
                        <div className="flex items-start gap-2 mt-4">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('demands.message')}</p>
                            <p className="text-sm">{demand.message || ''}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground">
                        {new Date(demand.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(demand.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDemands.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('message.noResults')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
