/**
 * Système d'authentification local email/mot de passe
 * Majestic South Chauffeurs
 * 
 * Ce module gère :
 * - La création de comptes (register)
 * - La connexion (login) avec email + mot de passe hashé bcrypt
 * - La gestion des sessions via JWT (jose)
 * - Les rôles : admin, gestionnaire, chauffeur, client
 * - Le compte admin principal pré-configuré
 */

import * as bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

// ============================================================
// TYPES
// ============================================================

export type UserRole = "admin" | "gestionnaire" | "chauffeur" | "client";

export interface AppUser {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastSignedIn?: Date | null;
  invitedBy?: number | null;
}

interface StoredUser extends AppUser {
  passwordHash: string;
}

// ============================================================
// STOCKAGE EN MÉMOIRE (fallback sans BDD)
// Remplacé par MySQL en production
// ============================================================

let nextId = 2;

// Compte admin principal pré-configuré
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("Marseille13010+", 10);

const inMemoryUsers: StoredUser[] = [
  {
    id: 1,
    email: "contact@mschauffeur.fr",
    name: "Majestic South Chauffeurs",
    phone: "+33 6 95 61 89 98",
    role: "admin",
    isActive: true,
    passwordHash: ADMIN_PASSWORD_HASH,
    createdAt: new Date("2024-01-01"),
    lastSignedIn: null,
    invitedBy: null,
  },
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function getJwtSecret(): Uint8Array {
  const secret = ENV.cookieSecret || "majestic-south-secret-key-2024";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createJWT(userId: number, email: string, role: UserRole): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<{ userId: number; email: string; role: UserRole } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

// ============================================================
// OPÉRATIONS UTILISATEURS
// ============================================================

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();
  return inMemoryUsers.find(u => u.email.toLowerCase() === normalized) || null;
}

export async function findUserById(id: number): Promise<AppUser | null> {
  const user = inMemoryUsers.find(u => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function getAllUsers(): Promise<AppUser[]> {
  return inMemoryUsers.map(({ passwordHash, ...u }) => u);
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  invitedBy?: number;
}): Promise<AppUser> {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new Error("Un compte avec cet email existe déjà");
  }

  const passwordHash = await hashPassword(data.password);
  const newUser: StoredUser = {
    id: nextId++,
    email: data.email.toLowerCase().trim(),
    name: data.name,
    phone: data.phone || null,
    role: data.role || "gestionnaire",
    isActive: true,
    passwordHash,
    createdAt: new Date(),
    lastSignedIn: null,
    invitedBy: data.invitedBy || null,
  };

  inMemoryUsers.push(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

export async function updateUser(id: number, data: Partial<{
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}>): Promise<AppUser | null> {
  const idx = inMemoryUsers.findIndex(u => u.id === id);
  if (idx === -1) return null;

  if (data.name !== undefined) inMemoryUsers[idx].name = data.name;
  if (data.phone !== undefined) inMemoryUsers[idx].phone = data.phone;
  if (data.role !== undefined) inMemoryUsers[idx].role = data.role;
  if (data.isActive !== undefined) inMemoryUsers[idx].isActive = data.isActive;
  if (data.password !== undefined) {
    inMemoryUsers[idx].passwordHash = await hashPassword(data.password);
  }

  const { passwordHash, ...safeUser } = inMemoryUsers[idx];
  return safeUser;
}

export async function deleteUser(id: number): Promise<boolean> {
  // Ne pas supprimer le compte admin principal (id=1)
  if (id === 1) throw new Error("Impossible de supprimer le compte administrateur principal");
  const idx = inMemoryUsers.findIndex(u => u.id === id);
  if (idx === -1) return false;
  inMemoryUsers.splice(idx, 1);
  return true;
}

export async function loginUser(email: string, password: string): Promise<{ user: AppUser; token: string } | null> {
  const stored = await findUserByEmail(email);
  if (!stored) return null;
  if (!stored.isActive) throw new Error("Ce compte est désactivé");

  const valid = await verifyPassword(password, stored.passwordHash);
  if (!valid) return null;

  // Mettre à jour la dernière connexion
  const idx = inMemoryUsers.findIndex(u => u.id === stored.id);
  if (idx !== -1) inMemoryUsers[idx].lastSignedIn = new Date();

  const token = await createJWT(stored.id, stored.email, stored.role);
  const { passwordHash, ...safeUser } = stored;
  safeUser.lastSignedIn = new Date();
  return { user: safeUser, token };
}

export async function getUserFromToken(token: string): Promise<AppUser | null> {
  const payload = await verifyJWT(token);
  if (!payload) return null;
  return findUserById(payload.userId);
}
