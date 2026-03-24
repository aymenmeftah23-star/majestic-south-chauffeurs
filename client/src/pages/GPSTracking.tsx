import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { MapPin, Navigation, Clock, User } from 'lucide-react';

const GOLD = "#C9A84C";

export default function GPSTracking() {
  const { data: missions = [] } = trpc.missions.getAll.useQuery();
  const { data: chauffeurs = [] } = trpc.chauffeurs.getAll.useQuery();
  const [selectedChauffeur, setSelectedChauffeur] = useState<number | null>(null);

  const activeMissions = missions.filter((m: any) => m.status === 'en_cours' || m.status === 'confirmed');

  const getChauffeurName = (id: number) => {
    const c = chauffeurs.find((ch: any) => ch.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Non assigne';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Suivi GPS</h1>
          <p className="text-gray-400 mt-1">Suivez vos chauffeurs en temps reel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{activeMissions.length}</p>
              <p className="text-gray-400 text-sm">Missions en cours</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{chauffeurs.length}</p>
              <p className="text-gray-400 text-sm">Chauffeurs actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: GOLD }}>{missions.filter((m: any) => m.status === 'completed').length}</p>
              <p className="text-gray-400 text-sm">Missions terminees</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                <div className="h-[500px] bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)',
                    backgroundSize: '50px 50px'
                  }} />
                  <div className="text-center z-10">
                    <MapPin size={64} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg font-medium">Carte de suivi GPS</p>
                    <p className="text-gray-500 text-sm mt-2 max-w-md">
                      Pour activer le suivi en temps reel, configurez votre cle API Google Maps
                      dans les parametres de l'application.
                    </p>
                    <div className="mt-4 bg-gray-700/50 rounded px-4 py-2 inline-block">
                      <code className="text-gray-400 text-xs">GOOGLE_MAPS_API_KEY=votre_cle</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <p className="text-white font-medium">Chauffeurs en mission</p>
            {activeMissions.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6 text-center">
                  <Navigation size={32} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-400 text-sm">Aucune mission en cours</p>
                </CardContent>
              </Card>
            ) : (
              activeMissions.map((mission: any) => (
                <Card
                  key={mission.id}
                  className={`bg-gray-900 border-gray-800 cursor-pointer transition-all ${selectedChauffeur === mission.chauffeurId ? 'ring-1' : ''}`}
                  style={selectedChauffeur === mission.chauffeurId ? { borderColor: GOLD } : {}}
                  onClick={() => setSelectedChauffeur(mission.chauffeurId)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <User size={18} style={{ color: GOLD }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {getChauffeurName(mission.chauffeurId)}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {mission.pickupAddress || 'Adresse non renseignee'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={mission.status === 'en_cours' ? 'border-green-600 text-green-400' : 'border-blue-600 text-blue-400'}
                      >
                        {mission.status === 'en_cours' ? 'En route' : 'Confirme'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{mission.date ? new Date(mission.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="truncate">{mission.dropoffAddress || 'Destination non renseignee'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
