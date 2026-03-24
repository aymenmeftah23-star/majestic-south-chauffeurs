import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, TrendingUp, Gift, Target, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function Bonuses() {
  const { t } = useLanguage();
  const [isLoading] = useState(false);

  // Mock bonus data
  const bonusPrograms = [
    {
      id: 1,
      name: 'Performance Excellence',
      type: 'rating',
      description: 'Bonus pour les chauffeurs avec note ≥ 4.8',
      criteria: 'Note moyenne ≥ 4.8',
      amount: 50000,
      currency: 'EUR',
      active: true,
      chauffeurCount: 12,
      totalPaid: 600000,
    },
    {
      id: 2,
      name: 'Mission Completion',
      type: 'missions',
      description: 'Bonus pour 100+ missions complétées par mois',
      criteria: '100+ missions/mois',
      amount: 100000,
      currency: 'EUR',
      active: true,
      chauffeurCount: 8,
      totalPaid: 800000,
    },
    {
      id: 3,
      name: 'Zero Cancellation',
      type: 'cancellation',
      description: 'Bonus pour zéro annulation sur 30 jours',
      criteria: '0 annulation/30j',
      amount: 75000,
      currency: 'EUR',
      active: true,
      chauffeurCount: 15,
      totalPaid: 1125000,
    },
    {
      id: 4,
      name: 'Referral Program',
      type: 'referral',
      description: 'Commission pour chaque nouveau chauffeur recruté',
      criteria: 'Par chauffeur recruté',
      amount: 150000,
      currency: 'EUR',
      active: false,
      chauffeurCount: 5,
      totalPaid: 750000,
    },
  ];

  const chauffeurBonuses = [
    {
      chauffeurId: 1,
      name: 'Jean Dupont',
      rating: 4.9,
      missions: 1250,
      cancellations: 0,
      totalBonusEarned: 225000,
      thisMonth: 50000,
      programs: ['Performance Excellence', 'Mission Completion', 'Zero Cancellation'],
    },
    {
      chauffeurId: 2,
      name: 'Marie Martin',
      rating: 4.8,
      missions: 980,
      cancellations: 2,
      totalBonusEarned: 175000,
      thisMonth: 50000,
      programs: ['Performance Excellence', 'Zero Cancellation'],
    },
    {
      chauffeurId: 3,
      name: 'Pierre Durand',
      rating: 4.7,
      missions: 1100,
      cancellations: 1,
      totalBonusEarned: 150000,
      thisMonth: 25000,
      programs: ['Mission Completion'],
    },
  ];

  const totalBonusesThisMonth = chauffeurBonuses.reduce((sum, c) => sum + c.thisMonth, 0);
  const totalBonusesPaid = bonusPrograms.reduce((sum, p) => sum + p.totalPaid, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('bonuses.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('bonuses.description')}</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('bonuses.new')}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Programmes actifs</p>
                  <p className="text-2xl font-bold">{bonusPrograms.filter(p => p.active).length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ce mois</p>
                  <p className="text-2xl font-bold">€{(totalBonusesThisMonth / 100).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total payé</p>
                  <p className="text-2xl font-bold">€{(totalBonusesPaid / 100).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chauffeurs</p>
                  <p className="text-2xl font-bold">{chauffeurBonuses.length}</p>
                </div>
                <Gift className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bonus Programs */}
        <Card>
          <CardHeader>
            <CardTitle>{t('bonuses.programs')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bonusPrograms.map((program) => (
                <div key={program.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge className={program.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {program.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">€{(program.amount / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">par chauffeur</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-muted rounded">
                    <div>
                      <p className="text-xs text-muted-foreground">Critères</p>
                      <p className="font-semibold text-sm">{program.criteria}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Chauffeurs éligibles</p>
                      <p className="font-semibold text-sm">{program.chauffeurCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total payé</p>
                      <p className="font-semibold text-sm">€{(program.totalPaid / 100).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Modifier</Button>
                    <Button size="sm" variant="outline">Détails</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chauffeur Bonuses */}
        <Card>
          <CardHeader>
            <CardTitle>{t('bonuses.chauffeurBonuses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                chauffeurBonuses.map((bonus) => (
                  <div key={bonus.chauffeurId} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{bonus.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bonus.missions} missions • Note: {bonus.rating}/5
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">€{(bonus.thisMonth / 100).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">ce mois</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {bonus.programs.map((prog) => (
                        <Badge key={prog} variant="outline" className="text-xs">
                          {prog}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total gagné: €{(bonus.totalBonusEarned / 100).toFixed(2)}</span>
                      <Button size="sm" variant="ghost">Détails</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
