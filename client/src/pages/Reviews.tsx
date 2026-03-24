import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Star, Trash2, TrendingUp, Users, Award } from 'lucide-react';

const GOLD = "#C9A84C";

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  const { data: reviews = [], isLoading, refetch } = trpc.reviews.list.useQuery();
  const { data: missions = [] } = trpc.missions.getAll.useQuery();
  const { data: chauffeursList = [] } = trpc.chauffeurs.getAll.useQuery();

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const filtered = filter === 'all'
    ? reviews
    : reviews.filter((r: any) => r.rating === parseInt(filter));

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const withPunctuality = reviews.filter((r: any) => r.ratingPunctuality);
  const withComfort = reviews.filter((r: any) => r.ratingComfort);
  const withDriving = reviews.filter((r: any) => r.ratingDriving);
  const withCleanliness = reviews.filter((r: any) => r.ratingCleanliness);

  const avgPunctuality = withPunctuality.length > 0
    ? (withPunctuality.reduce((s: number, r: any) => s + r.ratingPunctuality, 0) / withPunctuality.length).toFixed(1) : '-';
  const avgComfort = withComfort.length > 0
    ? (withComfort.reduce((s: number, r: any) => s + r.ratingComfort, 0) / withComfort.length).toFixed(1) : '-';
  const avgDriving = withDriving.length > 0
    ? (withDriving.reduce((s: number, r: any) => s + r.ratingDriving, 0) / withDriving.length).toFixed(1) : '-';
  const avgCleanliness = withCleanliness.length > 0
    ? (withCleanliness.reduce((s: number, r: any) => s + r.ratingCleanliness, 0) / withCleanliness.length).toFixed(1) : '-';

  const getMissionInfo = (missionId: number) => {
    const m = missions.find((m: any) => m.id === missionId);
    return m ? `${m.origin} - ${m.destination}` : `Mission #${missionId}`;
  };

  const getChauffeurName = (chauffeurId: number | null | undefined) => {
    if (!chauffeurId) return 'Non assigne';
    const c = chauffeursList.find((c: any) => c.id === chauffeurId);
    return c?.name || `Chauffeur #${chauffeurId}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Avis Clients</h1>
          <p className="text-gray-400 mt-1">Notations et retours des clients apres chaque mission</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Note moyenne</p>
                  <p className="text-3xl font-bold text-white">{avgRating}</p>
                  <StarRating rating={Math.round(parseFloat(avgRating))} />
                </div>
                <TrendingUp size={32} style={{ color: GOLD }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total avis</p>
                  <p className="text-3xl font-bold text-white">{reviews.length}</p>
                </div>
                <Users size={32} style={{ color: GOLD }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">5 etoiles</p>
                  <p className="text-3xl font-bold text-white">
                    {reviews.filter((r: any) => r.rating === 5).length}
                  </p>
                </div>
                <Award size={32} style={{ color: GOLD }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Criteres detailles</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Ponctualite</span><span className="text-white">{avgPunctuality}/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Confort</span><span className="text-white">{avgComfort}/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Conduite</span><span className="text-white">{avgDriving}/5</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Proprete</span><span className="text-white">{avgCleanliness}/5</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {(['all', '5', '4', '3', '2', '1'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'text-black' : 'border-gray-700 text-gray-300'}
              style={filter === f ? { backgroundColor: GOLD } : {}}
            >
              {f === 'all' ? 'Tous' : `${f} etoiles`}
            </Button>
          ))}
        </div>

        {/* Liste des avis */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Chargement des avis...</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Star size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Aucun avis pour le moment</p>
              <p className="text-gray-500 text-sm mt-2">Les avis apparaitront ici apres les missions terminees</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((review: any) => (
              <Card key={review.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={review.rating} size={18} />
                        <Badge variant="outline" className="border-gray-700 text-gray-300">
                          {review.rating}/5
                        </Badge>
                      </div>
                      <p className="text-white font-medium mb-1">{getMissionInfo(review.missionId)}</p>
                      <p className="text-gray-400 text-sm mb-2">
                        Chauffeur : {getChauffeurName(review.chauffeurId)}
                      </p>
                      {review.comment && (
                        <p className="text-gray-300 text-sm italic border-l-2 pl-3 mt-2" style={{ borderColor: GOLD }}>
                          "{review.comment}"
                        </p>
                      )}
                      {(review.ratingPunctuality || review.ratingComfort || review.ratingDriving || review.ratingCleanliness) && (
                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                          {review.ratingPunctuality && <span>Ponctualite: {review.ratingPunctuality}/5</span>}
                          {review.ratingComfort && <span>Confort: {review.ratingComfort}/5</span>}
                          {review.ratingDriving && <span>Conduite: {review.ratingDriving}/5</span>}
                          {review.ratingCleanliness && <span>Proprete: {review.ratingCleanliness}/5</span>}
                        </div>
                      )}
                      <p className="text-gray-600 text-xs mt-2">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => {
                        if (confirm('Supprimer cet avis ?')) {
                          deleteMutation.mutate({ id: review.id });
                        }
                      }}
                    >
                      <Trash2 size={16} />
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
