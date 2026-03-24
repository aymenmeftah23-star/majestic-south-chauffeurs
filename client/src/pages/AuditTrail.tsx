import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { History, Users, Car, FileText, MapPin } from 'lucide-react';

const GOLD = "#C9A84C";

export default function AuditTrail() {
  const { data: missions = [] } = trpc.missions.getAll.useQuery();
  const { data: demands = [] } = trpc.demands.getAll.useQuery();
  const { data: clients = [] } = trpc.clients.getAll.useQuery();
  const { data: chauffeurs = [] } = trpc.chauffeurs.getAll.useQuery();

  const events: Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    date: Date;
    icon: any;
    color: string;
  }> = [];

  missions.forEach((m: any) => {
    events.push({
      id: `mission-${m.id}`,
      type: 'mission',
      title: `Mission #${m.id} creee`,
      detail: `${m.origin} vers ${m.destination} - Statut: ${m.status}`,
      date: new Date(m.createdAt),
      icon: MapPin,
      color: '#3B82F6',
    });
  });

  demands.forEach((d: any) => {
    events.push({
      id: `demand-${d.id}`,
      type: 'demande',
      title: `Demande #${d.id} recue`,
      detail: `${d.origin} vers ${d.destination} - ${d.status}`,
      date: new Date(d.createdAt),
      icon: FileText,
      color: GOLD,
    });
  });

  clients.forEach((c: any) => {
    events.push({
      id: `client-${c.id}`,
      type: 'client',
      title: `Client "${c.name}" ajoute`,
      detail: c.company ? `Societe: ${c.company}` : `${c.email || 'Pas d\'email'}`,
      date: new Date(c.createdAt),
      icon: Users,
      color: '#10B981',
    });
  });

  chauffeurs.forEach((ch: any) => {
    events.push({
      id: `chauffeur-${ch.id}`,
      type: 'chauffeur',
      title: `Chauffeur "${ch.name}" enregistre`,
      detail: `Licence: ${ch.licenseNumber || 'N/A'} - Zones: ${ch.zones || 'N/A'}`,
      date: new Date(ch.createdAt),
      icon: Car,
      color: '#8B5CF6',
    });
  });

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Journal d'activite</h1>
          <p className="text-gray-400 mt-1">Historique de toutes les actions effectuees dans le systeme</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{events.length}</p>
              <p className="text-gray-400 text-sm">Total evenements</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{missions.length}</p>
              <p className="text-gray-400 text-sm">Missions</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{demands.length}</p>
              <p className="text-gray-400 text-sm">Demandes</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{clients.length + chauffeurs.length}</p>
              <p className="text-gray-400 text-sm">Contacts</p>
            </CardContent>
          </Card>
        </div>

        {events.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <History size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Aucune activite enregistree</p>
              <p className="text-gray-500 text-sm mt-2">Les evenements apparaitront ici au fur et a mesure de l'utilisation</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800" />
            <div className="space-y-4">
              {events.slice(0, 50).map((event) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="relative pl-14">
                    <div
                      className="absolute left-3 top-3 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: event.color + '20', border: `1px solid ${event.color}` }}
                    >
                      <Icon size={14} style={{ color: event.color }} />
                    </div>
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{event.title}</p>
                            <p className="text-gray-400 text-sm mt-1">{event.detail}</p>
                          </div>
                          <span className="text-gray-600 text-xs whitespace-nowrap ml-4">
                            {event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
