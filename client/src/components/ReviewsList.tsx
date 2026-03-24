import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ReviewsListProps {
  missionId: number;
}

function StarDisplay({ value, size = 4 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-${size} w-${size}`}
          fill={value >= star ? "#f59e0b" : "none"}
          stroke={value >= star ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </div>
  );
}

const CRITERIA_LABELS: Record<string, string> = {
  ratingPunctuality: "Ponctualité",
  ratingComfort:     "Confort",
  ratingDriving:     "Conduite",
  ratingCleanliness: "Propreté",
};

export default function ReviewsList({ missionId }: ReviewsListProps) {
  const { data: reviews = [], isLoading } = trpc.reviews.byMission.useQuery({ missionId });

  if (isLoading) return (
    <Card>
      <CardContent className="pt-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );

  if ((reviews as any[]).length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Avis client ({(reviews as any[]).length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(reviews as any[]).map((review: any) => (
          <div key={review.id} className="border rounded-xl p-4 space-y-3">
            {/* Note globale */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarDisplay value={review.rating} size={5} />
                <span className="font-semibold text-lg">{review.rating}/5</span>
              </div>
              <div className="flex items-center gap-2">
                {review.isPublic && <Badge variant="outline" className="text-xs">Public</Badge>}
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>

            {/* Critères détaillés */}
            {(review.ratingPunctuality || review.ratingComfort || review.ratingDriving || review.ratingCleanliness) && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                  const val = review[key];
                  if (!val) return null;
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <StarDisplay value={val} size={3} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Commentaire */}
            {review.comment && (
              <p className="text-sm text-gray-700 italic border-l-2 border-amber-300 pl-3">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
