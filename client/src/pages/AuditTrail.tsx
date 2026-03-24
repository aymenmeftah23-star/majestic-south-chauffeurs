import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, User, FileText } from 'lucide-react';
import { useState } from 'react';

export default function AuditTrail() {
  const { t } = useLanguage();
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  // Mock audit trail data
  const auditLogs = [
    {
      id: 1,
      timestamp: '2026-03-23 14:35:22',
      user: 'Admin - Jean Dupont',
      action: 'create',
      entity: 'Mission',
      entityId: 'M-2026-045',
      description: 'Créé nouvelle mission',
      ipAddress: '192.168.1.100',
      changes: { status: 'pending', price: 15000 },
    },
    {
      id: 2,
      timestamp: '2026-03-23 14:30:15',
      user: 'Gestionnaire - Marie Martin',
      action: 'update',
      entity: 'Demand',
      entityId: 'D-2026-001',
      description: 'Modifié statut de demande',
      ipAddress: '192.168.1.101',
      changes: { status: 'confirmed' },
    },
    {
      id: 3,
      timestamp: '2026-03-23 14:25:08',
      user: 'Admin - Jean Dupont',
      action: 'delete',
      entity: 'Quote',
      entityId: 'Q-2026-010',
      description: 'Supprimé devis expiré',
      ipAddress: '192.168.1.100',
      changes: { deleted: true },
    },
    {
      id: 4,
      timestamp: '2026-03-23 14:20:45',
      user: 'Chauffeur - Pierre Durand',
      action: 'update',
      entity: 'Mission',
      entityId: 'M-2026-044',
      description: 'Marqué mission comme complétée',
      ipAddress: '192.168.1.102',
      changes: { status: 'completed', endTime: '14:20' },
    },
    {
      id: 5,
      timestamp: '2026-03-23 14:15:30',
      user: 'Client - Sophie Laurent',
      action: 'create',
      entity: 'Demand',
      entityId: 'D-2026-050',
      description: 'Créé nouvelle demande',
      ipAddress: '192.168.1.103',
      changes: { type: 'airport_transfer', passengers: 2 },
    },
  ];

  const actions = [
    { value: 'all', label: t('common.all') },
    { value: 'create', label: t('audit.create') },
    { value: 'update', label: t('audit.update') },
    { value: 'delete', label: t('audit.delete') },
    { value: 'view', label: t('audit.view') },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    const actionObj = actions.find((a) => a.value === action);
    return actionObj?.label || action;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('audit.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('audit.description')}</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('common.filter')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Audit Logs */}
        {!isLoading && filteredLogs.length > 0 && (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getActionColor(log.action)}>
                              {getActionLabel(log.action)}
                            </Badge>
                            <span className="font-semibold">
                              {log.entity} - {log.entityId}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.timestamp}
                            </div>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Changes */}
                    {Object.keys(log.changes).length > 0 && (
                      <div className="bg-muted p-3 rounded-lg text-xs">
                        <p className="font-semibold mb-2">{t('audit.changes')}:</p>
                        <div className="space-y-1">
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-mono">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredLogs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('audit.noLogs')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
