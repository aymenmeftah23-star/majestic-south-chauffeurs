import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

// Couleurs Majestic South
const GOLD = "#C9A84C";
const DARK = "#1a1a1a";
const LIGHT_GRAY = "#f5f5f5";
const MID_GRAY = "#888888";
const TEXT_DARK = "#222222";

interface MissionData {
  id: number;
  number?: string;
  client?: { name: string; email?: string; phone?: string; company?: string };
  chauffeur?: { name: string; phone?: string; licenseNumber?: string };
  vehicle?: { brand: string; model: string; licensePlate: string; color?: string };
  origin: string;
  destination: string;
  date: Date | string;
  status: string;
  price?: number;
  notes?: string;
  specialInstructions?: string;
}

interface QuoteData {
  id: number;
  number: string;
  client?: { name: string; email?: string; phone?: string; company?: string };
  origin?: string;
  destination?: string;
  date?: Date | string;
  passengers?: number;
  serviceType?: string;
  price: number;
  priceHT?: number;
  status: string;
  validUntil?: Date | string;
  notes?: string;
}

interface InvoiceData {
  id: number;
  number: string;
  client?: { name: string; email?: string; phone?: string; company?: string; address?: string };
  missions?: MissionData[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  status: string;
  dueDate?: Date | string;
  issueDate?: Date | string;
  notes?: string;
}

function bufferFromStream(stream: PassThrough): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(d: Date | string | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string, docNumber: string) {
  // Background header
  doc.rect(0, 0, doc.page.width, 120).fill(DARK);

  // Company name
  doc.fillColor(GOLD).fontSize(22).font("Helvetica-Bold")
    .text("MAJESTIC SOUTH CHAUFFEURS", 50, 30);

  doc.fillColor("#aaaaaa").fontSize(9).font("Helvetica")
    .text("Service VTC Premium — Marseille", 50, 58);

  doc.fillColor("#666666").fontSize(8)
    .text("contact@mschauffeur.fr  |  +33 6 95 61 89 98  |  Bât D, 131 Bd de Saint-Loup, 13010 Marseille", 50, 72);

  // Gold line
  doc.rect(0, 90, doc.page.width, 2).fill(GOLD);

  // Document type badge
  const badgeX = doc.page.width - 200;
  doc.rect(badgeX, 20, 160, 50).fill(GOLD);
  doc.fillColor(DARK).fontSize(14).font("Helvetica-Bold")
    .text(title, badgeX, 28, { width: 160, align: "center" });
  doc.fillColor(DARK).fontSize(10).font("Helvetica")
    .text(docNumber, badgeX, 48, { width: 160, align: "center" });

  doc.fillColor(TEXT_DARK).fontSize(10).font("Helvetica");
}

function drawInfoBlock(doc: PDFKit.PDFDocument, x: number, y: number, width: number, title: string, lines: string[]) {
  doc.rect(x, y, width, 20).fill(GOLD);
  doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
    .text(title, x + 8, y + 6);

  const blockHeight = Math.max(60, lines.length * 16 + 20);
  doc.rect(x, y + 20, width, blockHeight).fill(LIGHT_GRAY);

  doc.fillColor(TEXT_DARK).fontSize(9).font("Helvetica");
  lines.forEach((line, i) => {
    doc.text(line, x + 8, y + 28 + i * 16);
  });
}

// ============================================================
// Bon de Mission PDF
// ============================================================
export async function generateMissionPDF(mission: MissionData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  const missionNum = mission.number || `MSC-${String(mission.id).padStart(4, "0")}`;

  drawHeader(doc, "BON DE MISSION", "", missionNum);

  let y = 140;

  // Date d'émission
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
    .text(`Émis le : ${formatDate(new Date())}`, 50, y);
  y += 25;

  // Blocks client + chauffeur
  const blockW = (doc.page.width - 120) / 2;

  drawInfoBlock(doc, 50, y, blockW, "CLIENT", [
    mission.client?.name || "—",
    mission.client?.company || "",
    mission.client?.phone || "",
    mission.client?.email || "",
  ].filter(Boolean));

  drawInfoBlock(doc, 50 + blockW + 20, y, blockW, "CHAUFFEUR", [
    mission.chauffeur?.name || "Non assigné",
    mission.chauffeur?.licenseNumber || "",
    mission.chauffeur?.phone || "",
  ].filter(Boolean));

  y += 120;

  // Véhicule
  if (mission.vehicle) {
    drawInfoBlock(doc, 50, y, doc.page.width - 100, "VÉHICULE", [
      `${mission.vehicle.brand} ${mission.vehicle.model}  |  Immatriculation : ${mission.vehicle.licensePlate}  |  Couleur : ${mission.vehicle.color || "—"}`,
    ]);
    y += 70;
  }

  // Trajet
  doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
  doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
    .text("DÉTAILS DU TRAJET", 58, y + 6);
  y += 20;

  doc.rect(50, y, doc.page.width - 100, 90).fill(LIGHT_GRAY);

  const col1 = 58, col2 = 300;

  doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica")
    .text("Date & Heure", col1, y + 10)
    .text("Statut", col2, y + 10);

  doc.fillColor(TEXT_DARK).fontSize(10).font("Helvetica-Bold")
    .text(formatDateTime(mission.date), col1, y + 22)
    .text(mission.status.toUpperCase(), col2, y + 22);

  doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica")
    .text("Adresse de départ", col1, y + 44)
    .text("Adresse d'arrivée", col2, y + 44);

  doc.fillColor(TEXT_DARK).fontSize(9).font("Helvetica")
    .text(mission.origin, col1, y + 56, { width: 220 })
    .text(mission.destination, col2, y + 56, { width: 220 });

  y += 100;

  // Prix
  if (mission.price) {
    doc.rect(50, y, doc.page.width - 100, 40).fill("#f0e8d0");
    doc.rect(50, y, 3, 40).fill(GOLD);
    doc.fillColor(TEXT_DARK).fontSize(11).font("Helvetica-Bold")
      .text(`Montant TTC : ${mission.price.toFixed(2)} €`, 65, y + 14);
    y += 55;
  }

  // Notes
  if (mission.notes || mission.specialInstructions) {
    doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
      .text("NOTES & INSTRUCTIONS", 58, y + 6);
    y += 20;
    doc.rect(50, y, doc.page.width - 100, 60).fill(LIGHT_GRAY);
    doc.fillColor(TEXT_DARK).fontSize(9).font("Helvetica");
    if (mission.notes) doc.text(`Notes : ${mission.notes}`, 58, y + 10);
    if (mission.specialInstructions) doc.text(`Instructions : ${mission.specialInstructions}`, 58, y + 28);
    y += 70;
  }

  // Signatures
  y = Math.max(y, doc.page.height - 180);
  doc.rect(50, y, (doc.page.width - 120) / 2, 80).stroke("#cccccc");
  doc.rect(50 + (doc.page.width - 120) / 2 + 20, y, (doc.page.width - 120) / 2, 80).stroke("#cccccc");

  doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica")
    .text("Signature Chauffeur", 58, y + 8)
    .text("Signature Client", 58 + (doc.page.width - 120) / 2 + 28, y + 8);

  // Footer
  doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(DARK);
  doc.fillColor("#666666").fontSize(7).font("Helvetica")
    .text("Majestic South Chauffeurs — SIRET : 943 399 311 00019 — TVA : FR39 943 399 311 — SAS au capital de 1 500 €", 50, doc.page.height - 28, { align: "center", width: doc.page.width - 100 });

  doc.end();
  return bufferFromStream(stream);
}

// ============================================================
// Devis PDF
// ============================================================
export async function generateQuotePDF(quote: QuoteData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  drawHeader(doc, "DEVIS", "", quote.number);

  let y = 140;

  // Dates
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
    .text(`Émis le : ${formatDate(new Date())}`, 50, y)
    .text(`Valable jusqu'au : ${formatDate(quote.validUntil)}`, 300, y);
  y += 30;

  // Client
  drawInfoBlock(doc, 50, y, doc.page.width - 100, "CLIENT", [
    quote.client?.name || "—",
    quote.client?.company || "",
    quote.client?.phone || "",
    quote.client?.email || "",
  ].filter(Boolean));
  y += 110;

  // Détails prestation
  doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
  doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
    .text("PRESTATION", 58, y + 6);
  y += 20;

  // Table header
  doc.rect(50, y, doc.page.width - 100, 22).fill("#333333");
  doc.fillColor("white").fontSize(8).font("Helvetica-Bold")
    .text("Description", 58, y + 7)
    .text("Détails", 250, y + 7)
    .text("Montant HT", doc.page.width - 170, y + 7);
  y += 22;

  // Table row
  doc.rect(50, y, doc.page.width - 100, 50).fill(LIGHT_GRAY);
  doc.rect(50, y, 3, 50).fill(GOLD);

  const serviceLabel: Record<string, string> = {
    airport: "Transfert Aéroport", business: "Voyage d'Affaires",
    event: "Événement Privé", disposal: "Mise à Disposition",
    tourism: "Tourisme & Excursion", other: "Transport VTC",
  };

  doc.fillColor(TEXT_DARK).fontSize(9).font("Helvetica-Bold")
    .text(serviceLabel[quote.serviceType || "other"] || "Transport VTC", 65, y + 8);
  doc.font("Helvetica").fontSize(8).fillColor(MID_GRAY)
    .text(`${quote.origin || "—"} - ${quote.destination || "—"}`, 65, y + 24)
    .text(`${formatDate(quote.date)} · ${quote.passengers || 1} passager(s)`, 65, y + 36);

  doc.fillColor(TEXT_DARK).fontSize(10).font("Helvetica-Bold")
    .text(`${(quote.priceHT || quote.price / 1.2).toFixed(2)} €`, doc.page.width - 160, y + 18);
  y += 60;

  // Totaux
  const totalsX = doc.page.width - 220;
  const priceHT = quote.priceHT || quote.price / 1.2;
  const tva = quote.price - priceHT;

  doc.rect(totalsX, y, 170, 20).fill(LIGHT_GRAY);
  doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica")
    .text("Sous-total HT", totalsX + 10, y + 6)
    .text(`${priceHT.toFixed(2)} €`, totalsX + 100, y + 6, { width: 60, align: "right" });
  y += 20;

  doc.rect(totalsX, y, 170, 20).fill(LIGHT_GRAY);
  doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica")
    .text("TVA (20%)", totalsX + 10, y + 6)
    .text(`${tva.toFixed(2)} €`, totalsX + 100, y + 6, { width: 60, align: "right" });
  y += 20;

  doc.rect(totalsX, y, 170, 30).fill(GOLD);
  doc.fillColor(DARK).fontSize(12).font("Helvetica-Bold")
    .text("TOTAL TTC", totalsX + 10, y + 8)
    .text(`${quote.price.toFixed(2)} €`, totalsX + 80, y + 8, { width: 80, align: "right" });
  y += 50;

  // Conditions
  if (quote.notes) {
    doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("NOTES", 58, y + 6);
    y += 20;
    doc.rect(50, y, doc.page.width - 100, 40).fill(LIGHT_GRAY);
    doc.fillColor(TEXT_DARK).fontSize(8).font("Helvetica").text(quote.notes, 58, y + 10);
    y += 50;
  }

  // Conditions générales
  y = Math.max(y, doc.page.height - 150);
  doc.rect(50, y, doc.page.width - 100, 60).fill(LIGHT_GRAY);
  doc.fillColor(MID_GRAY).fontSize(7).font("Helvetica")
    .text("CONDITIONS : Ce devis est valable 30 jours à compter de sa date d'émission. Tout trajet confirmé est soumis à nos conditions générales de vente disponibles sur notre site. Annulation gratuite jusqu'à 24h avant le départ.", 58, y + 10, { width: doc.page.width - 116 });

  // Footer
  doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(DARK);
  doc.fillColor("#666666").fontSize(7).font("Helvetica")
    .text("Majestic South Chauffeurs — SIRET : 943 399 311 00019 — TVA : FR39 943 399 311 — SAS au capital de 1 500 €", 50, doc.page.height - 28, { align: "center", width: doc.page.width - 100 });

  doc.end();
  return bufferFromStream(stream);
}

// ============================================================
// Facture PDF
// ============================================================
export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  drawHeader(doc, "FACTURE", "", invoice.number);

  let y = 140;

  // Dates
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
    .text(`Date d'émission : ${formatDate(invoice.issueDate || new Date())}`, 50, y)
    .text(`Date d'échéance : ${formatDate(invoice.dueDate)}`, 300, y);
  y += 30;

  // Client
  drawInfoBlock(doc, 50, y, doc.page.width - 100, "FACTURER À", [
    invoice.client?.name || "—",
    invoice.client?.company || "",
    invoice.client?.address || "",
    invoice.client?.phone || "",
    invoice.client?.email || "",
  ].filter(Boolean));
  y += 120;

  // Lignes de facturation
  doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
  doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
    .text("PRESTATIONS FACTURÉES", 58, y + 6);
  y += 20;

  // Table header
  doc.rect(50, y, doc.page.width - 100, 22).fill("#333333");
  doc.fillColor("white").fontSize(8).font("Helvetica-Bold")
    .text("#", 58, y + 7)
    .text("Description", 80, y + 7)
    .text("Date", 300, y + 7)
    .text("Montant HT", doc.page.width - 160, y + 7);
  y += 22;

  const missions = invoice.missions || [];
  missions.forEach((m, i) => {
    const bg = i % 2 === 0 ? "white" : LIGHT_GRAY;
    doc.rect(50, y, doc.page.width - 100, 35).fill(bg);
    doc.fillColor(TEXT_DARK).fontSize(8).font("Helvetica-Bold")
      .text(`#${m.id}`, 58, y + 6);
    doc.font("Helvetica")
      .text(`${m.origin} - ${m.destination}`, 80, y + 6, { width: 210 })
      .text(formatDate(m.date), 300, y + 6)
      .text(`${((m.price || 0) / 1.2).toFixed(2)} €`, doc.page.width - 160, y + 6, { width: 100, align: "right" });
    y += 35;
  });

  if (missions.length === 0) {
    doc.rect(50, y, doc.page.width - 100, 35).fill(LIGHT_GRAY);
    doc.fillColor(MID_GRAY).fontSize(8).font("Helvetica")
      .text("Prestation de transport VTC", 80, y + 12);
    y += 35;
  }

  y += 15;

  // Totaux
  const totalsX = doc.page.width - 220;

  doc.rect(totalsX, y, 170, 22).fill(LIGHT_GRAY);
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
    .text("Sous-total HT", totalsX + 10, y + 7)
    .text(`${invoice.totalHT.toFixed(2)} €`, totalsX + 80, y + 7, { width: 80, align: "right" });
  y += 22;

  doc.rect(totalsX, y, 170, 22).fill(LIGHT_GRAY);
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
    .text(`TVA (${invoice.tva}%)`, totalsX + 10, y + 7)
    .text(`${(invoice.totalTTC - invoice.totalHT).toFixed(2)} €`, totalsX + 80, y + 7, { width: 80, align: "right" });
  y += 22;

  doc.rect(totalsX, y, 170, 35).fill(GOLD);
  doc.fillColor(DARK).fontSize(13).font("Helvetica-Bold")
    .text("TOTAL TTC", totalsX + 10, y + 10)
    .text(`${invoice.totalTTC.toFixed(2)} €`, totalsX + 70, y + 10, { width: 90, align: "right" });
  y += 50;

  // Statut paiement
  const statusColors: Record<string, string> = {
    payee: "#22c55e", en_attente: "#f59e0b", en_retard: "#ef4444",
  };
  const statusLabels: Record<string, string> = {
    payee: "PAYÉE", en_attente: "EN ATTENTE", en_retard: "EN RETARD",
  };
  const statusColor = statusColors[invoice.status] || "#888888";
  const statusLabel = statusLabels[invoice.status] || invoice.status.toUpperCase();

  doc.rect(50, y, 150, 30).fill(statusColor);
  doc.fillColor("white").fontSize(12).font("Helvetica-Bold")
    .text(statusLabel, 50, y + 9, { width: 150, align: "center" });
  y += 45;

  // Notes
  if (invoice.notes) {
    doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("NOTES", 58, y + 6);
    y += 20;
    doc.rect(50, y, doc.page.width - 100, 40).fill(LIGHT_GRAY);
    doc.fillColor(TEXT_DARK).fontSize(8).font("Helvetica").text(invoice.notes, 58, y + 10);
    y += 50;
  }

  // Coordonnées bancaires
  y = Math.max(y, doc.page.height - 160);
  doc.rect(50, y, doc.page.width - 100, 20).fill(GOLD);
  doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("COORDONNÉES BANCAIRES", 58, y + 6);
  y += 20;
  doc.rect(50, y, doc.page.width - 100, 50).fill(LIGHT_GRAY);
  doc.fillColor(TEXT_DARK).fontSize(8).font("Helvetica")
    .text("Titulaire : Majestic South Chauffeurs", 58, y + 8)
    .text("IBAN : FR76 1695 8000 0148 6685 1389 063", 58, y + 22)
    .text("BIC/SWIFT : QNTOFRP1XXX  |  Banque : Qonto — 18 rue de Navarin, 75009 Paris", 58, y + 36)
    .text("Référence à indiquer : " + invoice.number, 58, y + 50);
  y += 60;

  // Footer
  doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(DARK);
  doc.fillColor("#666666").fontSize(7).font("Helvetica")
    .text("Majestic South Chauffeurs — SIRET : 943 399 311 00019 — TVA : FR39 943 399 311 — SAS au capital de 1 500 €", 50, doc.page.height - 28, { align: "center", width: doc.page.width - 100 });

  doc.end();
  return bufferFromStream(stream);
}



// ============================================================
// FICHE DE MISSION COMPLÈTE — Format professionnel premium
// Design Majestic South — Une seule page A4
// ============================================================

export interface FicheMissionData {
  id: number;
  number?: string;
  dossierNumber?: string;
  version?: number;
  client?: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    language?: string;
  };
  chauffeur?: {
    name: string;
    phone?: string;
    licenseNumber?: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    licensePlate: string;
    category?: string;
    color?: string;
  };
  origin: string;
  destination: string;
  date: Date | string;
  pickupTime?: string;
  status: string;
  type?: string;
  serviceType?: string;
  passengers?: number;
  luggage?: number;
  price?: number;
  priceHT?: number;
  vatRate?: number;
  paymentStatus?: string;
  notes?: string;
  specialInstructions?: string;
  reference?: string;
  flightNumber?: string;
  createdAt?: Date | string;
}

export async function generateFicheMissionPDF(mission: FicheMissionData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });
  const stream = new PassThrough();
  doc.pipe(stream);

  const W = doc.page.width;   // 595.28
  const H = doc.page.height;  // 841.89
  const M = 40;               // marge gauche/droite
  const CW = W - 2 * M;      // largeur contenu = 515.28

  // ── Helpers locaux ──────────────────────────────────────────

  const secH = 16;  // hauteur section header
  const rowH = 20;  // hauteur ligne standard
  const hdrH = 13;  // hauteur header tableau

  function secHeader(y: number, title: string): number {
    doc.rect(M, y, CW, secH).fill(DARK);
    doc.rect(M, y, 3, secH).fill(GOLD);
    doc.fillColor(GOLD).fontSize(7.5).font("Helvetica-Bold")
      .text(title, M + 8, y + 5, { width: CW - 12 });
    return y + secH;
  }

  function tblHeader(y: number, cols: { x: number; w: number; label: string }[]): number {
    doc.rect(M, y, CW, hdrH).fill(GOLD);
    cols.forEach(c => {
      doc.fillColor(DARK).fontSize(7).font("Helvetica-Bold")
        .text(c.label, c.x + 4, y + 3, { width: c.w - 6 });
    });
    return y + hdrH;
  }

  function dataRow(y: number, cols: { x: number; w: number; label: string; value: string }[], h = rowH): number {
    doc.rect(M, y, CW, h).fill("#fafafa").stroke("#e0e0e0");
    cols.forEach(c => {
      doc.fillColor("#777777").fontSize(6).font("Helvetica")
        .text(c.label.toUpperCase(), c.x + 4, y + 2, { width: c.w - 6 });
      doc.fillColor(DARK).fontSize(8).font("Helvetica-Bold")
        .text(c.value || "—", c.x + 4, y + 10, { width: c.w - 6 });
    });
    return y + h;
  }

  function emptyRow(y: number, h = rowH): number {
    doc.rect(M, y, CW, h).fill("#fafafa").stroke("#e0e0e0");
    return y + h;
  }

  // ── Données ─────────────────────────────────────────────────

  const missionNum = mission.number || `MSC-${String(mission.id).padStart(5, "0")}`;
  const dossierNum = mission.dossierNumber || String(mission.id).padStart(5, "0");
  const version = mission.version || 1;

  const missionDate = mission.date instanceof Date ? mission.date : new Date(mission.date);
  const missionDateStr = missionDate.toLocaleDateString("fr-FR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  });
  const pickupTimeStr = mission.pickupTime || missionDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const statusLabels: Record<string, string> = {
    a_confirmer: "À confirmer", planifiee: "Planifiée",
    en_cours: "En cours", terminee: "Terminée", annulee: "Annulée",
  };
  const statusLabel = statusLabels[mission.status] || mission.status;

  const paymentLabels: Record<string, string> = {
    non_paye: "Non payée", paye: "Payée",
    en_attente: "En attente", partiel: "Partiel",
  };
  const paymentLabel = paymentLabels[mission.paymentStatus || ""] || "—";

  const priceHT = mission.priceHT || (mission.price ? mission.price / (1 + (mission.vatRate || 20) / 100) : 0);
  const vatAmt = mission.price ? (mission.price - priceHT) : 0;
  const priceTTC = mission.price || 0;
  const encaisserStr = priceTTC > 0
    ? `${priceTTC.toFixed(2)} € TTC  (HT : ${priceHT.toFixed(2)} € + TVA ${mission.vatRate || 20}% : ${vatAmt.toFixed(2)} €)  |  ${paymentLabel}`
    : "—";

  // ── EN-TÊTE (hauteur 90) ─────────────────────────────────────
  doc.rect(0, 0, W, 90).fill(DARK);
  doc.rect(0, 88, W, 2).fill(GOLD);

  // Logo texte
  doc.fillColor(GOLD).fontSize(17).font("Helvetica-Bold")
    .text("MAJESTIC SOUTH CHAUFFEURS", M, 14);
  doc.fillColor("#aaaaaa").fontSize(7).font("Helvetica")
    .text("Service VTC Premium — Marseille, Aix-en-Provence", M, 36);
  doc.fillColor("#666666").fontSize(6.5).font("Helvetica")
    .text("+33 6 95 61 89 98  |  contact@mschauffeur.fr  |  mschauffeur.fr", M, 48)
    .text("Bât D, 131 Boulevard de Saint-Loup, 13010 Marseille  |  Licence EVTC013250212", M, 58)
    .text("Dispatch : +33 (0)7 87 38 24 79", M, 68);

  // Tableau numéros (haut droite)
  const tblX = W - 175;
  doc.rect(tblX, 12, 145, 14).fill(GOLD);
  doc.fillColor(DARK).fontSize(8).font("Helvetica-Bold")
    .text("FICHE DE MISSION", tblX, 16, { width: 145, align: "center" });
  doc.rect(tblX, 26, 145, 12).fill("#2a2a2a");
  doc.fillColor("#aaaaaa").fontSize(6).font("Helvetica")
    .text("N° dossier", tblX + 4, 29, { width: 44 })
    .text("N° mission", tblX + 50, 29, { width: 50 })
    .text("Version", tblX + 102, 29, { width: 38 });
  doc.rect(tblX, 38, 145, 16).fill("#333333");
  doc.fillColor(GOLD).fontSize(9).font("Helvetica-Bold")
    .text(dossierNum, tblX + 4, 42, { width: 44, align: "center" })
    .text(missionNum.replace(/^MSN-/, ""), tblX + 50, 42, { width: 50, align: "center" })
    .text(String(version), tblX + 102, 42, { width: 38, align: "center" });

  let y = 96;

  // ── RÉFÉRENCES LÉGALES + CLIENT (hauteur ~28) ────────────────
  doc.fillColor("#555555").fontSize(6.5).font("Helvetica")
    .text("Billet collectif : Arrêté ministériel du 14/02/86 Art 5  |  Ordre de mission : Arrêté ministériel du 06/01/93 Art 3", M, y);
  y += 10;

  const halfW = CW / 2;
  doc.fillColor("#555555").fontSize(7).font("Helvetica").text("Client :", M, y + 2);
  doc.fillColor(DARK).fontSize(8.5).font("Helvetica-Bold")
    .text(mission.client?.name || "—", M + 30, y);
  if (mission.client?.company) {
    doc.fillColor("#555555").fontSize(7).font("Helvetica")
      .text(mission.client.company, M + 30, y + 11);
  }
  const createdStr = mission.createdAt
    ? (mission.createdAt instanceof Date ? mission.createdAt : new Date(mission.createdAt))
        .toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : new Date().toLocaleDateString("fr-FR");
  doc.fillColor("#555555").fontSize(7).font("Helvetica")
    .text(`Dossier créé le ${createdStr}`, M + halfW, y + 2);
  y += 22;

  // ── TABLEAU PRINCIPAL 4 lignes (hauteur 4 × 20 = 80) ────────
  const c1 = M, c2 = M + CW / 2, cw = CW / 2;

  const serviceLabel = mission.type || mission.serviceType || "Transfert";
  const vehicleStr = mission.vehicle
    ? `${mission.vehicle.brand} ${mission.vehicle.model} — ${mission.vehicle.category || "berline"}`
    : "Non assigné";
  const plateStr = mission.vehicle
    ? `${mission.vehicle.licensePlate}  |  Couleur : ${mission.vehicle.color || "—"}`
    : "—";

  y = dataRow(y, [
    { x: c1, w: cw, label: "Date", value: missionDateStr },
    { x: c2, w: cw, label: "Chauffeur", value: mission.chauffeur ? `${mission.chauffeur.name}  (${mission.chauffeur.phone || ""})` : "Non assigné" },
  ]);
  y = dataRow(y, [
    { x: c1, w: cw, label: "Service", value: serviceLabel },
    { x: c2, w: cw, label: "Type de véhicule / Véhicule", value: vehicleStr },
  ]);
  y = dataRow(y, [
    { x: c1, w: cw, label: "Référence mission", value: mission.reference || missionNum },
    { x: c2, w: cw, label: "À encaisser — Statut paiement", value: encaisserStr },
  ]);
  y = dataRow(y, [
    { x: c1, w: cw, label: "Statut de la mission", value: statusLabel },
    { x: c2, w: cw, label: "Immatriculation / Couleur", value: plateStr },
  ]);
  y += 4;

  // ── PASSAGER(S) (hauteur ~70) ────────────────────────────────
  y = secHeader(y, "INFORMATIONS PASSAGER(S)");

  const paxCols = [
    { x: M, w: 70, label: "Pax" },
    { x: M + 70, w: 110, label: "Nombre d'adulte(s)" },
    { x: M + 180, w: 90, label: "Bagage(s)" },
    { x: M + 270, w: CW - 270, label: "Vol / Train" },
  ];
  y = tblHeader(y, paxCols);
  doc.rect(M, y, CW, 16).fill("#fafafa").stroke("#e0e0e0");
  doc.fillColor(DARK).fontSize(8).font("Helvetica-Bold")
    .text(String(mission.passengers || 1), M + 4, y + 4, { width: 66 })
    .text(String(mission.passengers || 1), M + 74, y + 4, { width: 106 })
    .text(String(mission.luggage || 0), M + 184, y + 4, { width: 86 })
    .text(mission.flightNumber || "—", M + 274, y + 4, { width: CW - 274 });
  y += 16;

  const passCols = [
    { x: M, w: 140, label: "Nom" },
    { x: M + 140, w: 100, label: "Téléphone" },
    { x: M + 240, w: 75, label: "Langue" },
    { x: M + 315, w: CW - 315, label: "Note au chauffeur" },
  ];
  y = tblHeader(y, passCols);
  doc.rect(M, y, CW, 18).fill("#fafafa").stroke("#e0e0e0");
  doc.fillColor(DARK).fontSize(8).font("Helvetica-Bold")
    .text(mission.client?.name || "—", M + 4, y + 5, { width: 136 });
  doc.fillColor(DARK).fontSize(7.5).font("Helvetica")
    .text(mission.client?.phone || "—", M + 144, y + 5, { width: 96 })
    .text(mission.client?.language || "Français", M + 244, y + 5, { width: 71 })
    .text(mission.specialInstructions || "—", M + 319, y + 5, { width: CW - 319 });
  y += 20;

  // ── ITINÉRAIRE (hauteur ~60) ─────────────────────────────────
  y = secHeader(y, "ITINÉRAIRE");

  const itinCols = [
    { x: M, w: 55, label: "Heures" },
    { x: M + 55, w: 195, label: "Lieu" },
    { x: M + 250, w: 130, label: "Prise en charge" },
    { x: M + 380, w: CW - 380, label: "Dépose" },
  ];
  y = tblHeader(y, itinCols);

  doc.rect(M, y, CW, 20).fill("#fafafa").stroke("#e0e0e0");
  doc.fillColor(GOLD).fontSize(9).font("Helvetica-Bold")
    .text(pickupTimeStr, M + 4, y + 6, { width: 51 });
  doc.fillColor(DARK).fontSize(7.5).font("Helvetica")
    .text(mission.origin, M + 59, y + 6, { width: 191 });
  doc.fillColor(DARK).fontSize(7.5).font("Helvetica-Bold")
    .text(mission.client?.name || "—", M + 254, y + 6, { width: 126 });
  y += 20;

  doc.rect(M, y, CW, 20).fill("#f5f5f5").stroke("#e0e0e0");
  doc.fillColor(DARK).fontSize(7.5).font("Helvetica")
    .text(mission.destination, M + 59, y + 6, { width: 191 });
  doc.fillColor(DARK).fontSize(7.5).font("Helvetica-Bold")
    .text(mission.client?.name || "—", M + 384, y + 6, { width: CW - 384 });
  y += 22;

  // ── DÉBOURS (hauteur ~50) ────────────────────────────────────
  y = secHeader(y, "DÉBOURS CHAUFFEUR SUR JUSTIFICATIFS");

  const dCols = [
    { x: M, w: CW / 4, label: "Parking" },
    { x: M + CW / 4, w: CW / 4, label: "Péage" },
    { x: M + CW / 2, w: CW / 4, label: "Divers" },
    { x: M + 3 * CW / 4, w: CW / 4, label: "Total" },
  ];
  y = tblHeader(y, dCols);
  y = emptyRow(y, 18);
  y += 3;

  // ── HEURES DE REPAS (hauteur ~48) ────────────────────────────
  const repasY = y;
  const rW = (CW - 6) / 2;
  doc.rect(M, repasY, rW, 14).fill(DARK);
  doc.rect(M, repasY, 3, 14).fill(GOLD);
  doc.fillColor(GOLD).fontSize(7).font("Helvetica-Bold")
    .text("HEURES DE DÉJEUNER", M + 7, repasY + 4, { width: rW - 10 });
  doc.rect(M + rW + 6, repasY, rW, 14).fill(DARK);
  doc.rect(M + rW + 6, repasY, 3, 14).fill(GOLD);
  doc.fillColor(GOLD).fontSize(7).font("Helvetica-Bold")
    .text("HEURES DE DÎNER", M + rW + 13, repasY + 4, { width: rW - 10 });
  y += 14;

  const rSubCols1 = [
    { x: M, w: rW / 2, label: "Début" },
    { x: M + rW / 2, w: rW / 2, label: "Fin" },
  ];
  const rSubCols2 = [
    { x: M + rW + 6, w: rW / 2, label: "Début" },
    { x: M + rW + 6 + rW / 2, w: rW / 2, label: "Fin" },
  ];
  doc.rect(M, y, rW, 11).fill(GOLD);
  rSubCols1.forEach(c => doc.fillColor(DARK).fontSize(6.5).font("Helvetica-Bold").text(c.label, c.x + 4, y + 3, { width: c.w - 6 }));
  doc.rect(M + rW + 6, y, rW, 11).fill(GOLD);
  rSubCols2.forEach(c => doc.fillColor(DARK).fontSize(6.5).font("Helvetica-Bold").text(c.label, c.x + 4, y + 3, { width: c.w - 6 }));
  y += 11;
  doc.rect(M, y, rW, 16).fill("#fafafa").stroke("#e0e0e0");
  doc.rect(M + rW + 6, y, rW, 16).fill("#fafafa").stroke("#e0e0e0");
  y += 18;

  // ── INFORMATIONS OBLIGATOIRES (hauteur ~46) ──────────────────
  y = secHeader(y, "INFORMATIONS OBLIGATOIRES À COMPLÉTER");

  const iCols = [
    { x: M, w: CW / 4, label: "Heure départ garage" },
    { x: M + CW / 4, w: CW / 4, label: "Heure prise en charge réelle" },
    { x: M + CW / 2, w: CW / 4, label: "Heure dépose réelle" },
    { x: M + 3 * CW / 4, w: CW / 4, label: "Heure retour garage" },
  ];
  y = tblHeader(y, iCols);
  y = emptyRow(y, 18);
  y += 3;

  // ── KILOMÉTRAGE (hauteur ~80) ─────────────────────────────────
  y = secHeader(y, "KILOMÉTRAGE");

  const kmW = CW / 3;
  ["KM GARAGE", "KM CLIENT", "KM ÉTRANGER"].forEach((label, i) => {
    doc.rect(M + i * kmW, y, kmW - 2, 13).fill(GOLD);
    doc.rect(M + i * kmW, y, 3, 13).fill(DARK);
    doc.fillColor(DARK).fontSize(7).font("Helvetica-Bold")
      .text(label, M + i * kmW + 7, y + 3, { width: kmW - 10 });
  });
  y += 13;

  const kmRows = [
    ["Km départ garage", "Prise en charge", "Sortie territoire"],
    ["Km retour garage", "Dépose", "Entrée territoire"],
    ["TOTAL km", "TOTAL km", "TOTAL km"],
  ];
  kmRows.forEach(row => {
    row.forEach((cell, i) => {
      const isTotal = cell.startsWith("TOTAL");
      doc.rect(M + i * kmW, y, kmW - 2, 16)
        .fill(isTotal ? "#e8e0cc" : "#fafafa").stroke("#e0e0e0");
      doc.fillColor(isTotal ? DARK : MID_GRAY).fontSize(7)
        .font(isTotal ? "Helvetica-Bold" : "Helvetica")
        .text(cell, M + i * kmW + 5, y + 5, { width: kmW - 8 });
    });
    y += 16;
  });
  y += 4;

  // ── OBSERVATIONS (hauteur ~50) ────────────────────────────────
  y = secHeader(y, "OBSERVATIONS DE FIN DE MISSION");
  doc.rect(M, y, CW, 36).fill("#fafafa").stroke("#e0e0e0");
  if (mission.notes) {
    doc.fillColor(TEXT_DARK).fontSize(7.5).font("Helvetica")
      .text(mission.notes, M + 6, y + 6, { width: CW - 12 });
  }
  y += 40;

  // ── SIGNATURES (hauteur ~50) ──────────────────────────────────
  const sigW = (CW - 16) / 2;
  // Chauffeur
  doc.rect(M, y, sigW, 44).fill("#fafafa").stroke("#cccccc");
  doc.rect(M, y, sigW, 13).fill(DARK);
  doc.rect(M, y, 3, 13).fill(GOLD);
  doc.fillColor(GOLD).fontSize(7).font("Helvetica-Bold")
    .text("SIGNATURE CHAUFFEUR", M + 7, y + 4, { width: sigW - 10 });
  doc.fillColor(MID_GRAY).fontSize(6.5).font("Helvetica")
    .text(mission.chauffeur?.name || "Chauffeur", M + 7, y + 18, { width: sigW - 10 })
    .text("Date : _______________", M + 7, y + 30, { width: sigW - 10 });
  // Client
  doc.rect(M + sigW + 16, y, sigW, 44).fill("#fafafa").stroke("#cccccc");
  doc.rect(M + sigW + 16, y, sigW, 13).fill(DARK);
  doc.rect(M + sigW + 16, y, 3, 13).fill(GOLD);
  doc.fillColor(GOLD).fontSize(7).font("Helvetica-Bold")
    .text("SIGNATURE CLIENT", M + sigW + 23, y + 4, { width: sigW - 10 });
  doc.fillColor(MID_GRAY).fontSize(6.5).font("Helvetica")
    .text(mission.client?.name || "Client", M + sigW + 23, y + 18, { width: sigW - 10 })
    .text("Date : _______________", M + sigW + 23, y + 30, { width: sigW - 10 });
  y += 48;

  // ── PIED DE PAGE ─────────────────────────────────────────────
  const footerY = H - 28;
  doc.rect(0, footerY, W, 28).fill(DARK);
  doc.rect(0, footerY, W, 2).fill(GOLD);
  doc.fillColor("#666666").fontSize(6).font("Helvetica")
    .text(
      "Majestic South Chauffeurs — SASU au capital de 1 500 € — SIRET : 943 399 311 00019 — TVA Intracommunautaire : FR39 943 399 311",
      M, footerY + 6, { align: "center", width: CW }
    )
    .text(
      "Bât D, 131 Boulevard de Saint-Loup, 13010 Marseille  |  +33 6 95 61 89 98  |  contact@mschauffeur.fr  |  mschauffeur.fr",
      M, footerY + 16, { align: "center", width: CW }
    );

  doc.end();
  return bufferFromStream(stream);
}
