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
  notes?: string | null;
  specialInstructions?: string | null;
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
  notes?: string | null;
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
    .text("Service VTC Premium — Côte d'Azur", 50, 58);

  doc.fillColor("#666666").fontSize(8)
    .text("contact@majestic-south.com  |  +33 6 00 00 00 00  |  www.majestic-south.com", 50, 72);

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
    .text("Majestic South Chauffeurs — SIRET : XXX XXX XXX XXXXX — TVA : FRXX XXXXXXXXX", 50, doc.page.height - 28, { align: "center", width: doc.page.width - 100 });

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
    .text(`${quote.origin || "—"} → ${quote.destination || "—"}`, 65, y + 24)
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
    .text("Majestic South Chauffeurs — SIRET : XXX XXX XXX XXXXX — TVA : FRXX XXXXXXXXX", 50, doc.page.height - 28, { align: "center", width: doc.page.width - 100 });

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
      .text(`${m.origin} → ${m.destination}`, 80, y + 6, { width: 210 })
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
    .text("IBAN : FR76 XXXX XXXX XXXX XXXX XXXX XXX", 58, y + 10)
    .text("BIC : XXXXXXXX  |  Banque : Crédit Agricole", 58, y + 26)
    .text("Référence à indiquer : " + invoice.number, 58, y + 38);
  y += 60;

  // Footer
  doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(DARK);
  doc.fillColor("#666666").fontSize(7).font("Helvetica")
    .text("Majestic South Chauffeurs — SIRET : XXX XXX XXX XXXXX — TVA : FRXX XXXXXXXXX", 50, doc.page.height - 28, { align: "center", width: doc.page.width - 100 });

  doc.end();
  return bufferFromStream(stream);
}
