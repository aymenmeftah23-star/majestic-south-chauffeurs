import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Download, TrendingUp, Users, DollarSign, Truck } from 'lucide-react';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Reporting() {
  const { t } = useLanguage();
  const { data: missions, isLoading } = trpc.missions.list.useQuery();
  const [dateRange, setDateRange] = useState('month');

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', missions: 45, revenue: 4500 },
    { month: 'Fév', missions: 52, revenue: 5200 },
    { month: 'Mar', missions: 48, revenue: 4800 },
    { month: 'Avr', missions: 61, revenue: 6100 },
    { month: 'Mai', missions: 55, revenue: 5500 },
    { month: 'Jun', missions: 67, revenue: 6700 },
  ];

  const missionTypeData = [
    { name: t('demands.airport'), value: 35 },
    { name: t('demands.business'), value: 25 },
    { name: t('demands.event'), value: 20 },
    { name: t('demands.other'), value: 20 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const stats = [
    {
      title: t('reporting.totalMissions'),
      value: missions?.length || 0,
      icon: Truck,
      color: 'text-blue-600',
    },
    {
      title: t('reporting.totalRevenue'),
      value: '€45,200',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: t('reporting.activeClients'),
      value: 156,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: t('reporting.avgRating'),
      value: '4.8/5',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('reporting.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('reporting.description')}</p>
          </div>
          <Button size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            {t('reporting.export')}
          </Button>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('common.filter')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t('reporting.thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('reporting.thisMonth')}</SelectItem>
                  <SelectItem value="quarter">{t('reporting.thisQuarter')}</SelectItem>
                  <SelectItem value="year">{t('reporting.thisYear')}</SelectItem>
                  <SelectItem value="custom">{t('reporting.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('reporting.compared')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Charts */}
        {!isLoading && (
          <>
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reporting.monthlyTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="missions"
                      stroke="#3b82f6"
                      name={t('reporting.missions')}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      name={t('reporting.revenue')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mission Types & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Mission Types */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('reporting.missionTypes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={missionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {missionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('reporting.revenueByCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={missionTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" name={t('reporting.revenue')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reporting.summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="font-medium">{t('reporting.totalMissions')}</span>
                    <span className="text-2xl font-bold">{missions?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="font-medium">{t('reporting.completedMissions')}</span>
                    <span className="text-2xl font-bold">
                      {missions?.filter(m => m.status === 'terminee').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="font-medium">{t('reporting.avgMissionPrice')}</span>
                    <span className="text-2xl font-bold">€85.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('reporting.completionRate')}</span>
                    <span className="text-2xl font-bold">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
