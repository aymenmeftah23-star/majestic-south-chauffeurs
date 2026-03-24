/**
 * iCal Service - Majestic South Chauffeurs
 * Génération de fichiers .ics pour synchronisation calendrier (Google Calendar, Apple Calendar, Outlook)
 */

interface ICalMission {
  id: number;
  number: string;
  origin: string;
  destination: string;
  date: Date | string;
  status: string;
  notes?: string | null;
  specialInstructions?: string | null;
  clientName?: string;
  clientPhone?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  passengers?: number;
}

// Formater une date au format iCal (YYYYMMDDTHHMMSSZ)
function formatICalDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Échapper les caractères spéciaux iCal
function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// Générer un UID unique pour un événement
function generateUID(missionId: number): string {
  return `mission-${missionId}@mschauffeur.fr`;
}

// Générer le contenu iCal pour une liste de missions
export function generateICalContent(missions: ICalMission[], chauffeurName?: string): string {
  const now = formatICalDate(new Date());
  
  const events = missions.map(m => {
    const startDate = new Date(m.date);
    // Durée estimée : 2h par défaut
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const summary = `Mission ${m.number} - ${m.origin} → ${m.destination}`;
    const descParts = [
      `Trajet: ${m.origin} → ${m.destination}`,
      m.clientName ? `Client: ${m.clientName}` : '',
      m.clientPhone ? `Tel client: ${m.clientPhone}` : '',
      m.vehicleModel ? `Vehicule: ${m.vehicleModel}` : '',
      m.vehiclePlate ? `Immatriculation: ${m.vehiclePlate}` : '',
      m.passengers ? `Passagers: ${m.passengers}` : '',
      m.notes ? `Notes: ${m.notes}` : '',
      m.specialInstructions ? `Instructions: ${m.specialInstructions}` : '',
    ].filter(Boolean).join('\n');

    return [
      'BEGIN:VEVENT',
      `UID:${generateUID(m.id)}`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatICalDate(startDate)}`,
      `DTEND:${formatICalDate(endDate)}`,
      `SUMMARY:${escapeIcal(summary)}`,
      `DESCRIPTION:${escapeIcal(descParts)}`,
      `LOCATION:${escapeIcal(m.origin)}`,
      `STATUS:${m.status === 'annulee' ? 'CANCELLED' : 'CONFIRMED'}`,
      `CATEGORIES:MISSION,VTC`,
      'END:VEVENT',
    ].join('\r\n');
  });

  const calName = chauffeurName
    ? `Majestic South - ${chauffeurName}`
    : 'Majestic South Chauffeurs';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Majestic South Chauffeurs//FR',
    `X-WR-CALNAME:${escapeIcal(calName)}`,
    'X-WR-TIMEZONE:Europe/Paris',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}
