import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Planning() {
  const { t } = useLanguage();
  const { data: missions, isLoading } = trpc.missions.list.useQuery();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 23));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMissionsForDate = (date: Date) => {
    return missions?.filter(mission => {
      const missionDate = new Date(mission.date);
      return (
        missionDate.getDate() === date.getDate() &&
        missionDate.getMonth() === date.getMonth() &&
        missionDate.getFullYear() === date.getFullYear()
      );
    }) || [];
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-muted/30 p-2 min-h-24"></div>);
    }

    // Days of the month
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
          className={`border p-2 min-h-24 ${
            isToday ? 'bg-blue-50 dark:bg-blue-950 border-blue-300' : 'bg-white dark:bg-slate-950'
          }`}
        >
          <p className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : ''}`}>
            {day}
          </p>
          <div className="space-y-1">
            {dayMissions.slice(0, 2).map((mission) => (
              <div
                key={mission.id}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 p-1 rounded truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                title={`${mission.origin} → ${mission.destination}`}
              >
                {mission.number || `M-${mission.id}`}
              </div>
            ))}
            {dayMissions.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{dayMissions.length - 2} {t('common.more')}
              </p>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('planning.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('planning.description')}</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToToday}
                >
                  {t('planning.today')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-lg font-semibold capitalize">{monthName}</h2>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  onClick={() => setViewMode('day')}
                >
                  {t('planning.day')}
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewMode('week')}
                >
                  {t('planning.week')}
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                >
                  {t('planning.month')}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Calendar */}
        {!isLoading && (
          <Card>
            <CardContent className="pt-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm p-2 bg-muted">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-0 border border-border">
                {renderCalendar()}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-blue-300"></div>
                  <span>{t('planning.today')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded"></div>
                  <span>{t('planning.missions')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('planning.totalMissions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{missions?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('planning.thisMonth')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missions?.filter(m => {
                    const d = new Date(m.date);
                    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                  }).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('planning.thisWeek')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missions?.filter(m => {
                    const d = new Date(m.date);
                    const today = new Date();
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay() + 1);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    return d >= weekStart && d <= weekEnd;
                  }).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
