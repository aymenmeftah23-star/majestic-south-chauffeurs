import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Euro, CheckCircle, XCircle, ArrowRight, Loader2, Trash2,
  Send, FileText, Clock, AlertCircle, Car, Download
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye:    "Envoyé",
  consulte:  "Consulté",
  accepte:   "Accepté",
  refuse:    "Refusé",
  expire:    "Expiré",
};

const STATUS_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-800",
  envoye:    "bg-blue-100 text-blue-800",
  consulte:  "bg-yellow-100 text-yellow-800",
  accepte:   "bg-green-100 text-green-800",
  refuse:    "bg-red-100 text-red-800",
  expire:    "bg-gray-200 text-gray-600",
};

// Timeline de progression du devis
const QUOTE_STEPS = [
  { key: "brouillon", label: "Brouillon" },
  { key: "envoye",    label: "Envoyé" },
  { key: "consulte",  label: "Consulté" },
  { key: "accepte",   label: "Accepté" },
];

const STEP_ORDER: Record<string, number> = {
  brouillon: 0, envoye: 1, consulte: 2, accepte: 3, refuse: -1, expire: -1,
};

export default function QuoteDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const [convertSuccess, setConvertSuccess] = useState<{ missionNumber: string } | null>(null);

  const { data: quote, isLoading, refetch } = trpc.quotes.getById.useQuery({ id }, { enabled: !!id });

  const updateMutation = trpc.quotes.update.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.quotes.delete.useMutation({ onSuccess: () => navigate("/quotes") });

  // Conversion automatique devis → mission
  const convertMutation = trpc.quotes.convertToMission.useMutation({
    onSuccess: (data) => {
      setConvertSuccess({ missionNumber: data.missionNumber });
      refetch();
    },
    onError: (err) => alert("Erreur lors de la conversion : " + err.message),
  });

  // Accepter ET convertir en une seule action
  const handleAcceptAndConvert = async () => {
    if (!confirm("Accepter ce devis et créer la mission automatiquement ?")) return;
    try {
      await updateMutation.mutateAsync({ id, status: "accepte" });
      await convertMutation.mutateAsync({ quoteId: id });
    } catch (e) {
      // Erreur gérée par onError
    }
  };

  const handleConvertOnly = () => {
    if (confirm("Convertir ce devis en mission ?")) {
      convertMutation.mutate({ quoteId: id });
    }
  };

  const handleDelete = () => {
    if (confirm("Supprimer ce devis définitivement ?")) deleteMutation.mutate({ id });
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  if (!quote) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Devis introuvable</p>
        <Button className="mt-4" onClick={() => navigate("/quotes")}>{t("common.back")}</Button>
      </div>
    </DashboardLayout>
  );

  const currentStep = STEP_ORDER[quote.status] ?? 0;
  const isRefused = quote.status === "refuse" || quote.status === "expire";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Bannière de succès de conversion */}
        {convertSuccess && (
          <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">Mission créée automatiquement</p>
              <p className="text-green-700 text-sm mt-0.5">
                La mission <strong>{convertSuccess.missionNumber}</strong> a été créée depuis ce devis.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => navigate("/missions")}
              >
                <Car className="h-4 w-4 mr-1.5" />
                Voir la mission
              </Button>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/quotes")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("quotes.detail")} {quote.number}
              </h1>
              <p className="text-muted-foreground">
                Créé le {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={STATUS_COLORS[quote.status || "brouillon"]}>
              {STATUS_LABELS[quote.status || "brouillon"] ?? quote.status}
            </Badge>

            {/* Télécharger le PDF */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/api/pdf/quote/${id}`, "_blank")}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>

            {/* Envoyer le devis */}
            {quote.status === "brouillon" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateMutation.mutate({ id, status: "envoye" })}
                disabled={updateMutation.isPending}
                className="flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                {t("quotes.send")}
              </Button>
            )}

            {/* Accepter + Convertir en mission (action principale) */}
            {(quote.status === "envoye" || quote.status === "consulte") && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1.5"
                  onClick={handleAcceptAndConvert}
                  disabled={convertMutation.isPending || updateMutation.isPending}
                >
                  {(convertMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Accepter et créer la mission
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateMutation.mutate({ id, status: "refuse" })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  {t("quotes.reject")}
                </Button>
              </>
            )}

            {/* Convertir uniquement (si déjà accepté mais pas encore converti) */}
            {quote.status === "accepte" && !convertSuccess && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5"
                onClick={handleConvertOnly}
                disabled={convertMutation.isPending}
              >
                {convertMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {t("quotes.convertToMission")}
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline de progression */}
        {!isRefused && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                {QUOTE_STEPS.map((step, idx) => {
                  const done = currentStep >= idx;
                  const active = currentStep === idx;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          style={{
                            background: done ? "#16a34a" : "#f3f4f6",
                            border: `2px solid ${done ? "#16a34a" : "#d1d5db"}`,
                          }}
                        >
                          {done ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        <div className={`text-xs mt-1.5 font-medium ${done ? "text-green-700" : "text-gray-400"}`}>
                          {step.label}
                        </div>
                      </div>
                      {idx < QUOTE_STEPS.length - 1 && (
                        <div
                          className="h-0.5 flex-1 mx-2 mb-5 transition-all"
                          style={{ background: currentStep > idx ? "#16a34a" : "#e5e7eb" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Devis refusé */}
        {isRefused && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-800 font-medium">
              Ce devis a été {quote.status === "refuse" ? "refusé" : "expiré"}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                {t("quotes.pricing")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("quotes.priceTTC")}</span>
                <span className="font-bold text-2xl">{quote.price} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("quotes.priceHT")}</span>
                <span>{quote.priceHT} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span>{(quote.price - quote.priceHT).toFixed(2)} €</span>
              </div>
              <Separator />
              {quote.validUntil && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {t("quotes.validUntil")}
                  </span>
                  <span className={new Date(quote.validUntil) < new Date() ? "text-red-600 font-medium" : ""}>
                    {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demande associée */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("quotes.demand")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Demande associée #{quote.demandId}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/demands/${quote.demandId}`)}
              >
                {t("common.viewDetails")}
              </Button>

              {/* Lien vers la mission créée */}
              {convertSuccess && (
                <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs text-green-700 font-medium">Mission créée</p>
                  <p className="text-sm text-green-800">{convertSuccess.missionNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-green-700 hover:text-green-900 p-0 h-auto text-xs"
                    onClick={() => navigate("/missions")}
                  >
                    Voir dans les missions →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {quote.notes && (
          <Card>
            <CardHeader><CardTitle>{t("common.notes")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{quote.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
