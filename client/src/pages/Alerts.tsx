import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bell, Search, CheckCircle, AlertTriangle, Info, XCircle, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const GOLD = "#C9A84C";

interface Alert {
  id: string;
  title: string;
  message: string;
  priority: 'critique' | 'haute' | 'normale' | 'basse';
  status: 'active' | 'lue' | 'resolue';
  createdAt: Date;
  type: string;
}

export default function Alerts() {
  const { data: missions = [] } = trpc.missions.getAll.useQuery();
  const { data: chauffeurs = [] } = trpc.chauffeurs.getAll.useQuery();
  const { data: demands = [] } = trpc.demands.getAll.useQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Generer des alertes reelles basees sur les donnees
  const alerts = useMemo(() => {
    const result: Alert[] = [];

    // Alertes pour les missions sans chauffeur assigne
    missions.filter((m: any) => !m.chauffeurId && m.status !== 'cancelled').forEach((m: any) => {
      result.push({
        id: `no-driver-${m.id}`,
        title: 'Mission sans chauffeur',
        message: `La mission ${m.number || `M-${m.id}`} n'a pas de chauffeur assigne.`,
        priority: 'haute',
        status: 'active',
        createdAt: new Date(m.createdAt || Date.now()),
        type: 'mission',
      });
    });

    // Alertes pour les missions aujourd'hui
    const today = new Date();
    missions.filter((m: any) => {
      const d = new Date(m.date);
      return d.toDateString() === today.toDateString() && m.status === 'confirmed';
    }).forEach((m: any) => {
      result.push({
        id: `today-${m.id}`,
        title: 'Mission aujourd\'hui',
        message: `Mission ${m.number || `M-${m.id}`} prevue aujourd'hui.`,
        priority: 'normale',
        status: 'active',
        createdAt: new Date(m.date),
        type: 'rappel',
      });
    });

    // Alertes pour les nouvelles demandes en attente
    demands.filter((d: any) => d.status === 'pending' || d.status === 'new').forEach((d: any) => {
      result.push({
        id: `demand-${d.id}`,
        title: 'Nouvelle demande en attente',
        message: `Demande de ${d.clientName || 'client'} en attente de traitement.`,
        priority: 'haute',
        status: 'active',
        createdAt: new Date(d.createdAt || Date.now()),
        type: 'demande',
      });
    });

    // Alertes pour les missions en retard
    missions.filter((m: any) => {
      const d = new Date(m.date);
      return d < today && m.status !== 'completed' && m.status !== 'cancelled';
    }).forEach((m: any) => {
      result.push({
        id: `late-${m.id}`,
        title: 'Mission en retard',
        message: `La mission ${m.number || `M-${m.id}`} est en retard (prevue le ${new Date(m.date).toLocaleDateString('fr-FR')}).`,
        priority: 'critique',
        status: 'active',
        createdAt: new Date(m.date),
        type: 'retard',
      });
    });

    return result.sort((a, b) => {
      const priorityOrder = { critique: 0, haute: 1, normale: 2, basse: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [missions, chauffeurs, demands]);

  const visibleAlerts = alerts.filter(a => !dismissedIds.includes(a.id));

  const filteredAlerts = visibleAlerts.filter(alert => {
    const matchSearch = !searchQuery ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || alert.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleDismiss = (id: string) => setDismissedIds(prev => [...prev, id]);
  const handleDismissAll = () => setDismissedIds(alerts.map(a => a.id));

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critique': return <XCircle size={18} className="text-red-400" />;
      case 'haute': return <AlertTriangle size={18} className="text-orange-400" />;
      case 'normale': return <Bell size={18} className="text-yellow-400" />;
      default: return <Info size={18} className="text-blue-400" />;
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'critique': return 'border-l-red-500';
      case 'haute': return 'border-l-orange-500';
      case 'normale': return 'border-l-yellow-500';
      default: return 'border-l-blue-500';
    }
  };

  const criticalCount = visibleAlerts.filter(a => a.priority === 'critique').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Alertes</h1>
            <p className="text-gray-400 mt-1">{visibleAlerts.length} alertes actives, {criticalCount} critiques</p>
          </div>
          {visibleAlerts.length > 0 && (
            <Button variant="outline" className="border-gray-700 text-gray-300" onClick={handleDismissAll}>
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{visibleAlerts.length}</p>
              <p className="text-gray-400 text-sm">Total alertes</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-gray-400 text-sm">Critiques</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{visibleAlerts.filter(a => a.priority === 'haute').length}</p>
              <p className="text-gray-400 text-sm">Haute priorite</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{dismissedIds.length}</p>
              <p className="text-gray-400 text-sm">Resolues</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white pl-10"
              placeholder="Rechercher une alerte..."
            />
          </div>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white rounded px-3 py-2"
          >
            <option value="all">Toutes priorites</option>
            <option value="critique">Critique</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="basse">Basse</option>
          </select>
        </div>

        {filteredAlerts.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <p className="text-gray-400 text-lg">Aucune alerte</p>
              <p className="text-gray-500 text-sm mt-2">Tout est en ordre</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <Card key={alert.id} className={`bg-gray-900 border-gray-800 border-l-4 ${getPriorityBorder(alert.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getPriorityIcon(alert.priority)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{alert.title}</p>
                          <Badge variant="outline" className={
                            alert.priority === 'critique' ? 'border-red-600 text-red-400' :
                            alert.priority === 'haute' ? 'border-orange-600 text-orange-400' :
                            alert.priority === 'normale' ? 'border-yellow-600 text-yellow-400' :
                            'border-blue-600 text-blue-400'
                          }>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{alert.message}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                          <Clock size={12} />
                          <span>{alert.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 shrink-0"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <CheckCircle size={14} className="mr-1" /> Resoudre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
