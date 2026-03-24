import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, CheckCircle2, AlertTriangle, Info, XCircle, Plus, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Alerts() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: alerts = [], isLoading, refetch } = trpc.alerts.list.useQuery();

  const updateMutation = trpc.alerts.update.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = trpc.alerts.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const priorities = [
    { value: 'all', label: t('common.all') },
    { value: 'critique', label: t('alerts.priority.critique') },
    { value: 'haute', label: t('alerts.priority.haute') },
    { value: 'normale', label: t('alerts.priority.normale') },
    { value: 'basse', label: t('alerts.priority.basse') },
  ];

  const statuses = [
    { value: 'all', label: t('common.all') },
    { value: 'active', label: t('alerts.status.active') },
    { value: 'acknowledged', label: t('alerts.status.acknowledged') },
    { value: 'resolved', label: t('alerts.status.resolved') },
  ];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critique: 'bg-red-100 text-red-800 border-red-200',
      haute: 'bg-orange-100 text-orange-800 border-orange-200',
      normale: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      basse: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'critique') return <XCircle className="h-4 w-4 text-red-500" />;
    if (priority === 'haute') return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    if (priority === 'normale') return <Bell className="h-4 w-4 text-yellow-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const filteredAlerts = alerts.filter((alert: any) => {
    const matchSearch = !searchQuery ||
      (alert.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.message || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const activeCount = alerts.filter((a: any) => a.status === 'active').length;
  const criticalCount = alerts.filter((a: any) => a.priority === 'critique' && a.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('alerts.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {activeCount} {t('alerts.active')} · {criticalCount} {t('alerts.critical')}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('alerts.total'), value: alerts.length, color: 'text-foreground' },
            { label: t('alerts.active'), value: activeCount, color: 'text-orange-600' },
            { label: t('alerts.critical'), value: criticalCount, color: 'text-red-600' },
            { label: t('alerts.resolved'), value: alerts.filter((a: any) => a.status === 'resolved').length, color: 'text-green-600' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('alerts.priority.label')} />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('common.status')} />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Alerts List */}
        {!isLoading && (
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{t('common.noData')}</p>
                  <p className="text-muted-foreground mt-1">{t('alerts.noAlerts')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert: any) => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.priority === 'critique' ? 'border-l-red-500' :
                  alert.priority === 'haute' ? 'border-l-orange-500' :
                  alert.priority === 'normale' ? 'border-l-yellow-500' : 'border-l-blue-500'
                } ${alert.status === 'resolved' ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getPriorityIcon(alert.priority || 'normale')}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{alert.title || t('alerts.alert')}</p>
                            <Badge className={getPriorityColor(alert.priority || 'normale')}>
                              {priorities.find(p => p.value === alert.priority)?.label || alert.priority}
                            </Badge>
                            {alert.status === 'resolved' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />{t('alerts.status.resolved')}
                              </Badge>
                            )}
                            {alert.status === 'acknowledged' && (
                              <Badge variant="outline">{t('alerts.status.acknowledged')}</Badge>
                            )}
                          </div>
                          {alert.message && (
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.createdAt || Date.now()).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'long', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {alert.status !== 'resolved' && (
                        <div className="flex gap-2 shrink-0">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMutation.mutate({ id: alert.id, status: 'lue' })}
                              disabled={updateMutation.isPending}
                            >
                              {t('alerts.acknowledge')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => updateMutation.mutate({ id: alert.id, status: 'resolue' })}
                            disabled={updateMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {t('alerts.resolve')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
