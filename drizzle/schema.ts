import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "gestionnaire", "chauffeur", "client"]).default("user").notNull(),
  language: mysqlEnum("language", ["fr", "en"]).default("fr").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Clients table
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  company: varchar("company", { length: 255 }),
  type: mysqlEnum("type", ["particulier", "business", "hotel", "agence", "partenaire", "vip"]).default("particulier"),
  address: text("address"),
  preferences: text("preferences"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Chauffeurs table
export const chauffeurs = mysqlTable("chauffeurs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  languages: varchar("languages", { length: 255 }),
  zones: text("zones"),
  status: mysqlEnum("status", ["disponible", "occupe", "indisponible", "conge", "suspendu"]).default("disponible"),
  type: mysqlEnum("type", ["interne", "partenaire"]).default("interne"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chauffeur = typeof chauffeurs.$inferSelect;
export type InsertChauffeur = typeof chauffeurs.$inferInsert;

// Vehicles table
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  brand: varchar("brand", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  registration: varchar("registration", { length: 20 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  seats: int("seats").default(4),
  luggage: int("luggage").default(3),
  color: varchar("color", { length: 100 }),
  year: int("year"),
  mileage: int("mileage"),
  status: mysqlEnum("status", ["disponible", "reserve", "en_mission", "entretien", "indisponible", "hors_service"]).default("disponible"),
  nextMaintenance: timestamp("nextMaintenance"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// Demands table
export const demands = mysqlTable("demands", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  passengers: int("passengers").default(1),
  luggage: int("luggage").default(0),
  vehicleType: varchar("vehicleType", { length: 100 }),
  message: text("message"),
  status: mysqlEnum("status", ["nouvelle", "a_traiter", "devis_envoye", "en_attente", "convertie", "refusee", "annulee"]).default("nouvelle"),
  priority: mysqlEnum("priority", ["basse", "normale", "haute", "urgente"]).default("normale"),
  source: varchar("source", { length: 100 }).default("site"),
  assignedTo: int("assignedTo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Demand = typeof demands.$inferSelect;
export type InsertDemand = typeof demands.$inferInsert;

// Quotes table
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  demandId: int("demandId").notNull(),
  number: varchar("number", { length: 50 }).notNull().unique(),
  price: int("price").notNull(),
  priceHT: int("priceHT").notNull(),
  vatRate: int("vatRate").default(20),
  status: mysqlEnum("status", ["brouillon", "envoye", "consulte", "accepte", "refuse", "expire"]).default("brouillon"),
  validUntil: timestamp("validUntil"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

// Missions table
export const missions = mysqlTable("missions", {
  id: int("id").autoincrement().primaryKey(),
  number: varchar("number", { length: 50 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  chauffeurId: int("chauffeurId"),
  vehicleId: int("vehicleId"),
  quoteId: int("quoteId"),
  type: varchar("type", { length: 100 }).notNull(),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  passengers: int("passengers").default(1),
  luggage: int("luggage").default(0),
  price: int("price"),
  priceHT: int("priceHT"),
  vatRate: int("vatRate").default(20),
  paymentStatus: mysqlEnum("paymentStatus", ["non_paye", "paye", "remboursement"]).default("non_paye"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  status: mysqlEnum("status", ["a_confirmer", "confirmee", "en_preparation", "chauffeur_assigne", "vehicule_assigne", "prete", "en_cours", "client_pris_en_charge", "terminee", "annulee", "litige"]).default("a_confirmer"),
  notes: text("notes"),
  specialInstructions: text("specialInstructions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

// Alerts table
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  priority: mysqlEnum("priority", ["basse", "normale", "haute", "urgente"]).default("normale"),
  relatedEntity: varchar("relatedEntity", { length: 100 }),
  relatedId: int("relatedId"),
  status: mysqlEnum("status", ["active", "lue", "resolue"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;