import nodemailer from 'nodemailer';

// ─── Configuration SMTP ────────────────────────────────────────────────────
const SMTP_HOST = 'mail.mschauffeur.fr';
const SMTP_PORT = 465;
const BOOKING_EMAIL = 'booking@mschauffeur.fr';
const CONTACT_EMAIL = 'contact@mschauffeur.fr';
const SMTP_PASS = 'mschauffeur13010';
const COMPANY_PHONE = '+33 6 95 61 89 98';
const COMPANY_NAME = 'Majestic South Chauffeurs';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: { user: BOOKING_EMAIL, pass: SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

// ─── Wrappers HTML ─────────────────────────────────────────────────────────
function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- EN-TÊTE -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a1200,#2a1e00);padding:28px 36px;border-bottom:3px solid #c9a227;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-size:18px;font-weight:bold;letter-spacing:4px;color:#c9a227;text-transform:uppercase;">${COMPANY_NAME}</div>
                <div style="font-size:10px;letter-spacing:2px;color:#888;text-transform:uppercase;margin-top:3px;">Chauffeurs Privés — Marseille</div>
              </td>
              <td align="right" style="font-size:11px;color:#888;line-height:1.9;">
                ${COMPANY_PHONE}<br/>
                <a href="mailto:${CONTACT_EMAIL}" style="color:#c9a227;text-decoration:none;">${CONTACT_EMAIL}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CORPS -->
      <tr><td style="padding:32px 36px;">${body}</td></tr>

      <!-- PIED DE PAGE -->
      <tr>
        <td style="background:#1a1200;padding:20px 36px;text-align:center;border-top:2px solid #c9a227;">
          <div style="font-size:13px;font-weight:bold;color:#c9a227;margin-bottom:4px;">${COMPANY_NAME}</div>
          <div style="font-size:11px;color:#888;line-height:1.8;">
            Tél : ${COMPANY_PHONE}<br/>
            Email : <a href="mailto:${CONTACT_EMAIL}" style="color:#c9a227;text-decoration:none;">${CONTACT_EMAIL}</a>
          </div>
          <div style="font-size:10px;color:#555;margin-top:10px;border-top:1px solid #2a2000;padding-top:10px;">
            SAS — Bât D, 131 Bd de Saint-Loup, 13010 Marseille — SIRET : 943 399 311 00019
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ─── Email 1 : Confirmation envoyée AU CLIENT ──────────────────────────────
function buildClientConfirmationEmail(d: BookingData, refNumber: string): string {
  const dateFormatted = new Date(`${d.date}T${d.time}`).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const body = `
<p style="font-size:15px;color:#333;margin:0 0 6px 0;">Bonjour,</p>
<p style="font-size:15px;color:#333;margin:0 0 20px 0;">
  Votre demande de réservation a bien été enregistrée <strong>n°${refNumber}</strong>.
</p>

<!-- Bloc client -->
<p style="font-size:14px;color:#333;margin:0 0 4px 0;font-weight:bold;">${d.clientName}</p>
<p style="font-size:13px;color:#555;margin:0 0 2px 0;">${d.clientEmail}</p>
<p style="font-size:13px;color:#555;margin:0 0 20px 0;">${d.clientPhone}</p>

<p style="font-size:14px;color:#333;font-weight:bold;margin:0 0 12px 0;">Informations complémentaires :</p>

<!-- Tableau récapitulatif -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ddd;border-radius:4px;overflow:hidden;margin-bottom:20px;">
  <!-- Date et n° -->
  <tr>
    <td style="background:#f9f5e8;padding:12px 16px;font-size:14px;font-weight:bold;color:#c9a227;border-bottom:1px solid #ddd;width:60%;">
      ${dateFormatted} à ${d.time}
    </td>
    <td style="background:#f9f5e8;padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #ddd;text-align:right;border-left:1px solid #ddd;">
      n°${refNumber}
    </td>
  </tr>
  <!-- Itinéraire -->
  <tr>
    <td colspan="2" style="padding:14px 16px;border-bottom:1px solid #eee;">
      <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Itinéraire</div>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:3px 0;font-size:13px;color:#333;">
            <span style="color:#c9a227;margin-right:6px;">&#9679;</span>${d.origin}${d.flightNumber ? ' <span style="color:#888;">'+d.flightNumber+'</span>' : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:3px 0;font-size:13px;color:#333;">
            <span style="color:#c9a227;margin-right:6px;">&#9679;</span>${d.destination}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Passagers / Nom / Bagages -->
  <tr>
    <td colspan="2" style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-right:1px solid #eee;width:20%;">No. of Passengers</td>
          <td style="padding:12px 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-right:1px solid #eee;width:50%;">Passager(s)</td>
          <td style="padding:12px 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;width:30%;">Bagages</td>
        </tr>
        <tr>
          <td style="padding:8px 16px 14px;font-size:14px;color:#333;border-right:1px solid #eee;border-top:1px solid #eee;">${d.passengers}</td>
          <td style="padding:8px 16px 14px;font-size:14px;color:#333;border-right:1px solid #eee;border-top:1px solid #eee;">
            ${d.clientName}<br/>
            <span style="font-size:12px;color:#888;">${d.clientPhone}</span>
          </td>
          <td style="padding:8px 16px 14px;font-size:14px;color:#333;border-top:1px solid #eee;">${d.luggage}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<p style="font-size:14px;color:#333;margin:0 0 6px 0;">Nous reprendrons contact avec vous très rapidement.</p>
<p style="font-size:14px;color:#333;margin:0 0 20px 0;">L'équipe ${COMPANY_NAME}</p>
`;

  return wrap(body);
}

// ─── Email 2 : Notification envoyée À L'ADMIN (booking@mschauffeur.fr) ─────
function buildAdminNotificationEmail(d: BookingData, refNumber: string): string {
  const dateFormatted = new Date(`${d.date}T${d.time}`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const body = `
<div style="background:#fff8e6;border-left:4px solid #c9a227;padding:12px 16px;margin-bottom:20px;border-radius:0 4px 4px 0;">
  <div style="font-size:11px;color:#c9a227;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Nouvelle demande de réservation</div>
  <div style="font-size:18px;font-weight:bold;color:#1a1200;">Réservation n°${refNumber}</div>
  <div style="font-size:12px;color:#888;margin-top:2px;">Reçue le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
</div>

<!-- Infos client -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  <tr>
    <td style="font-size:14px;font-weight:bold;color:#1a1200;padding-bottom:4px;">${d.clientName}</td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#555;padding-bottom:2px;">
      <a href="mailto:${d.clientEmail}" style="color:#c9a227;text-decoration:none;">${d.clientEmail}</a>
    </td>
  </tr>
  <tr>
    <td style="font-size:13px;color:#555;padding-bottom:16px;">
      <a href="tel:${d.clientPhone}" style="color:#333;text-decoration:none;">${d.clientPhone}</a>
    </td>
  </tr>
</table>

<!-- Tableau récapitulatif -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ddd;border-radius:4px;overflow:hidden;margin-bottom:20px;">
  <tr>
    <td style="background:#f9f5e8;padding:12px 16px;font-size:14px;font-weight:bold;color:#c9a227;border-bottom:1px solid #ddd;width:60%;">
      ${dateFormatted} à ${d.time}
    </td>
    <td style="background:#f9f5e8;padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #ddd;text-align:right;border-left:1px solid #ddd;">
      n°${refNumber}
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding:14px 16px;border-bottom:1px solid #eee;">
      <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Itinéraire</div>
      <div style="font-size:13px;color:#333;padding:3px 0;"><span style="color:#c9a227;margin-right:6px;">&#9679;</span>${d.origin}${d.flightNumber ? ' — Vol : <strong>'+d.flightNumber+'</strong>' : ''}</div>
      <div style="font-size:13px;color:#333;padding:3px 0;"><span style="color:#c9a227;margin-right:6px;">&#9679;</span>${d.destination}</div>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:12px 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-right:1px solid #eee;width:20%;">Passagers</td>
          <td style="padding:12px 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-right:1px solid #eee;width:50%;">Passager(s)</td>
          <td style="padding:12px 16px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;width:30%;">Bagages</td>
        </tr>
        <tr>
          <td style="padding:8px 16px 14px;font-size:14px;color:#333;border-right:1px solid #eee;border-top:1px solid #eee;">${d.passengers}</td>
          <td style="padding:8px 16px 14px;font-size:14px;color:#333;border-right:1px solid #eee;border-top:1px solid #eee;">
            ${d.clientName}<br/>
            <span style="font-size:12px;color:#888;">${d.clientPhone}</span>
          </td>
          <td style="padding:8px 16px 14px;font-size:14px;color:#333;border-top:1px solid #eee;">${d.luggage}</td>
        </tr>
      </table>
    </td>
  </tr>
  ${d.vehicleCategory ? `<tr><td colspan="2" style="padding:12px 16px;border-top:1px solid #eee;font-size:13px;color:#555;">Véhicule souhaité : <strong>${d.vehicleCategory}</strong></td></tr>` : ''}
  ${d.specialRequests ? `<tr><td colspan="2" style="padding:12px 16px;border-top:1px solid #eee;font-size:13px;color:#555;">Demandes spéciales : <em style="color:#c9a227;">${d.specialRequests}</em></td></tr>` : ''}
  ${d.serviceType ? `<tr><td colspan="2" style="padding:12px 16px;border-top:1px solid #eee;font-size:13px;color:#555;">Type de service : <strong>${d.serviceType}</strong></td></tr>` : ''}
</table>

<p style="font-size:13px;color:#555;margin:0 0 6px 0;">Nous reprendrons contact avec vous très rapidement.</p>
<p style="font-size:13px;color:#555;margin:0;">L'équipe ${COMPANY_NAME}</p>
`;

  return wrap(body);
}

// ─── Types ─────────────────────────────────────────────────────────────────
export interface BookingData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  flightNumber?: string;
  specialRequests?: string;
  vehicleCategory?: string;
  estimatedPrice?: number;
}

// ─── Fonction principale : envoi des 2 emails de réservation ───────────────
export async function sendBookingEmails(
  data: BookingData,
  refNumber?: string
): Promise<{ success: boolean; error?: string }> {
  const ref = refNumber || String(Math.floor(Math.random() * 90000) + 10000);

  try {
    // Email 1 → Admin (booking@mschauffeur.fr)
    await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${BOOKING_EMAIL}>`,
      to: BOOKING_EMAIL,
      subject: `[RÉSERVATION n°${ref}] ${data.clientName} — ${data.date} à ${data.time}`,
      html: buildAdminNotificationEmail(data, ref),
    });

    // Email 2 → Client (son propre email)
    if (data.clientEmail) {
      await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${BOOKING_EMAIL}>`,
        to: data.clientEmail,
        replyTo: BOOKING_EMAIL,
        subject: `Confirmation de votre demande n°${ref} — ${COMPANY_NAME}`,
        html: buildClientConfirmationEmail(data, ref),
      });
    }

    console.log(`[EMAIL] Réservation n°${ref} envoyée à ${BOOKING_EMAIL} et ${data.clientEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL] Erreur envoi réservation:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── Alerte urgence → contact@mschauffeur.fr ──────────────────────────────
export async function sendUrgencyAlert(data: {
  type: string;
  title: string;
  message: string;
  details?: Record<string, string>;
}): Promise<{ success: boolean; error?: string }> {
  const detailsHtml = data.details
    ? Object.entries(data.details)
        .map(([k, v]) => `<tr><td style="color:#888;font-size:13px;padding:4px 0;width:140px;">${k}</td><td style="color:#333;font-size:13px;padding:4px 0;">${v}</td></tr>`)
        .join('')
    : '';

  const body = `
<div style="background:#fff8e6;border-left:4px solid #c9a227;padding:12px 16px;margin-bottom:20px;border-radius:0 4px 4px 0;">
  <div style="font-size:11px;color:#c9a227;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Alerte — ${data.type}</div>
  <div style="font-size:18px;font-weight:bold;color:#1a1200;">${data.title}</div>
</div>
<p style="font-size:14px;color:#333;line-height:1.7;margin:0 0 16px 0;">${data.message}</p>
${detailsHtml ? `<table cellpadding="0" cellspacing="0" style="border:1px solid #ddd;border-radius:4px;padding:14px 16px;width:100%;">${detailsHtml}</table>` : ''}
`;

  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME} — Alertes" <${BOOKING_EMAIL}>`,
      to: CONTACT_EMAIL,
      subject: `[ALERTE] ${data.title}`,
      html: wrap(body),
    });
    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL] Erreur envoi alerte:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── Test connexion SMTP ───────────────────────────────────────────────────
export async function testSmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Compatibilité avec l'ancien code ─────────────────────────────────────
export { sendBookingEmails as sendEmailNotification };
export const EMAIL_TEMPLATES = {};
export async function notifyNewDemand() { return true; }
export async function notifyMissionCompleted() { return true; }
export async function notifyPaymentReceived() { return true; }
export async function notifyChauffeurAssigned() { return true; }
export async function notifyReviewRequest() { return true; }
