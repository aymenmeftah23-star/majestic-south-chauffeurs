import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ReviewFormProps {
  missionId: number;
  clientId: number;
  chauffeurId?: number;
  onSuccess?: () => void;
}

const CRITERIA = [
  { key: "ratingPunctuality", label: "Ponctualité" },
  { key: "ratingComfort",     label: "Confort" },
  { key: "ratingDriving",     label: "Conduite" },
  { key: "ratingCleanliness", label: "Propreté" },
] as const;

function StarRating({
  value, onChange, size = 6,
}: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            className={`h-${size} w-${size} transition-colors`}
            fill={(hovered || value) >= star ? "#f59e0b" : "none"}
            stroke={(hovered || value) >= star ? "#f59e0b" : "#d1d5db"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ missionId, clientId, chauffeurId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [criteria, setCriteria] = useState<Record<string, number>>({
    ratingPunctuality: 0,
    ratingComfort: 0,
    ratingDriving: 0,
    ratingCleanliness: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (rating === 0) return;
    createMutation.mutate({
      missionId,
      clientId,
      chauffeurId,
      rating,
      comment: comment.trim() || undefined,
      ratingPunctuality: criteria.ratingPunctuality || undefined,
      ratingComfort: criteria.ratingComfort || undefined,
      ratingDriving: criteria.ratingDriving || undefined,
      ratingCleanliness: criteria.ratingCleanliness || undefined,
      isPublic: true,
    });
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-semibold text-green-800">Merci pour votre avis !</p>
            <p className="text-sm text-muted-foreground">Votre notation a bien été enregistrée.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Évaluer cette mission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Note globale */}
        <div>
          <p className="text-sm font-medium mb-2">Note globale <span className="text-red-500">*</span></p>
          <StarRating value={rating} onChange={setRating} size={8} />
          {rating > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {["", "Très insatisfait", "Insatisfait", "Correct", "Satisfait", "Très satisfait"][rating]}
            </p>
          )}
        </div>

        {/* Critères détaillés */}
        <div className="grid grid-cols-2 gap-4">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <p className="text-xs font-medium text-muted-foreground mb-1">{c.label}</p>
              <StarRating
                value={criteria[c.key]}
                onChange={(v) => setCriteria(prev => ({ ...prev, [c.key]: v }))}
                size={5}
              />
            </div>
          ))}
        </div>

        {/* Commentaire */}
        <div>
          <p className="text-sm font-medium mb-2">Commentaire (optionnel)</p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez votre expérience..."
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/500</p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || createMutation.isPending}
          className="w-full"
        >
          {createMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours...</>
          ) : (
            "Soumettre l'évaluation"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
