import { describe, it, expect, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock the database module
vi.mock('./db', () => ({
  getAllClients: vi.fn(async () => []),
  getAllChauffeurs: vi.fn(async () => []),
  getAllVehicles: vi.fn(async () => []),
  getAllDemands: vi.fn(async () => []),
  getAllMissions: vi.fn(async () => []),
  getAllQuotes: vi.fn(async () => []),
  getAllAlerts: vi.fn(async () => []),
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'manus',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Dashboard Stats', () => {
  it('should return dashboard statistics', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.getStats();

    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('totalMissions');
    expect(stats).toHaveProperty('todayMissions');
    expect(stats).toHaveProperty('newDemands');
    expect(stats).toHaveProperty('pendingQuotes');
    expect(stats).toHaveProperty('availableChauffeurs');
    expect(stats).toHaveProperty('availableVehicles');
    expect(stats).toHaveProperty('urgentAlerts');
  });

  it('should have numeric values for all stats', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.getStats();

    expect(typeof stats.totalMissions).toBe('number');
    expect(typeof stats.todayMissions).toBe('number');
    expect(typeof stats.newDemands).toBe('number');
    expect(typeof stats.pendingQuotes).toBe('number');
    expect(typeof stats.availableChauffeurs).toBe('number');
    expect(typeof stats.availableVehicles).toBe('number');
    expect(typeof stats.urgentAlerts).toBe('number');
  });

  it('should have non-negative values', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.dashboard.getStats();

    expect(stats.totalMissions).toBeGreaterThanOrEqual(0);
    expect(stats.todayMissions).toBeGreaterThanOrEqual(0);
    expect(stats.newDemands).toBeGreaterThanOrEqual(0);
    expect(stats.pendingQuotes).toBeGreaterThanOrEqual(0);
    expect(stats.availableChauffeurs).toBeGreaterThanOrEqual(0);
    expect(stats.availableVehicles).toBeGreaterThanOrEqual(0);
    expect(stats.urgentAlerts).toBeGreaterThanOrEqual(0);
  });
});

describe('Data Retrieval', () => {
  it('should handle data retrieval gracefully', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // These should all return arrays without errors
    expect(await caller.clients.list()).toBeDefined();
    expect(await caller.chauffeurs.list()).toBeDefined();
    expect(await caller.vehicles.list()).toBeDefined();
    expect(await caller.missions.list()).toBeDefined();
    expect(await caller.demands.list()).toBeDefined();
    expect(await caller.quotes.list()).toBeDefined();
    expect(await caller.alerts.list()).toBeDefined();
  });
});

describe('Authentication', () => {
  it('should return current user', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
    expect(user?.role).toBe('admin');
  });

  it('should handle logout', async () => {
    const ctx = createAuthContext();
    const logoutCalls: Array<{ name: string; options: Record<string, unknown> }> = [];

    ctx.res.clearCookie = (name: string, options: Record<string, unknown>) => {
      logoutCalls.push({ name, options });
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
    expect(logoutCalls).toHaveLength(1);
  });
});
