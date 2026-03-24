import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

const GOLD = "#C9A84C";

export default function Planning() {
  const { data: missions = [], isLoading } = trpc.missions.getAll.useQuery();
  const { data: chauffeurs = [] } = trpc.chauffeurs.getAll.useQuery();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setLocation] = useLocation();

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Lundi = 0
  };

  const getMissionsForDate = (date: Date) => {
    return missions.filter((mission: any) => {
      const missionDate = new Date(mission.date);
      return (
        missionDate.getDate() === date.getDate() &&
        missionDate.getMonth() === date.getMonth() &&
        missionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getChauffeurName = (id: number) => {
    const c = chauffeurs.find((ch: any) => ch.id === id);
    return c ? `${c.firstName} ${c.lastName}` : '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-600';
      case 'en_cours': return 'bg-blue-500/20 text-blue-400 border-blue-600';
      case 'confirmed': return 'bg-amber-500/20 text-amber-400 border-amber-600';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-600';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-600';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-800/30 p-2 min-h-[100px] border border-gray-800/50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayMissions = getMissionsForDate(date);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[100px] border border-gray-800/50 ${
            isToday ? 'bg-amber-500/5' : 'bg-gray-900/50'
          }`}
          style={isToday ? { borderColor: GOLD } : {}}
        >
          <p className={`text-sm font-semibold mb-1 ${isToday ? 'text-amber-400' : 'text-gray-400'}`}>
            {day}
          </p>
          <div className="space-y-1">
            {dayMissions.slice(0, 3).map((mission: any) => (
              <div
                key={mission.id}
                className={`text-xs px-1.5 py-0.5 rounded border cursor-pointer transition-all hover:opacity-80 ${getStatusColor(mission.status)}`}
                onClick={() => setLocation(`/missions/${mission.id}`)}
                title={`${mission.pickupAddress || ''} - ${getChauffeurName(mission.chauffeurId)}`}
              >
                <span className="truncate block">{mission.number || `M-${mission.id}`}</span>
              </div>
            ))}
            {dayMissions.length > 3 && (
              <p className="text-xs text-gray-500">+{dayMissions.length - 3} autres</p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const goToToday = () => setCurrentDate(new Date());

  const thisMonthMissions = missions.filter((m: any) => {
    const d = new Date(m.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Planning</h1>
          <p className="text-gray-400 mt-1">Calendrier des missions et reservations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{missions.length}</p>
              <p className="text-gray-400 text-sm">Total missions</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: GOLD }}>{thisMonthMissions.length}</p>
              <p className="text-gray-400 text-sm">Ce mois</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{missions.filter((m: any) => m.status === 'confirmed').length}</p>
              <p className="text-gray-400 text-sm">Confirmees</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{missions.filter((m: any) => m.status === 'en_cours').length}</p>
              <p className="text-gray-400 text-sm">En cours</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300" onClick={goToPreviousMonth}>
                  <ChevronLeft size={16} />
                </Button>
                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300" onClick={goToToday}>
                  Aujourd'hui
                </Button>
                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300" onClick={goToNextMonth}>
                  <ChevronRight size={16} />
                </Button>
              </div>
              <h2 className="text-lg font-semibold text-white capitalize">{monthName}</h2>
              <div className="flex items-center gap-2">
                <Calendar size={18} style={{ color: GOLD }} />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-0 mb-1">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center font-medium text-sm p-2 text-gray-500 bg-gray-800/50">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0">
                  {renderCalendar()}
                </div>
              </>
            )}

            <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/20 border border-green-600"></div>
                <span>Terminee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-600"></div>
                <span>En cours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-600"></div>
                <span>Confirmee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/20 border border-red-600"></div>
                <span>Annulee</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
