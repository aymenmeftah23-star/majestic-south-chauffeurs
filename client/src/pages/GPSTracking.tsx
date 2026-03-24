import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function GPSTracking() {
  const { t } = useLanguage();
  const [selectedMission, setSelectedMission] = useState(1);
  const [isLoading] = useState(false);

  // Mock active missions with GPS data
  const activeMissions = [
    {
      id: 1,
      missionId: 'M-2026-045',
      chauffeur: 'Thomas Bernard',
      phone: '+33 6 95 61 89 98',
      vehicle: 'Mercedes Classe S - 13-ABC-123',
      status: 'en_cours',
      origin: 'Aéroport Nice Côte d\'Azur',
      destination: 'Hôtel Martinez, Cannes',
      currentLocation: 'A8 - Sortie Antibes',
      latitude: 43.6047,
      longitude: 7.1242,
      speed: 110,
      eta: '14:45',
      distance: 28.5,
      progress: 65,
    },
    {
      id: 2,
      missionId: 'M-2026-046',
      chauffeur: 'Sophie Leclerc',
      phone: '+33 6 98 76 54 32',
      vehicle: 'Mercedes Classe V - 13-DEF-456',
      status: 'en_cours',
      origin: 'Aéroport Marseille Provence',
      destination: 'Aix-en-Provence Centre',
      currentLocation: 'A51 - Sortie Aix Nord',
      latitude: 43.5297,
      longitude: 5.4474,
      speed: 90,
      eta: '15:20',
      distance: 18.3,
      progress: 40,
    },
    {
      id: 3,
      missionId: 'M-2026-047',
      chauffeur: 'Marc Dubois',
      phone: '+33 6 55 44 33 22',
      vehicle: 'Tesla Model Y - 06-GHI-789',
      status: 'confirmee',
      origin: 'Gare Saint-Charles, Marseille',
      destination: 'Monaco - Place du Casino',
      currentLocation: 'Gare Saint-Charles, Marseille',
      latitude: 43.3028,
      longitude: 5.3811,
      speed: 0,
      eta: '16:00',
      distance: 205.0,
      progress: 0,
    },
  ];

  const mission = activeMissions.find((m) => m.id === selectedMission);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'confirmee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('gps.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('gps.description')}</p>
        </div>

        {/* Active Missions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('gps.activeMissions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeMissions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMission(m.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedMission === m.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{m.missionId}</p>
                      <p className="text-sm text-muted-foreground">{m.chauffeur}</p>
                    </div>
                    <Badge className={getStatusColor(m.status)}>
                      {m.status === 'en_cours' ? t('status.inProgress') : t('status.confirmed')}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-blue-900">
                    {mission?.currentLocation}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Latitude: {mission?.latitude}, Longitude: {mission?.longitude}
                  </p>
                  <p className="text-sm text-blue-600 mt-4">
                    {t('gps.mapIntegration')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mission Details */}
        {mission && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chauffeur Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('gps.chauffeurInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('gps.name')}</p>
                  <p className="font-semibold">{mission.chauffeur}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('gps.vehicle')}</p>
                  <p className="font-semibold">{mission.vehicle}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 gap-2">
                    <Phone className="h-4 w-4" />
                    {t('gps.call')}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {t('gps.message')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Journey Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('gps.journeyInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('gps.from')}</p>
                  <p className="font-semibold">{mission.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('gps.to')}</p>
                  <p className="font-semibold">{mission.destination}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('gps.distance')}</p>
                    <p className="font-semibold">{mission.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('gps.eta')}</p>
                    <p className="font-semibold">{mission.eta}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('gps.realtimeStats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('gps.speed')}</p>
                  <p className="text-2xl font-bold">{mission.speed} km/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('gps.progress')}</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{mission.progress}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('gps.alerts')}</CardTitle>
              </CardHeader>
              <CardContent>
                {mission.status === 'en_cours' ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">{t('gps.onTime')}</p>
                      <p className="text-sm text-green-700">{t('gps.onTimeDesc')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">{t('gps.waitingPickup')}</p>
                      <p className="text-sm text-blue-700">{t('gps.waitingPickupDesc')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
