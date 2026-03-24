/**
 * Email Service - Majestic South Chauffeurs
 * Envoi d'emails réels via SMTP avec nodemailer
 */
import nodemailer from 'nodemailer';

const FROM_NAME = 'Majestic South Chauffeurs';
const FROM_EMAIL = process.env.SMTP_FROM || 'contact@mschauffeur.fr';
const COMPANY_PHONE = '+33 6 95 61 89 98';
const APP_URL = process.env.APP_URL || 'https://majestic-south-chauffeurs-production.up.railway.app';

// Créer le transporteur SMTP
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      servername: host,
      minVersion: 'TLSv1.2',
    },
    // Timeout pour eviter les blocages
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

// Template HTML de base
function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#0a0a0a;margin:0;padding:20px;}
    .wrap{max-width:600px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;}
    .hdr{background:#0a0a0a;padding:28px;text-align:center;border-bottom:1px solid #2a2a2a;}
    .logo{font-size:22px;font-weight:700;color:#d4af37;letter-spacing:2px;}
    .sub{font-size:10px;color:#666;letter-spacing:4px;text-transform:uppercase;margin-top:4px;}
    .body{padding:32px;color:#bbb;line-height:1.7;}
    .body h2{color:#fff;font-size:20px;margin:0 0 16px;}
    .box{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:20px;margin:20px 0;}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222;}
    .row:last-child{border-bottom:none;}
    .lbl{color:#666;font-size:13px;}
    .val{color:#fff;font-size:13px;font-weight:500;text-align:right;}
    .price{color:#d4af37;font-size:32px;font-weight:700;text-align:center;padding:16px 0;}
    .btn{display:inline-block;background:#d4af37;color:#000;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:700;font-size:14px;margin:16px 0;}
    .ftr{background:#0a0a0a;padding:20px;text-align:center;border-top:1px solid #2a2a2a;}
    .ftr p{color:#444;font-size:12px;margin:3px 0;}
    .ftr a{color:#d4af37;text-decoration:none;}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(212,175,55,0.15);color:#d4af37;border:1px solid rgba(212,175,55,0.3);}
    .warn{background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:6px;padding:14px;margin:16px 0;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="logo">MAJESTIC SOUTH</div>
      <div class="sub">Chauffeurs Prives</div>
    </div>
    <div class="body">${content}</div>
    <div class="ftr">
      <p><strong style="color:#777">Majestic South Chauffeurs</strong></p>
      <p>Tel. <a href="tel:${COMPANY_PHONE}">${COMPANY_PHONE}</a> &nbsp;|&nbsp; <a href="mailto:${FROM_EMAIL}">${FROM_EMAIL}</a></p>
      <p style="margin-top:12px;font-size:11px;color:#333">&copy; ${new Date().getFullYear()} Majestic South Chauffeurs. Tous droits reserves.</p>
    </div>
  </div>
</body>
</html>`;
}

// Envoi générique
export async function sendEmail(to: string, subject: string, html: string, attachments?: any[]): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email] SMTP non configure - log: ${subject} -> ${to}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to, subject, html,
      ...(attachments ? { attachments } : {}),
    });
    console.log(`[Email] Envoye a ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[Email] Echec ${to}:`, err);
    return false;
  }
}

// Formater une date en français
function fmtDate(d: Date | string, withTime = true): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

// ============================================================
// 1. Confirmation de réservation au client
// ============================================================
export async function sendBookingConfirmation(p: {
  clientEmail: string; clientName: string; missionNumber: string;
  origin: string; destination: string; date: Date | string;
  passengers: number; chauffeurName?: string; vehicleModel?: string; price?: number;
}) {
  const html = baseTemplate(`
    <h2>Reservation confirmee</h2>
    <p>Bonjour <strong>${p.clientName}</strong>,</p>
    <p>Nous avons bien enregistre votre reservation. Voici le recapitulatif :</p>
    <div class="box">
      <div class="row"><span class="lbl">N&deg; de mission</span><span class="val"><span class="badge">${p.missionNumber}</span></span></div>
      <div class="row"><span class="lbl">Date &amp; heure</span><span class="val">${fmtDate(p.date)}</span></div>
      <div class="row"><span class="lbl">Depart</span><span class="val">${p.origin}</span></div>
      <div class="row"><span class="lbl">Destination</span><span class="val">${p.destination}</span></div>
      <div class="row"><span class="lbl">Passagers</span><span class="val">${p.passengers} personne(s)</span></div>
      ${p.chauffeurName ? `<div class="row"><span class="lbl">Chauffeur</span><span class="val">${p.chauffeurName}</span></div>` : ''}
      ${p.vehicleModel ? `<div class="row"><span class="lbl">Vehicule</span><span class="val">${p.vehicleModel}</span></div>` : ''}
      ${p.price ? `<div class="row"><span class="lbl">Tarif</span><span class="val" style="color:#d4af37;font-size:16px;font-weight:700">${p.price}&euro; TTC</span></div>` : ''}
    </div>
    <p>Pour toute modification ou annulation, contactez-nous au <strong>${COMPANY_PHONE}</strong>.</p>
    <p>Nous vous souhaitons un excellent voyage.</p>
    <p style="color:#666;font-size:13px">L'equipe Majestic South Chauffeurs</p>
  `);
  return sendEmail(p.clientEmail, `Reservation confirmee - ${p.missionNumber}`, html);
}

// ============================================================
// 2. Notification au chauffeur assigné
// ============================================================
export async function sendChauffeurAssignment(p: {
  chauffeurEmail: string; chauffeurName: string; missionNumber: string;
  clientName: string; origin: string; destination: string; date: Date | string;
  passengers: number; vehicleModel?: string; specialInstructions?: string;
}) {
  const html = baseTemplate(`
    <h2>Nouvelle mission assignee</h2>
    <p>Bonjour <strong>${p.chauffeurName}</strong>,</p>
    <p>Une nouvelle mission vous a ete assignee :</p>
    <div class="box">
      <div class="row"><span class="lbl">N&deg; de mission</span><span class="val"><span class="badge">${p.missionNumber}</span></span></div>
      <div class="row"><span class="lbl">Client</span><span class="val">${p.clientName}</span></div>
      <div class="row"><span class="lbl">Date &amp; heure</span><span class="val" style="color:#d4af37;font-weight:700">${fmtDate(p.date)}</span></div>
      <div class="row"><span class="lbl">Prise en charge</span><span class="val">${p.origin}</span></div>
      <div class="row"><span class="lbl">Destination</span><span class="val">${p.destination}</span></div>
      <div class="row"><span class="lbl">Passagers</span><span class="val">${p.passengers} personne(s)</span></div>
      ${p.vehicleModel ? `<div class="row"><span class="lbl">Vehicule assigne</span><span class="val">${p.vehicleModel}</span></div>` : ''}
    </div>
    ${p.specialInstructions ? `<div class="warn"><p style="color:#d4af37;font-weight:600;margin:0 0 6px">Instructions speciales</p><p style="margin:0;color:#ccc">${p.specialInstructions}</p></div>` : ''}
    <p>Pour toute question : <strong>${COMPANY_PHONE}</strong></p>
    <p style="color:#666;font-size:13px">L'equipe Majestic South Chauffeurs</p>
  `);
  return sendEmail(p.chauffeurEmail, `Mission ${p.missionNumber} - ${p.clientName}`, html);
}

// ============================================================
// 3. Envoi de devis par email (avec PDF en pièce jointe)
// ============================================================
export async function sendQuoteEmail(p: {
  clientEmail: string; clientName: string; quoteNumber: string;
  origin: string; destination: string; date: Date | string;
  passengers: number; priceHT: number; priceTTC: number;
  validUntil: Date | string; notes?: string; pdfBuffer?: Buffer;
}) {
  const validStr = fmtDate(p.validUntil, false);
  const html = baseTemplate(`
    <h2>Votre devis personnalise</h2>
    <p>Bonjour <strong>${p.clientName}</strong>,</p>
    <p>Suite a votre demande, veuillez trouver votre devis :</p>
    <div class="box">
      <div class="row"><span class="lbl">N&deg; de devis</span><span class="val"><span class="badge">${p.quoteNumber}</span></span></div>
      <div class="row"><span class="lbl">Date de la prestation</span><span class="val">${fmtDate(p.date)}</span></div>
      <div class="row"><span class="lbl">Depart</span><span class="val">${p.origin}</span></div>
      <div class="row"><span class="lbl">Destination</span><span class="val">${p.destination}</span></div>
      <div class="row"><span class="lbl">Passagers</span><span class="val">${p.passengers} personne(s)</span></div>
    </div>
    <div class="box" style="text-align:center">
      <p style="color:#666;font-size:12px;margin:0 0 4px">MONTANT TOTAL</p>
      <div class="price">${p.priceTTC}&euro; TTC</div>
      <p style="color:#444;font-size:12px;margin:0">dont ${p.priceHT}&euro; HT + TVA 20%</p>
    </div>
    ${p.notes ? `<p style="color:#666;font-size:13px;font-style:italic">Note : ${p.notes}</p>` : ''}
    <p style="color:#666;font-size:13px">Devis valable jusqu'au <strong style="color:#fff">${validStr}</strong>.</p>
    <p>Pour accepter ce devis : <strong>${COMPANY_PHONE}</strong> ou repondez a cet email.</p>
    <p style="color:#666;font-size:13px">L'equipe Majestic South Chauffeurs</p>
  `);

  const attachments = p.pdfBuffer ? [{
    filename: `devis-${p.quoteNumber}.pdf`,
    content: p.pdfBuffer,
    contentType: 'application/pdf',
  }] : undefined;

  return sendEmail(p.clientEmail, `Devis ${p.quoteNumber} - Majestic South Chauffeurs`, html, attachments);
}

// ============================================================
// 4. Rappel 24h avant la mission
// ============================================================
export async function sendMissionReminder(p: {
  clientEmail: string; clientName: string; missionNumber: string;
  origin: string; destination: string; date: Date | string;
  chauffeurName?: string; chauffeurPhone?: string;
  vehicleModel?: string; vehiclePlate?: string;
}) {
  const html = baseTemplate(`
    <h2>Rappel : Votre mission demain</h2>
    <p>Bonjour <strong>${p.clientName}</strong>,</p>
    <p>Votre transfert est prevu <strong>demain</strong> :</p>
    <div class="box">
      <div class="row"><span class="lbl">N&deg; de mission</span><span class="val"><span class="badge">${p.missionNumber}</span></span></div>
      <div class="row"><span class="lbl">Heure de prise en charge</span><span class="val" style="color:#d4af37;font-weight:700;font-size:15px">${fmtDate(p.date)}</span></div>
      <div class="row"><span class="lbl">Lieu de prise en charge</span><span class="val">${p.origin}</span></div>
      <div class="row"><span class="lbl">Destination</span><span class="val">${p.destination}</span></div>
      ${p.chauffeurName ? `<div class="row"><span class="lbl">Votre chauffeur</span><span class="val">${p.chauffeurName}${p.chauffeurPhone ? ` &mdash; Tel. ${p.chauffeurPhone}` : ''}</span></div>` : ''}
      ${p.vehicleModel ? `<div class="row"><span class="lbl">Vehicule</span><span class="val">${p.vehicleModel}${p.vehiclePlate ? ` (${p.vehiclePlate})` : ''}</span></div>` : ''}
    </div>
    <p>Votre chauffeur sera present <strong>5 minutes avant l'heure convenue</strong>.</p>
    <p>Urgence : <strong>${COMPANY_PHONE}</strong></p>
    <p style="color:#666;font-size:13px">L'equipe Majestic South Chauffeurs</p>
  `);
  return sendEmail(p.clientEmail, `Rappel : Votre transfert demain - ${p.missionNumber}`, html);
}

// ============================================================
// 5. Notification nouvelle demande (pour l'admin)
// ============================================================
export async function sendNewDemandNotification(p: {
  adminEmail: string; clientName: string; origin: string;
  destination: string; date: Date | string; passengers: number; message?: string;
}) {
  const html = baseTemplate(`
    <h2>Nouvelle demande de reservation</h2>
    <p>Une nouvelle demande vient d'etre soumise.</p>
    <div class="box">
      <div class="row"><span class="lbl">Client</span><span class="val">${p.clientName}</span></div>
      <div class="row"><span class="lbl">Date souhaitee</span><span class="val">${fmtDate(p.date)}</span></div>
      <div class="row"><span class="lbl">Depart</span><span class="val">${p.origin}</span></div>
      <div class="row"><span class="lbl">Destination</span><span class="val">${p.destination}</span></div>
      <div class="row"><span class="lbl">Passagers</span><span class="val">${p.passengers} personne(s)</span></div>
      ${p.message ? `<div class="row"><span class="lbl">Message</span><span class="val">${p.message}</span></div>` : ''}
    </div>
    <a href="${APP_URL}/demands" class="btn">Voir la demande</a>
    <p style="color:#666;font-size:13px">Connectez-vous au back-office pour traiter cette demande.</p>
  `);
  return sendEmail(p.adminEmail, `Nouvelle demande - ${p.clientName}`, html);
}

// Compatibilité avec l'ancien code
export { sendNewDemandNotification as notifyNewDemand };
export const EMAIL_TEMPLATES = {};
export async function sendEmailNotification(n: any): Promise<boolean> {
  console.log(`[Email] ${n.subject} -> ${n.to}`);
  return false;
}
export async function notifyMissionCompleted(_email: string, _m: any) { return false; }
export async function notifyPaymentReceived(_email: string, _p: any) { return false; }
export async function notifyChauffeurAssigned(_email: string, _a: any) { return false; }
export async function notifyReviewRequest(_email: string, _r: any) { return false; }
