import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { trpc } from '@/lib/trpc';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { data: reviews = [], isLoading } = trpc.reviews.list.useQuery();
  const avgRating = (reviews as any[]).length > 0
    ? (reviews as any[]).reduce((s: number, r: any) => s + r.rating, 0) / (reviews as any[]).length
    : 0;
  const fiveStars = (reviews as any[]).filter((r: any) => r.rating === 5).length;
  const fourStars = (reviews as any[]).filter((r: any) => r.rating === 4).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            Avis clients
          </h1>
          <p className="text-muted-foreground mt-1">{(reviews as any[]).length} avis reçus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)} / 5</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total avis</p>
                <p className="text-2xl font-bold">{(reviews as any[]).length}</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">5 étoiles</p>
                <p className="text-2xl font-bold text-amber-600">{fiveStars}</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">4 étoiles</p>
                <p className="text-2xl font-bold text-blue-600">{fourStars}</p>
              </div>
            </div>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Répartition des notes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = (reviews as any[]).filter((r: any) => r.rating === star).length;
                const pct = (reviews as any[]).length > 0 ? (count / (reviews as any[]).length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{star}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {isLoading && <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}

        {!isLoading && (
          <div className="space-y-4">
            {(reviews as any[]).length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun avis pour le moment</p>
              </CardContent></Card>
            ) : (
              (reviews as any[]).map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{(review.clientName || 'C').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{review.clientName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{review.missionNumber}</span>
                          </div>
                          <StarRating rating={review.rating} />
                          {review.comment && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">"{review.comment}"</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
