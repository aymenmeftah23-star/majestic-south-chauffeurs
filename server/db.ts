import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, clients, chauffeurs, vehicles, demands, missions, quotes, alerts } from "../drizzle/schema";
import { ENV } from './_core/env';

// ============================================================
// DONNÉES DÉMO - utilisées quand la base de données MySQL
// n'est pas disponible (développement local sans BDD)
// ============================================================
export const DEMO_CLIENTS = [
  { id: 1, name: 'Jean-Pierre Martin', email: 'jp.martin@email.com', phone: '+33 6 12 34 56 78', company: 'Martin & Associés', address: 'Aix-en-Provence', notes: 'Client VIP', type: 'vip', createdAt: new Date('2025-01-15') },
  { id: 2, name: 'Sophie Dubois', email: 'sophie.dubois@luxe.fr', phone: '+33 6 98 76 54 32', company: 'Luxe Events', address: 'Cannes', notes: 'Événements corporate', type: 'business', createdAt: new Date('2025-02-01') },
  { id: 3, name: 'Marc Lefebvre', email: 'marc.l@finance.com', phone: '+33 7 11 22 33 44', company: 'Finance Corp', address: 'Marseille - Vieux Port', notes: 'Déplacements fréquents', type: 'business', createdAt: new Date('2025-03-10') },
];
export const DEMO_CHAUFFEURS = [
  { id: 1, name: 'Ahmed Benali', email: 'ahmed.b@mschauffeur.fr', phone: '+33 6 55 44 33 22', licenseNumber: 'VTC-2024-001', languages: 'Français, Arabe, Anglais', status: 'disponible', zones: 'Marseille, Aix-en-Provence, Toulon', notes: 'Chauffeur senior', createdAt: new Date('2024-06-01') },
  { id: 2, name: 'Pierre Moreau', email: 'pierre.m@mschauffeur.fr', phone: '+33 6 77 88 99 00', licenseNumber: 'VTC-2024-002', languages: 'Français, Anglais', status: 'en_mission', zones: 'Nice, Cannes, Monaco, Antibes', notes: 'Spécialiste aéroport', createdAt: new Date('2024-07-15') },
  { id: 3, name: 'Karim Ouali', email: 'karim.o@mschauffeur.fr', phone: '+33 6 11 22 33 44', licenseNumber: 'VTC-2024-003', languages: 'Français, Anglais, Espagnol', status: 'disponible', zones: 'Saint-Tropez, Fréjus, Hyères', notes: 'Multilingue', createdAt: new Date('2024-08-20') },
];
export const DEMO_VEHICLES = [
  { id: 1, brand: 'Mercedes', model: 'Classe E', licensePlate: 'AB-123-CD', year: 2023, category: 'berline', status: 'disponible', color: 'Noir', seats: 4, notes: 'Véhicule principal', nextMaintenance: new Date('2026-06-01') },
  { id: 2, brand: 'Mercedes', model: 'Classe S', licensePlate: 'EF-456-GH', year: 2023, category: 'berline_luxe', status: 'en_service', color: 'Noir', seats: 4, notes: 'Prestige', nextMaintenance: new Date('2026-04-15') },
  { id: 3, brand: 'Mercedes', model: 'Classe V', licensePlate: 'IJ-789-KL', year: 2023, category: 'van', status: 'disponible', color: 'Noir', seats: 7, notes: 'Groupes', nextMaintenance: new Date('2026-07-01') },
  { id: 4, brand: 'Tesla', model: 'Model Y', licensePlate: 'MN-012-OP', year: 2024, category: 'suv', status: 'disponible', color: 'Noir', seats: 4, notes: 'Électrique', nextMaintenance: new Date('2026-08-01') },
];
export const DEMO_DEMANDS = [
  { id: 1, clientId: 1, origin: 'Aéroport Marseille Provence', destination: 'Aix-en-Provence - Centre', date: new Date('2026-03-25T08:30:00'), passengers: 2, status: 'a_traiter', type: 'airport', message: 'Vol AF1234 - Panneau avec nom client', createdAt: new Date('2026-03-20'), assignedTo: null },
  { id: 2, clientId: 2, origin: 'Cannes - La Croisette', destination: 'Monaco', date: new Date('2026-03-26T14:00:00'), passengers: 4, status: 'devis_envoye', type: 'event', message: 'Soirée gala - véhicule prestige requis', createdAt: new Date('2026-03-21'), assignedTo: null },
  { id: 3, clientId: 3, origin: 'Marseille - Vieux Port', destination: 'Aéroport Nice Côte d\'Azur', date: new Date('2026-03-27T06:00:00'), passengers: 1, status: 'nouvelle', type: 'business', message: 'Départ tôt - vol 06h45', createdAt: new Date('2026-03-22'), assignedTo: null },
];
export const DEMO_MISSIONS = [
  { id: 1, clientId: 1, chauffeurId: 1, vehicleId: 1, origin: 'Aéroport Marseille Provence', destination: 'Aix-en-Provence - Centre', date: new Date('2026-03-23T08:30:00'), status: 'en_cours', price: 180, notes: 'Vol AF1234', specialInstructions: 'Panneau avec nom client', createdAt: new Date('2026-03-20') },
  { id: 2, clientId: 2, chauffeurId: 2, vehicleId: 2, origin: 'Cannes - La Croisette', destination: 'Monaco', date: new Date('2026-03-22T14:00:00'), status: 'terminee', price: 250, notes: 'Soirée gala', specialInstructions: null, createdAt: new Date('2026-03-21') },
  { id: 3, clientId: 3, chauffeurId: 3, vehicleId: 3, origin: 'Marseille - Vieux Port', destination: 'Aéroport Nice Côte d\'Azur', date: new Date('2026-03-24T06:00:00'), status: 'a_confirmer', price: 120, notes: null, specialInstructions: null, createdAt: new Date('2026-03-22') },
  { id: 4, clientId: 1, chauffeurId: 1, vehicleId: 1, origin: 'Gare Aix TGV', destination: 'Marseille - Prado', date: new Date('2026-03-21T16:00:00'), status: 'terminee', price: 95, notes: 'TGV INOUI', specialInstructions: null, createdAt: new Date('2026-03-19') },
  { id: 5, clientId: 2, chauffeurId: 2, vehicleId: 2, origin: 'Saint-Tropez', destination: 'Aéroport Nice Côte d\'Azur', date: new Date('2026-03-20T05:30:00'), status: 'terminee', price: 160, notes: null, specialInstructions: null, createdAt: new Date('2026-03-18') },
];
export const DEMO_QUOTES = [
  { id: 1, demandId: 1, number: 'DEV-2026-001', price: 180, priceHT: 150, status: 'envoye', validUntil: new Date('2026-04-25'), notes: 'Tarif standard aéroport', createdAt: new Date('2026-03-20') },
  { id: 2, demandId: 2, number: 'DEV-2026-002', price: 250, priceHT: 208.33, status: 'accepte', validUntil: new Date('2026-04-26'), notes: 'Tarif événement premium', createdAt: new Date('2026-03-21') },
  { id: 3, demandId: 3, number: 'DEV-2026-003', price: 120, priceHT: 100, status: 'brouillon', validUntil: new Date('2026-04-27'), notes: null, createdAt: new Date('2026-03-22') },
];
export const DEMO_ALERTS = [
  { id: 1, type: 'maintenance', title: 'Maintenance Mercedes Classe S', message: 'Révision prévue dans 3 semaines', priority: 'haute', status: 'active', vehicleId: 2, chauffeurId: null, createdAt: new Date('2026-03-23') },
  { id: 2, type: 'retard', title: 'Retard mission #1', message: 'Trafic dense sur A7 - retard estimé 20 min', priority: 'urgente', status: 'active', vehicleId: null, chauffeurId: 1, createdAt: new Date('2026-03-23') },
  { id: 3, type: 'info', title: 'Nouveau client enregistré', message: 'Marc Lefebvre - Finance Corp', priority: 'normale', status: 'lue', vehicleId: null, chauffeurId: null, createdAt: new Date('2026-03-22') },
];


let _db: any = null;
let _pool: mysql.Pool | null = null;
let _dbInitialized = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    // Ne pas tenter de connexion MySQL avec une URL SQLite ou invalide
    if (url.startsWith('file:') || url.startsWith('sqlite:') || !url.includes('://')) {
      console.warn('[Database] Skipping non-MySQL URL, using demo data:', url);
      return null;
    }
    try {
      // Créer un pool de connexions mysql2
      _pool = mysql.createPool({
        uri: url,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
      // Tester la connexion
      const conn = await _pool.getConnection();
      conn.release();
      _db = drizzle(_pool);
      console.log('[Database] Connected to MySQL successfully');
      // Créer les tables si elles n\'existent pas
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

// Initialiser la base de données (créer les tables)
async function initDatabase(pool: mysql.Pool) {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS app_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('admin','gestionnaire','chauffeur','client') DEFAULT 'gestionnaire',
        status ENUM('actif','inactif','suspendu') DEFAULT 'actif',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(320),
        phone VARCHAR(20) NOT NULL,
        company VARCHAR(255),
        type VARCHAR(100) DEFAULT 'particulier',
        address TEXT,
        preferences TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS chauffeurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(320),
        phone VARCHAR(20) NOT NULL,
        licenseNumber VARCHAR(100),
        languages VARCHAR(255),
        zones TEXT,
        status VARCHAR(50) DEFAULT 'disponible',
        type VARCHAR(50) DEFAULT 'interne',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        licensePlate VARCHAR(20) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        seats INT DEFAULT 4,
        luggage INT DEFAULT 3,
        color VARCHAR(100),
        year INT,
        mileage INT,
        status VARCHAR(50) DEFAULT 'disponible',
        nextMaintenance TIMESTAMP NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS demands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        passengers INT DEFAULT 1,
        luggage INT DEFAULT 0,
        vehicleType VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'nouvelle',
        priority VARCHAR(50) DEFAULT 'normale',
        source VARCHAR(100) DEFAULT 'site',
        assignedTo INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        demandId INT NOT NULL,
        number VARCHAR(50) NOT NULL UNIQUE,
        price INT NOT NULL,
        priceHT INT NOT NULL,
        status VARCHAR(50) DEFAULT 'brouillon',
        validUntil TIMESTAMP NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS missions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(50) NOT NULL UNIQUE,
        clientId INT NOT NULL,
        chauffeurId INT,
        vehicleId INT,
        quoteId INT,
        type VARCHAR(100) NOT NULL DEFAULT 'standard',
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        passengers INT DEFAULT 1,
        luggage INT DEFAULT 0,
        price INT,
        priceHT INT,
        paymentStatus VARCHAR(50) DEFAULT 'non_paye',
        paymentMethod VARCHAR(100),
        status VARCHAR(50) DEFAULT 'a_confirmer',
        notes TEXT,
        specialInstructions TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        priority VARCHAR(50) DEFAULT 'normale',
        relatedEntity VARCHAR(100),
        relatedId INT,
        vehicleId INT,
        chauffeurId INT,
        status VARCHAR(50) DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[Database] Tables initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize tables:', error);
  } finally {
    conn.release();
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    // Mode démo : retourner l'utilisateur démo
    if (openId === 'demo-admin-001') {
      return { id: 1, openId: 'demo-admin-001', name: 'Admin Demo', email: 'admin@majestic-south.com', role: 'admin', createdAt: new Date(), lastSignedIn: new Date(), loginMethod: null } as any;
    }
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) return DEMO_CLIENTS as any[];
  return await db.select().from(clients);
}

export async function getAllChauffeurs() {
  const db = await getDb();
  if (!db) return DEMO_CHAUFFEURS as any[];
  return await db.select().from(chauffeurs);
}

export async function getAllVehicles() {
  const db = await getDb();
  if (!db) return DEMO_VEHICLES as any[];
  return await db.select().from(vehicles);
}

export async function getAllDemands() {
  const db = await getDb();
  if (!db) return DEMO_DEMANDS as any[];
  return await db.select().from(demands);
}

export async function getAllMissions() {
  const db = await getDb();
  if (!db) return DEMO_MISSIONS as any[];
  return await db.select().from(missions);
}

export async function getAllQuotes() {
  const db = await getDb();
  if (!db) return DEMO_QUOTES as any[];
  return await db.select().from(quotes);
}

export async function getAllAlerts() {
  const db = await getDb();
  if (!db) return DEMO_ALERTS as any[];
  return await db.select().from(alerts);
}

// TODO: add more specific queries as needed

// ==================== CLIENTS CRUD ====================
export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_CLIENTS as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: typeof clients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(clients).values(data);
}

export async function updateClient(id: number, data: Partial<typeof clients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
  return await getClientById(id);
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(clients).where(eq(clients.id, id));
  return { success: true };
}

// ==================== CHAUFFEURS CRUD ====================
export async function getChauffeurById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_CHAUFFEURS as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(chauffeurs).where(eq(chauffeurs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createChauffeur(data: typeof chauffeurs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(chauffeurs).values(data);
}

export async function updateChauffeur(id: number, data: Partial<typeof chauffeurs.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(chauffeurs).set(data).where(eq(chauffeurs.id, id));
  return await getChauffeurById(id);
}

export async function deleteChauffeur(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(chauffeurs).where(eq(chauffeurs.id, id));
  return { success: true };
}

// ==================== VEHICLES CRUD ====================
export async function getVehicleById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_VEHICLES as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVehicle(data: typeof vehicles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(vehicles).values(data);
}

export async function updateVehicle(id: number, data: Partial<typeof vehicles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vehicles).set(data).where(eq(vehicles.id, id));
  return await getVehicleById(id);
}

export async function deleteVehicle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vehicles).where(eq(vehicles.id, id));
  return { success: true };
}

// ==================== DEMANDS CRUD ====================
export async function getDemandById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_DEMANDS as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(demands).where(eq(demands.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDemand(data: typeof demands.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(demands).values(data);
}

export async function updateDemand(id: number, data: Partial<typeof demands.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(demands).set(data).where(eq(demands.id, id));
  return await getDemandById(id);
}

export async function deleteDemand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(demands).where(eq(demands.id, id));
  return { success: true };
}

// ==================== MISSIONS CRUD ====================
export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_MISSIONS as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMission(data: typeof missions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(missions).values(data);
}

export async function updateMission(id: number, data: Partial<typeof missions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(missions).set(data).where(eq(missions.id, id));
  return await getMissionById(id);
}

export async function deleteMission(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(missions).where(eq(missions.id, id));
  return { success: true };
}

// ==================== QUOTES CRUD ====================
export async function getQuoteById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_QUOTES as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuote(data: typeof quotes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(quotes).values(data);
}

export async function updateQuote(id: number, data: Partial<typeof quotes.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set(data).where(eq(quotes.id, id));
  return await getQuoteById(id);
}

export async function deleteQuote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(quotes).where(eq(quotes.id, id));
  return { success: true };
}

// ==================== ALERTS CRUD ====================
export async function getAlertById(id: number) {
  const db = await getDb();
  if (!db) return (DEMO_ALERTS as any[]).find(x => x.id === id) ?? undefined;
  const result = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAlert(data: typeof alerts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(alerts).values(data);
}

export async function updateAlert(id: number, data: Partial<typeof alerts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alerts).set(data).where(eq(alerts.id, id));
  return await getAlertById(id);
}

export async function deleteAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(alerts).where(eq(alerts.id, id));
  return { success: true };
}
