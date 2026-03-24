/**
 * CRON Service - Majestic South Chauffeurs
 * Tâches planifiées (rappels 24h, nettoyage, etc.)
 */
import { getDb } from './db';
import { sendMissionReminder } from './email-service';
import { missions, clients, chauffeurs, vehicles } from '../drizzle/schema';
import { eq, and, gt, lt, inArray } from 'drizzle-orm';

// Variable pour stocker l'intervalle
let cronInterval: ReturnType<typeof setInterval> | null = null;

// Pour éviter d'envoyer plusieurs fois le même rappel (comme on n'a pas de colonne reminderSent)
// on stocke en mémoire les IDs des missions déjà notifiées
const remindersSent = new Set<number>();

// Fonction principale pour vérifier les missions à venir dans ~24h
export async function checkUpcomingMissions() {
  console.log('[CRON] Verification des missions dans 24h...');
  
  try {
    // Si la DB n'est pas initialisée, on arrête
    const db = await getDb();
    if (!db) {
      console.log('[CRON] Base de donnees non initialisee, annulation.');
      return;
    }

    // Calculer la fenêtre de temps (entre 23h et 25h à partir de maintenant)
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    console.log(`[CRON] Recherche de missions entre ${in23Hours.toISOString()} et ${in25Hours.toISOString()}`);
    
    // Récupérer les missions qui ont lieu demain
    const upcomingMissions = await db.select({
      mission: missions,
      client: clients,
      chauffeur: chauffeurs,
      vehicle: vehicles
    })
    .from(missions)
    .leftJoin(clients, eq(missions.clientId, clients.id))
    .leftJoin(chauffeurs, eq(missions.chauffeurId, chauffeurs.id))
    .leftJoin(vehicles, eq(missions.vehicleId, vehicles.id))
    .where(
      and(
        gt(missions.date, in23Hours),
        lt(missions.date, in25Hours),
        inArray(missions.status, ['confirmee', 'chauffeur_assigne', 'vehicule_assigne', 'prete'])
      )
    );

    console.log(`[CRON] ${upcomingMissions.length} mission(s) trouvee(s) pour demain.`);

    // Envoyer les emails
    for (const record of upcomingMissions) {
      const m = record.mission;
      const c = record.client;
      const ch = record.chauffeur;
      const v = record.vehicle;

      if (!c || !c.email) continue;
      
      // Vérifier si on a déjà envoyé le rappel pour cette mission
      if (remindersSent.has(m.id)) {
        continue;
      }

      console.log(`[CRON] Envoi rappel pour la mission ${m.number} a ${c.email}`);
      
      await sendMissionReminder({
        clientEmail: c.email,
        clientName: c.name,
        missionNumber: m.number,
        origin: m.origin,
        destination: m.destination,
        date: m.date,
        chauffeurName: ch?.name || undefined,
        chauffeurPhone: ch?.phone || undefined,
        vehicleModel: v ? `${v.brand} ${v.model}` : undefined,
        vehiclePlate: v?.licensePlate || undefined,
      });

      // Marquer comme envoyé
      remindersSent.add(m.id);
    }
    
    console.log('[CRON] Verification terminee.');
    
  } catch (err) {
    console.error('[CRON] Erreur lors de la verification des missions:', err);
  }
}

// Démarrer le service CRON
export function startCronService() {
  if (cronInterval) {
    clearInterval(cronInterval);
  }
  
  console.log('[CRON] Service demarre. Verification toutes les heures.');
  
  // Exécuter une première fois au démarrage (après un petit délai pour laisser la DB s'initialiser)
  setTimeout(checkUpcomingMissions, 10000);
  
  // Puis exécuter toutes les heures (3600000 ms)
  cronInterval = setInterval(checkUpcomingMissions, 3600000);
}

// Arrêter le service CRON
export function stopCronService() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log('[CRON] Service arrete.');
  }
}
