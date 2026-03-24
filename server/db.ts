import { eq, desc, and, ne, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, clients, chauffeurs, vehicles, demands, missions, quotes, alerts, reviews, chatMessages } from "../drizzle/schema";
import { ENV } from './_core/env';

// ============================================================
// DONNEES DEMO - utilisees quand la base de donnees MySQL
// n'est pas disponible (developpement local sans BDD)
// Toutes les operations CRUD fonctionnent en memoire
// ============================================================
export const DEMO_CLIENTS: any[] = [
  { id: 1, name: 'Jean-Pierre Martin', email: 'jp.martin@email.com', phone: '+33 6 12 34 56 78', company: 'Martin & Associes', address: 'Aix-en-Provence', notes: 'Client VIP', type: 'vip', createdAt: new Date('2025-01-15') },
  { id: 2, name: 'Sophie Dubois', email: 'sophie.dubois@luxe.fr', phone: '+33 6 98 76 54 32', company: 'Luxe Events', address: 'Cannes', notes: 'Evenements corporate', type: 'business', createdAt: new Date('2025-02-01') },
  { id: 3, name: 'Marc Lefebvre', email: 'marc.l@finance.com', phone: '+33 7 11 22 33 44', company: 'Finance Corp', address: 'Marseille - Vieux Port', notes: 'Deplacements frequents', type: 'business', createdAt: new Date('2025-03-10') },
];
export const DEMO_CHAUFFEURS: any[] = [
  { id: 1, name: 'Ahmed Benali', email: 'ahmed.b@mschauffeur.fr', phone: '+33 6 55 44 33 22', licenseNumber: 'VTC-2024-001', languages: 'Francais, Arabe, Anglais', status: 'disponible', zones: 'Marseille, Aix-en-Provence, Toulon', notes: 'Chauffeur senior', createdAt: new Date('2024-06-01') },
  { id: 2, name: 'Pierre Moreau', email: 'pierre.m@mschauffeur.fr', phone: '+33 6 77 88 99 00', licenseNumber: 'VTC-2024-002', languages: 'Francais, Anglais', status: 'en_mission', zones: 'Nice, Cannes, Monaco, Antibes', notes: 'Specialiste aeroport', createdAt: new Date('2024-07-15') },
  { id: 3, name: 'Karim Ouali', email: 'karim.o@mschauffeur.fr', phone: '+33 6 11 22 33 44', licenseNumber: 'VTC-2024-003', languages: 'Francais, Anglais, Espagnol', status: 'disponible', zones: 'Saint-Tropez, Frejus, Hyeres', notes: 'Multilingue', createdAt: new Date('2024-08-20') },
];
export const DEMO_VEHICLES: any[] = [
  { id: 1, brand: 'Mercedes', model: 'Classe E', licensePlate: 'AB-123-CD', registration: 'AB-123-CD', year: 2023, category: 'berline', status: 'disponible', color: 'Noir', seats: 4, luggage: 3, notes: 'Vehicule principal', nextMaintenance: new Date('2026-06-01') },
  { id: 2, brand: 'Mercedes', model: 'Classe S', licensePlate: 'EF-456-GH', registration: 'EF-456-GH', year: 2023, category: 'berline_luxe', status: 'en_service', color: 'Noir', seats: 4, luggage: 3, notes: 'Prestige', nextMaintenance: new Date('2026-04-15') },
  { id: 3, brand: 'Mercedes', model: 'Classe V', licensePlate: 'IJ-789-KL', registration: 'IJ-789-KL', year: 2023, category: 'van', status: 'disponible', color: 'Noir', seats: 7, luggage: 5, notes: 'Groupes', nextMaintenance: new Date('2026-07-01') },
  { id: 4, brand: 'Tesla', model: 'Model Y', licensePlate: 'MN-012-OP', registration: 'MN-012-OP', year: 2024, category: 'suv', status: 'disponible', color: 'Noir', seats: 4, luggage: 3, notes: 'Electrique', nextMaintenance: new Date('2026-08-01') },
];
export const DEMO_DEMANDS: any[] = [
  { id: 1, clientId: 1, origin: 'Aeroport Marseille Provence', destination: 'Aix-en-Provence - Centre', date: new Date('2026-03-25T08:30:00'), passengers: 2, status: 'a_traiter', type: 'airport', message: 'Vol AF1234 - Panneau avec nom client', createdAt: new Date('2026-03-20'), assignedTo: null },
  { id: 2, clientId: 2, origin: 'Cannes - La Croisette', destination: 'Monaco', date: new Date('2026-03-26T14:00:00'), passengers: 4, status: 'devis_envoye', type: 'event', message: 'Soiree gala - vehicule prestige requis', createdAt: new Date('2026-03-21'), assignedTo: null },
  { id: 3, clientId: 3, origin: 'Marseille - Vieux Port', destination: 'Aeroport Nice Cote d\'Azur', date: new Date('2026-03-27T06:00:00'), passengers: 1, status: 'nouvelle', type: 'business', message: 'Depart tot - vol 06h45', createdAt: new Date('2026-03-22'), assignedTo: null },
];
export const DEMO_MISSIONS: any[] = [
  { id: 1, number: 'MSN-2026-001', clientId: 1, chauffeurId: 1, vehicleId: 1, type: 'airport', origin: 'Aeroport Marseille Provence', destination: 'Aix-en-Provence - Centre', date: new Date('2026-03-23T08:30:00'), passengers: 2, luggage: 1, status: 'en_cours', price: 180, priceHT: 150, paymentStatus: 'non_paye', notes: 'Vol AF1234', specialInstructions: 'Panneau avec nom client', createdAt: new Date('2026-03-20') },
  { id: 2, number: 'MSN-2026-002', clientId: 2, chauffeurId: 2, vehicleId: 2, type: 'event', origin: 'Cannes - La Croisette', destination: 'Monaco', date: new Date('2026-03-22T14:00:00'), passengers: 4, luggage: 2, status: 'terminee', price: 250, priceHT: 208, paymentStatus: 'paye', notes: 'Soiree gala', specialInstructions: null, createdAt: new Date('2026-03-21') },
  { id: 3, number: 'MSN-2026-003', clientId: 3, chauffeurId: 3, vehicleId: 3, type: 'business', origin: 'Marseille - Vieux Port', destination: 'Aeroport Nice Cote d\'Azur', date: new Date('2026-03-24T06:00:00'), passengers: 1, luggage: 1, status: 'a_confirmer', price: 120, priceHT: 100, paymentStatus: 'non_paye', notes: null, specialInstructions: null, createdAt: new Date('2026-03-22') },
  { id: 4, number: 'MSN-2026-004', clientId: 1, chauffeurId: 1, vehicleId: 1, type: 'business', origin: 'Gare Aix TGV', destination: 'Marseille - Prado', date: new Date('2026-03-21T16:00:00'), passengers: 1, luggage: 1, status: 'terminee', price: 95, priceHT: 79, paymentStatus: 'paye', notes: 'TGV INOUI', specialInstructions: null, createdAt: new Date('2026-03-19') },
  { id: 5, number: 'MSN-2026-005', clientId: 2, chauffeurId: 2, vehicleId: 2, type: 'airport', origin: 'Saint-Tropez', destination: 'Aeroport Nice Cote d\'Azur', date: new Date('2026-03-20T05:30:00'), passengers: 2, luggage: 3, status: 'terminee', price: 160, priceHT: 133, paymentStatus: 'paye', notes: null, specialInstructions: null, createdAt: new Date('2026-03-18') },
];
export const DEMO_QUOTES: any[] = [
  { id: 1, demandId: 1, number: 'DEV-2026-001', price: 180, priceHT: 150, status: 'envoye', validUntil: new Date('2026-04-25'), notes: 'Tarif standard aeroport', createdAt: new Date('2026-03-20') },
  { id: 2, demandId: 2, number: 'DEV-2026-002', price: 250, priceHT: 208, status: 'accepte', validUntil: new Date('2026-04-26'), notes: 'Tarif evenement premium', createdAt: new Date('2026-03-21') },
  { id: 3, demandId: 3, number: 'DEV-2026-003', price: 120, priceHT: 100, status: 'brouillon', validUntil: new Date('2026-04-27'), notes: null, createdAt: new Date('2026-03-22') },
];
export const DEMO_ALERTS: any[] = [
  { id: 1, type: 'maintenance', title: 'Maintenance Mercedes Classe S', message: 'Revision prevue dans 3 semaines', priority: 'haute', status: 'active', vehicleId: 2, chauffeurId: null, createdAt: new Date('2026-03-23') },
  { id: 2, type: 'retard', title: 'Retard mission #1', message: 'Trafic dense sur A7 - retard estime 20 min', priority: 'urgente', status: 'active', vehicleId: null, chauffeurId: 1, createdAt: new Date('2026-03-23') },
  { id: 3, type: 'info', title: 'Nouveau client enregistre', message: 'Marc Lefebvre - Finance Corp', priority: 'normale', status: 'lue', vehicleId: null, chauffeurId: null, createdAt: new Date('2026-03-22') },
];
export const DEMO_REVIEWS: any[] = [];
export const DEMO_CHAT_MESSAGES: any[] = [];

// Compteurs auto-increment pour le mode memoire
let _nextId: Record<string, number> = {
  clients: 4,
  chauffeurs: 4,
  vehicles: 5,
  demands: 4,
  missions: 6,
  quotes: 4,
  alerts: 4,
  reviews: 1,
  chatMessages: 1,
};

function getNextId(table: string): number {
  const id = _nextId[table] || 1;
  _nextId[table] = id + 1;
  return id;
}

// ============================================================
// DATABASE CONNECTION
// ============================================================
let _db: any = null;
let _pool: mysql.Pool | null = null;
let _dbInitialized = false;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    if (url.startsWith('file:') || url.startsWith('sqlite:') || !url.includes('://')) {
      console.warn('[Database] Skipping non-MySQL URL, using demo data:', url);
      return null;
    }
    try {
      _pool = mysql.createPool({
        uri: url,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
      const conn = await _pool.getConnection();
      conn.release();
      _db = drizzle(_pool);
      console.log('[Database] Connected to MySQL successfully');
      if (!_dbInitialized) {
        await initDatabase(_pool);
        _dbInitialized = true;
      }
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

async function initDatabase(pool: mysql.Pool) {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`CREATE TABLE IF NOT EXISTS app_users (
      id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(320) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
      name VARCHAR(255), phone VARCHAR(20), role ENUM('admin','gestionnaire','chauffeur','client') DEFAULT 'gestionnaire',
      status ENUM('actif','inactif','suspendu') DEFAULT 'actif',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY, openId VARCHAR(255) NOT NULL UNIQUE, name VARCHAR(255),
      email VARCHAR(320), loginMethod VARCHAR(100), role VARCHAR(50) DEFAULT 'user',
      lastSignedIn TIMESTAMP NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(320), phone VARCHAR(20) NOT NULL,
      company VARCHAR(255), type VARCHAR(100) DEFAULT 'particulier', address TEXT, preferences TEXT, notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS chauffeurs (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(320), phone VARCHAR(20) NOT NULL,
      licenseNumber VARCHAR(100), languages VARCHAR(255), zones TEXT, status VARCHAR(50) DEFAULT 'disponible',
      type VARCHAR(50) DEFAULT 'interne', notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY, brand VARCHAR(255) NOT NULL, model VARCHAR(255) NOT NULL,
      licensePlate VARCHAR(20) NOT NULL UNIQUE, category VARCHAR(100) NOT NULL, seats INT DEFAULT 4,
      luggage INT DEFAULT 3, color VARCHAR(100), year INT, mileage INT, status VARCHAR(50) DEFAULT 'disponible',
      nextMaintenance TIMESTAMP NULL, notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS demands (
      id INT AUTO_INCREMENT PRIMARY KEY, clientId INT NOT NULL, type VARCHAR(100) NOT NULL,
      origin VARCHAR(255) NOT NULL, destination VARCHAR(255) NOT NULL, date TIMESTAMP NOT NULL,
      passengers INT DEFAULT 1, luggage INT DEFAULT 0, vehicleType VARCHAR(100), message TEXT,
      status VARCHAR(50) DEFAULT 'nouvelle', priority VARCHAR(50) DEFAULT 'normale', source VARCHAR(100) DEFAULT 'site',
      assignedTo INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS quotes (
      id INT AUTO_INCREMENT PRIMARY KEY, demandId INT NOT NULL, number VARCHAR(50) NOT NULL UNIQUE,
      price INT NOT NULL, priceHT INT NOT NULL, status VARCHAR(50) DEFAULT 'brouillon',
      validUntil TIMESTAMP NULL, notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS missions (
      id INT AUTO_INCREMENT PRIMARY KEY, number VARCHAR(50) NOT NULL UNIQUE, clientId INT NOT NULL,
      chauffeurId INT, vehicleId INT, quoteId INT, type VARCHAR(100) NOT NULL DEFAULT 'standard',
      origin VARCHAR(255) NOT NULL, destination VARCHAR(255) NOT NULL, date TIMESTAMP NOT NULL,
      passengers INT DEFAULT 1, luggage INT DEFAULT 0, price INT, priceHT INT,
      paymentStatus VARCHAR(50) DEFAULT 'non_paye', paymentMethod VARCHAR(100),
      status VARCHAR(50) DEFAULT 'a_confirmer', notes TEXT, specialInstructions TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS alerts (
      id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(100) NOT NULL, title VARCHAR(255) NOT NULL,
      message TEXT, priority VARCHAR(50) DEFAULT 'normale', relatedEntity VARCHAR(100), relatedId INT,
      vehicleId INT, chauffeurId INT, status VARCHAR(50) DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY, missionId INT NOT NULL, clientId INT NOT NULL, chauffeurId INT,
      rating INT NOT NULL, comment TEXT, ratingPunctuality INT, ratingComfort INT, ratingDriving INT,
      ratingCleanliness INT, isPublic TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY, conversationId VARCHAR(100) NOT NULL, senderId INT NOT NULL,
      senderName VARCHAR(255) NOT NULL, senderRole VARCHAR(50) NOT NULL, content TEXT NOT NULL,
      missionId INT, isRead TINYINT(1) DEFAULT 0, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_conversation (conversationId), INDEX idx_sender (senderId)
    )`);
    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize tables:', error);
  } finally {
    conn.release();
  }
}

// ============================================================
// USER FUNCTIONS (OAuth)
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    if (openId === 'demo-admin-001') {
      return { id: 1, openId: 'demo-admin-001', name: 'Admin Demo', email: 'admin@majestic-south.com', role: 'admin', createdAt: new Date(), lastSignedIn: new Date(), loginMethod: null } as any;
    }
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// GET ALL FUNCTIONS
// ============================================================
export async function getAllClients() {
  const db = await getDb();
  if (!db) return DEMO_CLIENTS;
  return await db.select().from(clients);
}
export async function getAllChauffeurs() {
  const db = await getDb();
  if (!db) return DEMO_CHAUFFEURS;
  return await db.select().from(chauffeurs);
}
export async function getAllVehicles() {
  const db = await getDb();
  if (!db) return DEMO_VEHICLES;
  return await db.select().from(vehicles);
}
export async function getAllDemands() {
  const db = await getDb();
  if (!db) return DEMO_DEMANDS;
  return await db.select().from(demands);
}
export async function getAllMissions() {
  const db = await getDb();
  if (!db) return DEMO_MISSIONS;
  return await db.select().from(missions);
}
export async function getAllQuotes() {
  const db = await getDb();
  if (!db) return DEMO_QUOTES;
  return await db.select().from(quotes);
}
export async function getAllAlerts() {
  const db = await getDb();
  if (!db) return DEMO_ALERTS;
  return await db.select().from(alerts);
}
export async function getAllReviews() {
  const db = await getDb();
  if (!db) return DEMO_REVIEWS;
  return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

// ============================================================
// CLIENTS CRUD
// ============================================================
export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_CLIENTS.find(x => x.id === id);
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createClient(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('clients'), ...data, createdAt: new Date() };
    DEMO_CLIENTS.push(newItem);
    console.log(`[Memory] Client cree: ${newItem.name} (id: ${newItem.id})`);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(clients).values(data);
}
export async function updateClient(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_CLIENTS.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_CLIENTS[idx], data);
    return DEMO_CLIENTS.find(x => x.id === id);
  }
  await db.update(clients).set(data).where(eq(clients.id, id));
  return await getClientById(id);
}
export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_CLIENTS.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_CLIENTS.splice(idx, 1);
    return { success: true };
  }
  await db.delete(clients).where(eq(clients.id, id));
  return { success: true };
}

// ============================================================
// CHAUFFEURS CRUD
// ============================================================
export async function getChauffeurById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_CHAUFFEURS.find(x => x.id === id);
  const result = await db.select().from(chauffeurs).where(eq(chauffeurs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createChauffeur(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('chauffeurs'), ...data, status: data.status || 'disponible', createdAt: new Date() };
    DEMO_CHAUFFEURS.push(newItem);
    console.log(`[Memory] Chauffeur cree: ${newItem.name} (id: ${newItem.id})`);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(chauffeurs).values(data);
}
export async function updateChauffeur(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_CHAUFFEURS.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_CHAUFFEURS[idx], data);
    return DEMO_CHAUFFEURS.find(x => x.id === id);
  }
  await db.update(chauffeurs).set(data).where(eq(chauffeurs.id, id));
  return await getChauffeurById(id);
}
export async function deleteChauffeur(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_CHAUFFEURS.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_CHAUFFEURS.splice(idx, 1);
    return { success: true };
  }
  await db.delete(chauffeurs).where(eq(chauffeurs.id, id));
  return { success: true };
}

// ============================================================
// VEHICLES CRUD
// ============================================================
export async function getVehicleById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_VEHICLES.find(x => x.id === id);
  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createVehicle(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('vehicles'), ...data, licensePlate: data.registration || data.licensePlate, status: data.status || 'disponible', createdAt: new Date() };
    DEMO_VEHICLES.push(newItem);
    console.log(`[Memory] Vehicule cree: ${newItem.brand} ${newItem.model} (id: ${newItem.id})`);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(vehicles).values(data);
}
export async function updateVehicle(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_VEHICLES.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_VEHICLES[idx], data);
    return DEMO_VEHICLES.find(x => x.id === id);
  }
  await db.update(vehicles).set(data).where(eq(vehicles.id, id));
  return await getVehicleById(id);
}
export async function deleteVehicle(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_VEHICLES.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_VEHICLES.splice(idx, 1);
    return { success: true };
  }
  await db.delete(vehicles).where(eq(vehicles.id, id));
  return { success: true };
}

// ============================================================
// DEMANDS CRUD
// ============================================================
export async function getDemandById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_DEMANDS.find(x => x.id === id);
  const result = await db.select().from(demands).where(eq(demands.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createDemand(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('demands'), ...data, status: data.status || 'nouvelle', createdAt: new Date() };
    DEMO_DEMANDS.push(newItem);
    console.log(`[Memory] Demande creee (id: ${newItem.id})`);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(demands).values(data);
}
export async function updateDemand(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_DEMANDS.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_DEMANDS[idx], data);
    return DEMO_DEMANDS.find(x => x.id === id);
  }
  await db.update(demands).set(data).where(eq(demands.id, id));
  return await getDemandById(id);
}
export async function deleteDemand(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_DEMANDS.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_DEMANDS.splice(idx, 1);
    return { success: true };
  }
  await db.delete(demands).where(eq(demands.id, id));
  return { success: true };
}

// ============================================================
// MISSIONS CRUD
// ============================================================
export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_MISSIONS.find(x => x.id === id);
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createMission(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('missions'), ...data, status: data.status || 'a_confirmer', paymentStatus: data.paymentStatus || 'non_paye', createdAt: new Date() };
    DEMO_MISSIONS.push(newItem);
    console.log(`[Memory] Mission creee: ${newItem.number} (id: ${newItem.id})`);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(missions).values(data);
}
export async function updateMission(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_MISSIONS.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_MISSIONS[idx], data);
    return DEMO_MISSIONS.find(x => x.id === id);
  }
  await db.update(missions).set(data).where(eq(missions.id, id));
  return await getMissionById(id);
}
export async function deleteMission(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_MISSIONS.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_MISSIONS.splice(idx, 1);
    return { success: true };
  }
  await db.delete(missions).where(eq(missions.id, id));
  return { success: true };
}

// ============================================================
// QUOTES CRUD
// ============================================================
export async function getQuoteById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_QUOTES.find(x => x.id === id);
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createQuote(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('quotes'), ...data, status: data.status || 'brouillon', createdAt: new Date() };
    DEMO_QUOTES.push(newItem);
    console.log(`[Memory] Devis cree: ${newItem.number} (id: ${newItem.id})`);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(quotes).values(data);
}
export async function updateQuote(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_QUOTES.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_QUOTES[idx], data);
    return DEMO_QUOTES.find(x => x.id === id);
  }
  await db.update(quotes).set(data).where(eq(quotes.id, id));
  return await getQuoteById(id);
}
export async function deleteQuote(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_QUOTES.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_QUOTES.splice(idx, 1);
    return { success: true };
  }
  await db.delete(quotes).where(eq(quotes.id, id));
  return { success: true };
}

// ============================================================
// ALERTS CRUD
// ============================================================
export async function getAlertById(id: number) {
  const db = await getDb();
  if (!db) return DEMO_ALERTS.find(x => x.id === id);
  const result = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
export async function createAlert(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('alerts'), ...data, status: data.status || 'active', createdAt: new Date() };
    DEMO_ALERTS.push(newItem);
    return [{ insertId: newItem.id }];
  }
  return await db.insert(alerts).values(data);
}
export async function updateAlert(id: number, data: any) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_ALERTS.findIndex(x => x.id === id);
    if (idx >= 0) Object.assign(DEMO_ALERTS[idx], data);
    return DEMO_ALERTS.find(x => x.id === id);
  }
  await db.update(alerts).set(data).where(eq(alerts.id, id));
  return await getAlertById(id);
}
export async function deleteAlert(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_ALERTS.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_ALERTS.splice(idx, 1);
    return { success: true };
  }
  await db.delete(alerts).where(eq(alerts.id, id));
  return { success: true };
}

// ============================================================
// REVIEWS CRUD
// ============================================================
export async function getReviewsByMission(missionId: number) {
  const db = await getDb();
  if (!db) return DEMO_REVIEWS.filter(x => x.missionId === missionId);
  return await db.select().from(reviews).where(eq(reviews.missionId, missionId));
}
export async function getReviewsByChauffeur(chauffeurId: number) {
  const db = await getDb();
  if (!db) return DEMO_REVIEWS.filter(x => x.chauffeurId === chauffeurId);
  return await db.select().from(reviews).where(eq(reviews.chauffeurId, chauffeurId));
}
export async function createReview(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('reviews'), ...data, createdAt: new Date() };
    DEMO_REVIEWS.push(newItem);
    return { id: newItem.id, ...data };
  }
  const result = await db.insert(reviews).values(data);
  return { id: (result[0] as any).insertId, ...data };
}
export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_REVIEWS.findIndex(x => x.id === id);
    if (idx >= 0) DEMO_REVIEWS.splice(idx, 1);
    return { success: true };
  }
  await db.delete(reviews).where(eq(reviews.id, id));
  return { success: true };
}

// ============================================================
// CHAT MESSAGES
// ============================================================
export async function getChatMessages(conversationId: string, limit = 50) {
  const db = await getDb();
  if (!db) return DEMO_CHAT_MESSAGES.filter(x => x.conversationId === conversationId).slice(-limit);
  return await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(chatMessages.createdAt).limit(limit);
}
export async function createChatMessage(data: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { id: getNextId('chatMessages'), ...data, isRead: false, createdAt: new Date() };
    DEMO_CHAT_MESSAGES.push(newItem);
    return newItem;
  }
  const result = await db.insert(chatMessages).values(data);
  return { id: (result[0] as any).insertId, ...data, isRead: false, createdAt: new Date() };
}
export async function markChatMessagesRead(conversationId: string, userId: number) {
  const db = await getDb();
  if (!db) {
    DEMO_CHAT_MESSAGES.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== userId) m.isRead = true;
    });
    return;
  }
  await db.update(chatMessages).set({ isRead: true }).where(and(eq(chatMessages.conversationId, conversationId), ne(chatMessages.senderId, userId)));
}
export async function getUnreadChatCount(userId: number, senderRole: string) {
  const db = await getDb();
  if (!db) return DEMO_CHAT_MESSAGES.filter(m => !m.isRead && m.senderId !== userId).length;
  const result = await db.select({ count: count() }).from(chatMessages).where(and(eq(chatMessages.isRead, false), ne(chatMessages.senderId, userId)));
  return result[0]?.count ?? 0;
}
