import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Globe, Loader2, Trash2,
  FileText, AlertTriangle, CheckCircle, Clock, Calendar, Download,
  Plus, X, Shield
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

const STATUS_COLORS: Record<string, string> = {
  disponible:    "bg-green-100 text-green-800",
  occupe:        "bg-yellow-100 text-yellow-800",
  indisponible:  "bg-red-100 text-red-800",
  conge:         "bg-blue-100 text-blue-800",
  suspendu:      "bg-gray-100 text-gray-800",
};

// Types de documents VTC obligatoires
const DOCUMENT_TYPES = [
  { key: "carte_vtc",            label: "Carte professionnelle VTC",    required: true,  validityMonths: 60 },
  { key: "assurance_rc",         label: "Assurance RC professionnelle", required: true,  validityMonths: 12 },
  { key: "visite_technique",     label: "Contrôle technique",           required: true,  validityMonths: 24 },
  { key: "permis_conduire",      label: "Permis de conduire",           required: true,  validityMonths: 120 },
  { key: "casier_judiciaire",    label: "Extrait casier judiciaire",    required: true,  validityMonths: 3 },
  { key: "kbis",                 label: "Extrait Kbis / URSSAF",        required: false, validityMonths: 12 },
  { key: "carte_grise",          label: "Carte grise véhicule",         required: false, validityMonths: null },
  { key: "visite_medicale",      label: "Visite médicale",              required: false, validityMonths: 24 },
];

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DocumentStatusBadge({ days }: { days: number | null }) {
  if (days === null) return <Badge variant="outline" className="text-gray-400">Non renseigné</Badge>;
  if (days < 0)  return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><X className="h-3 w-3" />Expiré</Badge>;
  if (days <= 30) return <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Expire dans {days}j</Badge>;
  if (days <= 90) return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3" />{days}j restants</Badge>;
  return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Valide</Badge>;
}

export default function ChauffeurDetail() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  // État local pour les documents (en attendant une vraie table DB)
  const [documents, setDocuments] = useState<Record<string, { expiryDate: string; notes: string }>>({});
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [docForm, setDocForm] = useState({ expiryDate: "", notes: "" });

  const { data: chauffeur, isLoading } = trpc.chauffeurs.getById.useQuery({ id }, { enabled: !!id });
  const deleteMutation = trpc.chauffeurs.delete.useMutation({ onSuccess: () => navigate("/chauffeurs") });

  const handleSaveDoc = (docKey: string) => {
    setDocuments(prev => ({ ...prev, [docKey]: { expiryDate: docForm.expiryDate, notes: docForm.notes } }));
    setEditingDoc(null);
    setDocForm({ expiryDate: "", notes: "" });
  };

  const handleEditDoc = (docKey: string) => {
    const existing = documents[docKey];
    setDocForm({ expiryDate: existing?.expiryDate || "", notes: existing?.notes || "" });
    setEditingDoc(docKey);
  };

  // Calcul des alertes
  const expiredDocs = DOCUMENT_TYPES.filter(d => {
    const doc = documents[d.key];
    if (!doc?.expiryDate) return false;
    return getDaysUntilExpiry(doc.expiryDate)! < 0;
  });
  const expiringDocs = DOCUMENT_TYPES.filter(d => {
    const doc = documents[d.key];
    if (!doc?.expiryDate) return false;
    const days = getDaysUntilExpiry(doc.expiryDate)!;
    return days >= 0 && days <= 30;
  });

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </DashboardLayout>
  );

  if (!chauffeur) return (
    <DashboardLayout>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chauffeur introuvable</p>
        <Button className="mt-4" onClick={() => navigate("/chauffeurs")}>{t("common.back")}</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chauffeurs")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{chauffeur.name}</h1>
              <p className="text-muted-foreground">
                {chauffeur.type === "interne" ? t("chauffeurs.internal") : t("chauffeurs.external")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[chauffeur.status || "disponible"]}>{chauffeur.status}</Badge>
            {/* Export iCal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/api/ical/driver/${id}`, "_blank")}
              className="flex items-center gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              Export iCal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirm("Supprimer ce chauffeur ?") && deleteMutation.mutate({ id })}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Alertes documents */}
        {(expiredDocs.length > 0 || expiringDocs.length > 0) && (
          <div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800 text-sm">Alertes documents</p>
                {expiredDocs.length > 0 && (
                  <p className="text-orange-700 text-sm mt-1">
                    Documents expirés : {expiredDocs.map(d => d.label).join(", ")}
                  </p>
                )}
                {expiringDocs.length > 0 && (
                  <p className="text-orange-700 text-sm mt-1">
                    Expirent dans moins de 30 jours : {expiringDocs.map(d => d.label).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("common.contact")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chauffeur.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{chauffeur.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{chauffeur.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Langues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("chauffeurs.languages")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chauffeur.languages ? (
                <div className="flex flex-wrap gap-2">
                  {chauffeur.languages.split(",").map((l: string) => (
                    <Badge key={l} variant="outline">{l.trim()}</Badge>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">—</p>}
            </CardContent>
          </Card>

          {/* Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("chauffeurs.zones")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chauffeur.zones ? (
                <div className="flex flex-wrap gap-2">
                  {chauffeur.zones.split(",").map((z: string) => (
                    <Badge key={z} variant="secondary">{z.trim()}</Badge>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">—</p>}
            </CardContent>
          </Card>

          {/* Notes */}
          {chauffeur.notes && (
            <Card>
              <CardHeader><CardTitle>{t("common.notes")}</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{chauffeur.notes}</p></CardContent>
            </Card>
          )}
        </div>

        {/* ── SECTION DOCUMENTS VTC ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Documents professionnels VTC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DOCUMENT_TYPES.map((docType) => {
                const doc = documents[docType.key];
                const days = doc?.expiryDate ? getDaysUntilExpiry(doc.expiryDate) : null;
                const isEditing = editingDoc === docType.key;

                return (
                  <div key={docType.key} className="border rounded-xl overflow-hidden">
                    {/* Ligne principale */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{docType.label}</span>
                            {docType.required && (
                              <span className="text-xs text-red-500 font-medium">Obligatoire</span>
                            )}
                          </div>
                          {doc?.expiryDate && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Expiration : {new Date(doc.expiryDate).toLocaleDateString("fr-FR")}
                              {doc.notes && ` — ${doc.notes}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DocumentStatusBadge days={days} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => isEditing ? setEditingDoc(null) : handleEditDoc(docType.key)}
                          className="text-xs"
                        >
                          {isEditing ? "Annuler" : (doc ? "Modifier" : "Renseigner")}
                        </Button>
                      </div>
                    </div>

                    {/* Formulaire d'édition inline */}
                    {isEditing && (
                      <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1">
                              Date d&apos;expiration
                            </label>
                            <input
                              type="date"
                              value={docForm.expiryDate}
                              onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border text-sm bg-background"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">
                              Notes (numéro, organisme...)
                            </label>
                            <input
                              type="text"
                              value={docForm.notes}
                              onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                              placeholder="Ex : N° 123456, renouvelé le..."
                              className="w-full px-3 py-2 rounded-lg border text-sm bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleSaveDoc(docType.key)}
                            disabled={!docForm.expiryDate}
                          >
                            Enregistrer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDoc(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résumé de conformité */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
              <p className="text-sm font-semibold mb-2">Conformité documentaire</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {DOCUMENT_TYPES.filter(d => {
                      const doc = documents[d.key];
                      if (!doc?.expiryDate) return false;
                      return getDaysUntilExpiry(doc.expiryDate)! > 30;
                    }).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Valides</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{expiringDocs.length}</div>
                  <div className="text-xs text-muted-foreground">Expirent bientôt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{expiredDocs.length}</div>
                  <div className="text-xs text-muted-foreground">Expirés</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
