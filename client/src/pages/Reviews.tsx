import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Reviews() {
  const { t } = useLanguage();
  const [isLoading] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      missionId: 'M-2026-045',
      chauffeur: 'Jean Dupont',
      rating: 5,
      comment: 'Excellent service! Très professionnel et ponctuel.',
      date: '2026-03-23',
      verified: true,
    },
    {
      id: 2,
      missionId: 'M-2026-044',
      chauffeur: 'Marie Martin',
      rating: 4,
      comment: 'Bon service, véhicule confortable. Petit retard de 5 minutes.',
      date: '2026-03-22',
      verified: true,
    },
    {
      id: 3,
      missionId: 'M-2026-043',
      chauffeur: 'Pierre Durand',
      rating: 5,
      comment: 'Parfait! Je recommande vivement Majestic South Chauffeurs.',
      date: '2026-03-21',
      verified: true,
    },
  ];

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reviews.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('reviews.description')}</p>
        </div>

        {/* Rating Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('reviews.averageRating')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{averageRating}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
                <div className="mt-2">{renderStars(Math.round(parseFloat(averageRating as string)))}</div>
              </div>

              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter((r) => r.rating === rating).length;
                    const percentage = (count / reviews.length) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating}/5</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Write Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('reviews.writeReview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('reviews.rating')}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= newRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('reviews.comment')}</label>
              <Textarea
                placeholder={t('reviews.commentPlaceholder')}
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows={4}
              />
            </div>

            <Button>{t('reviews.submit')}</Button>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Reviews List */}
        {!isLoading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{review.chauffeur}</h3>
                          {review.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {t('reviews.verified')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('reviews.mission')}: {review.missionId}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <div>{renderStars(review.rating)}</div>

                    <p className="text-sm">{review.comment}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('reviews.noReviews')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
