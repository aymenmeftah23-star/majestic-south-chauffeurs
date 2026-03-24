/**
 * Real-time Notification Service - Majestic South Chauffeurs
 * Utilise Server-Sent Events (SSE) pour pousser des notifications aux clients
 */
import { Response } from 'express';

// Interface pour une notification
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// Map pour stocker les connexions actives (userId -> Response)
const clients = new Map<number, Set<Response>>();

// Ajouter un client SSE
export function addClient(userId: number, res: Response) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  
  const userClients = clients.get(userId)!;
  userClients.add(res);
  
  // Headers requis pour SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Envoyer un événement initial pour confirmer la connexion
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);
  
  // Gérer la déconnexion
  res.on('close', () => {
    userClients.delete(res);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  });
}

// Envoyer une notification à un utilisateur spécifique
export function notifyUser(userId: number, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const userClients = clients.get(userId);
  
  if (userClients && userClients.size > 0) {
    const fullNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const data = `data: ${JSON.stringify(fullNotification)}\n\n`;
    
    userClients.forEach(client => {
      try {
        client.write(data);
      } catch (err) {
        console.error(`[SSE] Erreur d'envoi à l'utilisateur ${userId}:`, err);
        userClients.delete(client);
      }
    });
    
    console.log(`[SSE] Notification envoyée à l'utilisateur ${userId}: ${notification.title}`);
    return true;
  }
  
  return false;
}

// Envoyer une notification à tous les utilisateurs d'un rôle spécifique (ex: admins)
// Note: Dans une vraie implémentation, on vérifierait le rôle en DB.
// Ici on simule pour l'admin principal (ID 1 généralement)
export function notifyAdmins(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  // Pour l'instant, on envoie à l'utilisateur 1 (admin par défaut)
  return notifyUser(1, notification);
}

// Garder la connexion active avec un ping régulier
setInterval(() => {
  clients.forEach(userClients => {
    userClients.forEach(client => {
      try {
        client.write(':\n\n'); // Commentaire SSE pour garder la connexion ouverte
      } catch (err) {
        userClients.delete(client);
      }
    });
  });
}, 30000); // Toutes les 30 secondes
