import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Award, TrendingUp, Users } from 'lucide-react';

const GOLD = "#C9A84C";

export default function Bonuses() {
  const { data: missions = [] } = trpc.missions.getAll.useQuery();
  const { data: chauffeurs = [] } = trpc.chauffeurs.getAll.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery();

  const chauffeurStats = chauffeurs.map((ch: any) => {
    const chMissions = missions.filter((m: any) => m.chauffeurId === ch.id);
    const completedMissions = chMissions.filter((m: any) => m.status === 'terminee');
    const totalRevenue = completedMissions.reduce((s: number, m: any) => s + (m.price || 0), 0);
    const chReviews = reviews.filter((r: any) => r.chauffeurId === ch.id);
    const avgRating = chReviews.length > 0
      ? chReviews.reduce((s: number, r: any) => s + r.rating, 0) / chReviews.length
      : 0;

    const basePrime = Math.round(totalRevenue * 0.05);
    const bonusRating = avgRating >= 4.5 && chReviews.length >= 3 ? 50 : 0;
    const bonusMissions = completedMissions.length >= 10 ? 100 : 0;
    const totalPrime = basePrime + bonusRating + bonusMissions;

    return {
      ...ch,
      completedMissions: completedMissions.length,
      totalMissions: chMissions.length,
      totalRevenue,
      avgRating,
      reviewCount: chReviews.length,
      basePrime,
      bonusRating,
      bonusMissions,
      totalPrime,
    };
  }).sort((a: any, b: any) => b.totalPrime - a.totalPrime);

  const totalPrimes = chauffeurStats.reduce((s: number, ch: any) => s + ch.totalPrime, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Primes et Performances</h1>
          <p className="text-gray-400 mt-1">Suivi des primes chauffeurs basees sur les missions et les avis clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total primes</p>
                  <p className="text-3xl font-bold text-white">{totalPrimes} EUR</p>
                </div>
                <Award size={32} style={{ color: GOLD }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Chauffeurs actifs</p>
                  <p className="text-3xl font-bold text-white">{chauffeurs.length}</p>
                </div>
                <Users size={32} style={{ color: GOLD }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Missions terminees</p>
                  <p className="text-3xl font-bold text-white">
                    {missions.filter((m: any) => m.status === 'terminee').length}
                  </p>
                </div>
                <TrendingUp size={32} style={{ color: GOLD }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-white font-medium mb-2">Regles de calcul des primes</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800 rounded p-3">
                <p className="text-gray-400">Prime de base</p>
                <p className="text-white font-medium">5% du chiffre d'affaires genere</p>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <p className="text-gray-400">Bonus satisfaction</p>
                <p className="text-white font-medium">+50 EUR si note moyenne superieure ou egale a 4.5/5 (min. 3 avis)</p>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <p className="text-gray-400">Bonus volume</p>
                <p className="text-white font-medium">+100 EUR si 10+ missions terminees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {chauffeurStats.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Award size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Aucun chauffeur enregistre</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-gray-400 font-medium">Chauffeur</th>
                      <th className="text-center p-4 text-gray-400 font-medium">Missions</th>
                      <th className="text-center p-4 text-gray-400 font-medium">CA genere</th>
                      <th className="text-center p-4 text-gray-400 font-medium">Note</th>
                      <th className="text-center p-4 text-gray-400 font-medium">Prime base</th>
                      <th className="text-center p-4 text-gray-400 font-medium">Bonus</th>
                      <th className="text-right p-4 text-gray-400 font-medium">Total prime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chauffeurStats.map((ch: any, idx: number) => (
                      <tr key={ch.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                              style={{ backgroundColor: idx === 0 ? GOLD : '#374151', color: idx === 0 ? '#000' : '#fff' }}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">{ch.name}</p>
                              <p className="text-gray-500 text-xs">{ch.zones || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center text-white">{ch.completedMissions}/{ch.totalMissions}</td>
                        <td className="p-4 text-center text-white">{ch.totalRevenue} EUR</td>
                        <td className="p-4 text-center">
                          <span className={ch.avgRating >= 4.5 ? 'text-green-400' : ch.avgRating >= 3.5 ? 'text-yellow-400' : 'text-gray-400'}>
                            {ch.avgRating > 0 ? ch.avgRating.toFixed(1) : '-'}/5
                          </span>
                          <span className="text-gray-600 text-xs ml-1">({ch.reviewCount})</span>
                        </td>
                        <td className="p-4 text-center text-white">{ch.basePrime} EUR</td>
                        <td className="p-4 text-center text-green-400">
                          +{ch.bonusRating + ch.bonusMissions} EUR
                        </td>
                        <td className="p-4 text-right font-bold" style={{ color: GOLD }}>
                          {ch.totalPrime} EUR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
