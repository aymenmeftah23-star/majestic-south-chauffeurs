import { z } from "zod";
import { sendBookingEmails, sendUrgencyAlert, testSmtpConnection } from './email-service';
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, publicProcedure } from "./_core/trpc";
import {
  getAllClients, getClientById, createClient, updateClient, deleteClient,
  getAllChauffeurs, getChauffeurById, createChauffeur, updateChauffeur, deleteChauffeur,
  getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
  getAllDemands, getDemandById, createDemand, updateDemand, deleteDemand,
  getAllMissions, getMissionById, createMission, updateMission, deleteMission,
  getAllQuotes, getQuoteById, createQuote, updateQuote, deleteQuote,
  getAllAlerts, getAlertById, createAlert, updateAlert, deleteAlert,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(async opts => {
      // Si utilisateur authentifié, le retourner
      if (opts.ctx.user) return opts.ctx.user;
      // Mode démo : retourner un utilisateur fictif si pas de session
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        return {
          id: 1,
          openId: 'demo-admin-001',
          name: 'Aymen MEFTAH',
          email: 'contact@mschauffeur.fr',
          role: 'admin',
          createdAt: new Date(),
          lastSignedIn: new Date(),
          loginMethod: null,
        };
      }
      return null;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dashboard: router({
    getStats: publicProcedure.query(async () => {
      const missions = await getAllMissions();
      const demands = await getAllDemands();
      const quotes = await getAllQuotes();
      const chauffeurs = await getAllChauffeurs();
      const vehicles = await getAllVehicles();
      const alerts = await getAllAlerts();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayMissions = missions.filter(m => {
        const d = new Date(m.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      return {
        totalMissions: missions.length,
        todayMissions: todayMissions.length,
        newDemands: demands.filter(d => d.status === 'nouvelle').length,
        pendingQuotes: quotes.filter(q => q.status === 'brouillon').length,
        availableChauffeurs: chauffeurs.filter(c => c.status === 'disponible').length,
        availableVehicles: vehicles.filter(v => v.status === 'disponible').length,
        urgentAlerts: alerts.filter(a => a.priority === 'urgente' && a.status === 'active').length,
      };
    }),
  }),

  clients: router({
    getAll: publicProcedure.query(async () => {
      const [clientsList, missionsList] = await Promise.all([getAllClients(), getAllMissions()]);
      return clientsList.map((c: any) => ({
        ...c,
        missionsCount: missionsList.filter((m: any) => m.clientId === c.id).length,
      }));
    }),
    list: publicProcedure.query(async () => {
      const [clientsList, missionsList] = await Promise.all([getAllClients(), getAllMissions()]);
      return clientsList.map((c: any) => ({
        ...c,
        missionsCount: missionsList.filter((m: any) => m.clientId === c.id).length,
      }));
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getClientById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().min(1),
        company: z.string().optional(),
        type: z.enum(['particulier', 'business', 'hotel', 'agence', 'partenaire', 'vip']).optional(),
        address: z.string().optional(),
        preferences: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => await createClient(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        type: z.enum(['particulier', 'business', 'hotel', 'agence', 'partenaire', 'vip']).optional(),
        address: z.string().optional(),
        preferences: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateClient(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteClient(input.id)),
  }),

  chauffeurs: router({
    getAll: publicProcedure.query(async () => await getAllChauffeurs()),
    list: publicProcedure.query(async () => await getAllChauffeurs()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getChauffeurById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().min(1),
        languages: z.string().optional(),
        zones: z.string().optional(),
        status: z.enum(['disponible', 'occupe', 'indisponible', 'conge', 'suspendu']).optional(),
        type: z.enum(['interne', 'partenaire']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => await createChauffeur(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        languages: z.string().optional(),
        zones: z.string().optional(),
        status: z.enum(['disponible', 'occupe', 'indisponible', 'conge', 'suspendu']).optional(),
        type: z.enum(['interne', 'partenaire']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateChauffeur(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteChauffeur(input.id)),
  }),

  vehicles: router({
    getAll: publicProcedure.query(async () => await getAllVehicles()),
    list: publicProcedure.query(async () => await getAllVehicles()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getVehicleById(input.id)),
    create: publicProcedure
      .input(z.object({
        brand: z.string().min(1),
        model: z.string().min(1),
        registration: z.string().min(1),
        category: z.string().min(1),
        seats: z.number().optional(),
        luggage: z.number().optional(),
        color: z.string().optional(),
        year: z.number().optional(),
        mileage: z.number().optional(),
        status: z.enum(['disponible', 'reserve', 'en_mission', 'entretien', 'indisponible', 'hors_service']).optional(),
        nextMaintenance: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { nextMaintenance, ...rest } = input;
        return await createVehicle({
          ...rest,
          nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
        });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        brand: z.string().optional(),
        model: z.string().optional(),
        registration: z.string().optional(),
        category: z.string().optional(),
        seats: z.number().optional(),
        luggage: z.number().optional(),
        color: z.string().optional(),
        year: z.number().optional(),
        mileage: z.number().optional(),
        status: z.enum(['disponible', 'reserve', 'en_mission', 'entretien', 'indisponible', 'hors_service']).optional(),
        nextMaintenance: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, nextMaintenance, ...rest } = input;
        return await updateVehicle(id, {
          ...rest,
          nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteVehicle(input.id)),
  }),

  demands: router({
    getAll: publicProcedure.query(async () => await getAllDemands()),
    list: publicProcedure.query(async () => await getAllDemands()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getDemandById(input.id)),
    create: publicProcedure
      .input(z.object({
        clientId: z.number(),
        type: z.string().min(1),
        origin: z.string().min(1),
        destination: z.string().min(1),
        date: z.string(),
        passengers: z.number().optional(),
        luggage: z.number().optional(),
        vehicleType: z.string().optional(),
        message: z.string().optional(),
        status: z.enum(['nouvelle', 'a_traiter', 'devis_envoye', 'en_attente', 'convertie', 'refusee', 'annulee']).optional(),
        priority: z.enum(['basse', 'normale', 'haute', 'urgente']).optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { date, ...rest } = input;
        return await createDemand({ ...rest, date: new Date(date) });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        type: z.string().optional(),
        origin: z.string().optional(),
        destination: z.string().optional(),
        date: z.string().optional(),
        passengers: z.number().optional(),
        luggage: z.number().optional(),
        vehicleType: z.string().optional(),
        message: z.string().optional(),
        status: z.enum(['nouvelle', 'a_traiter', 'devis_envoye', 'en_attente', 'convertie', 'refusee', 'annulee']).optional(),
        priority: z.enum(['basse', 'normale', 'haute', 'urgente']).optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, date, ...rest } = input;
        return await updateDemand(id, {
          ...rest,
          date: date ? new Date(date) : undefined,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteDemand(input.id)),
  }),

  missions: router({
    getAll: publicProcedure.query(async () => {
      const [missionsList, clientsList, chauffeursList, vehiclesList] = await Promise.all([
        getAllMissions(), getAllClients(), getAllChauffeurs(), getAllVehicles(),
      ]);
      return missionsList.map((m: any) => {
        const client = clientsList.find((c: any) => c.id === m.clientId);
        const chauffeur = chauffeursList.find((c: any) => c.id === m.chauffeurId);
        const vehicle = vehiclesList.find((v: any) => v.id === m.vehicleId);
        return {
          ...m,
          clientName: client?.name ?? null,
          chauffeurName: chauffeur?.name ?? null,
          vehicleName: vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() : null,
          vehiclePlate: vehicle?.licensePlate ?? vehicle?.registration ?? null,
        };
      });
    }),
    list: publicProcedure.query(async () => {
      const [missionsList, clientsList, chauffeursList, vehiclesList] = await Promise.all([
        getAllMissions(), getAllClients(), getAllChauffeurs(), getAllVehicles(),
      ]);
      return missionsList.map((m: any) => {
        const client = clientsList.find((c: any) => c.id === m.clientId);
        const chauffeur = chauffeursList.find((c: any) => c.id === m.chauffeurId);
        const vehicle = vehiclesList.find((v: any) => v.id === m.vehicleId);
        return {
          ...m,
          clientName: client?.name ?? null,
          chauffeurName: chauffeur?.name ?? null,
          vehicleName: vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() : null,
          vehiclePlate: vehicle?.licensePlate ?? vehicle?.registration ?? null,
        };
      });
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const [mission, clientsList, chauffeursList, vehiclesList] = await Promise.all([
          getMissionById(input.id), getAllClients(), getAllChauffeurs(), getAllVehicles(),
        ]);
        if (!mission) return null;
        const client = clientsList.find((c: any) => c.id === (mission as any).clientId);
        const chauffeur = chauffeursList.find((c: any) => c.id === (mission as any).chauffeurId);
        const vehicle = vehiclesList.find((v: any) => v.id === (mission as any).vehicleId);
        return {
          ...mission,
          clientName: client?.name ?? null,
          chauffeurName: chauffeur?.name ?? null,
          vehicleName: vehicle ? `${(vehicle as any).brand ?? ''} ${(vehicle as any).model ?? ''}`.trim() : null,
          vehiclePlate: (vehicle as any)?.licensePlate ?? (vehicle as any)?.registration ?? null,
        };
      }),
    create: publicProcedure
      .input(z.object({
        number: z.string().optional(),
        clientId: z.number(),
        chauffeurId: z.number().optional(),
        vehicleId: z.number().optional(),
        quoteId: z.number().optional(),
        type: z.string().min(1),
        origin: z.string().min(1),
        destination: z.string().min(1),
        date: z.string(),
        passengers: z.number().optional(),
        luggage: z.number().optional(),
        price: z.number().optional(),
        priceHT: z.number().optional(),
        vatRate: z.number().optional(),
        paymentStatus: z.enum(['non_paye', 'paye', 'remboursement']).optional(),
        paymentMethod: z.string().optional(),
        status: z.enum(['a_confirmer', 'confirmee', 'en_preparation', 'chauffeur_assigne', 'vehicule_assigne', 'prete', 'en_cours', 'client_pris_en_charge', 'terminee', 'annulee', 'litige']).optional().default('a_confirmer'),
        notes: z.string().optional(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { date, ...rest } = input;
        return await createMission({ ...rest, date: new Date(date) });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().optional(),
        chauffeurId: z.number().optional(),
        vehicleId: z.number().optional(),
        type: z.string().optional(),
        origin: z.string().optional(),
        destination: z.string().optional(),
        date: z.string().optional(),
        passengers: z.number().optional(),
        luggage: z.number().optional(),
        price: z.number().optional(),
        priceHT: z.number().optional(),
        vatRate: z.number().optional(),
        paymentStatus: z.enum(['non_paye', 'paye', 'remboursement']).optional(),
        paymentMethod: z.string().optional(),
        status: z.enum(['a_confirmer', 'confirmee', 'en_preparation', 'chauffeur_assigne', 'vehicule_assigne', 'prete', 'en_cours', 'client_pris_en_charge', 'terminee', 'annulee', 'litige']).optional(),
        notes: z.string().optional(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, date, ...rest } = input;
        return await updateMission(id, {
          ...rest,
          date: date ? new Date(date) : undefined,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteMission(input.id)),
  }),

  quotes: router({
    getAll: publicProcedure.query(async () => await getAllQuotes()),
    list: publicProcedure.query(async () => await getAllQuotes()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getQuoteById(input.id)),
    create: publicProcedure
      .input(z.object({
        demandId: z.number(),
        number: z.string().min(1),
        price: z.number(),
        priceHT: z.number(),
        vatRate: z.number().optional(),
        status: z.enum(['brouillon', 'envoye', 'consulte', 'accepte', 'refuse', 'expire']).optional(),
        validUntil: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { validUntil, ...rest } = input;
        return await createQuote({
          ...rest,
          validUntil: validUntil ? new Date(validUntil) : undefined,
        });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        price: z.number().optional(),
        priceHT: z.number().optional(),
        vatRate: z.number().optional(),
        status: z.enum(['brouillon', 'envoye', 'consulte', 'accepte', 'refuse', 'expire']).optional(),
        validUntil: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, validUntil, ...rest } = input;
        return await updateQuote(id, {
          ...rest,
          validUntil: validUntil ? new Date(validUntil) : undefined,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteQuote(input.id)),
    convertToMission: publicProcedure
      .input(z.object({
        quoteId: z.number(),
        chauffeurId: z.number().optional(),
        vehicleId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const quote = await getQuoteById(input.quoteId);
        if (!quote) throw new Error("Quote not found");
        const demand = await getDemandById(quote.demandId);
        if (!demand) throw new Error("Demand not found");
        const missionNumber = `MSN-${Date.now()}`;
        await createMission({
          number: missionNumber,
          clientId: demand.clientId,
          quoteId: input.quoteId,
          chauffeurId: input.chauffeurId,
          vehicleId: input.vehicleId,
          type: demand.type,
          origin: demand.origin,
          destination: demand.destination,
          date: demand.date,
          passengers: demand.passengers ?? 1,
          luggage: demand.luggage ?? 0,
          price: quote.price,
          priceHT: quote.priceHT,
          status: 'a_confirmer',
        });
        await updateQuote(input.quoteId, { status: 'accepte' });
        await updateDemand(demand.id, { status: 'convertie' });
        return { success: true, missionNumber };
      }),
  }),

  alerts: router({
    getAll: publicProcedure.query(async () => await getAllAlerts()),
    list: publicProcedure.query(async () => await getAllAlerts()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getAlertById(input.id)),
    create: publicProcedure
      .input(z.object({
        type: z.string().min(1),
        title: z.string().min(1),
        message: z.string().optional(),
        priority: z.enum(['basse', 'normale', 'haute', 'urgente']).optional(),
        relatedEntity: z.string().optional(),
        relatedId: z.number().optional(),
        status: z.enum(['active', 'lue', 'resolue']).optional(),
      }))
      .mutation(async ({ input }) => await createAlert(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['active', 'lue', 'resolue']).optional(),
        priority: z.enum(['basse', 'normale', 'haute', 'urgente']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateAlert(id, data);
      }),
    resolve: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await updateAlert(input.id, { status: 'resolue' })),
    dismiss: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await updateAlert(input.id, { status: 'lue' })),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteAlert(input.id)),
  }),

  search: router({
    global: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        const { query } = input;
        const q = query.toLowerCase();
        const [missions, clients, chauffeurs, demands, quotes] = await Promise.all([
          getAllMissions(),
          getAllClients(),
          getAllChauffeurs(),
          getAllDemands(),
          getAllQuotes(),
        ]);
        return {
          missions: missions.filter(m =>
            (m.origin || '').toLowerCase().includes(q) ||
            (m.destination || '').toLowerCase().includes(q) ||
            (m.status || '').toLowerCase().includes(q)
          ).slice(0, 5),
          clients: clients.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.company || '').toLowerCase().includes(q)
          ).slice(0, 5),
          chauffeurs: chauffeurs.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
          ).slice(0, 5),
          demands: demands.filter(d =>
            (d.origin || '').toLowerCase().includes(q) ||
            (d.destination || '').toLowerCase().includes(q)
          ).slice(0, 5),
          quotes: quotes.filter(q2 =>
            (q2.status || '').toLowerCase().includes(q)
          ).slice(0, 5),
        };
      }),
  }),

  history: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const missions = await getAllMissions();
        let filtered = missions;
        if (input.status) {
          filtered = missions.filter(m => m.status === input.status);
        }
        return filtered
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, input.limit);
      }),
  }),

  invoices: router({
    list: publicProcedure.query(async () => {
      const missions = await getAllMissions();
      return missions
        .filter(m => m.status === 'terminee' || m.status === 'en_cours')
        .map(m => ({
          id: m.id,
          missionId: m.id,
          number: `FAC-${String(m.id).padStart(4, '0')}`,
          origin: m.origin,
          destination: m.destination,
          date: m.date,
          amount: m.price || 0,
          priceHT: m.priceHT || 0,
          vatRate: (m as any).vatRate || 20,
          status: (m as any).paymentStatus === 'paye' ? 'payee' : 'en_attente',
          clientId: m.clientId,
        }));
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const mission = await getMissionById(input.id);
        if (!mission) return null;
        return {
          id: mission.id,
          missionId: mission.id,
          number: `FAC-${String(mission.id).padStart(4, '0')}`,
          origin: mission.origin,
          destination: mission.destination,
          date: mission.date,
          amount: mission.price || 0,
          priceHT: mission.priceHT || 0,
          vatRate: (mission as any).vatRate || 20,
          status: (mission as any).paymentStatus === 'paye' ? 'payee' : 'en_attente',
          clientId: mission.clientId,
        };
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['en_attente', 'payee', 'en_retard', 'annulee']),
      }))
      .mutation(async ({ input }) => {
        const paymentStatus = input.status === 'payee' ? 'paye' : 'non_paye';
        return await updateMission(input.id, { paymentStatus: paymentStatus as any });
      }),
  }),

  payments: router({
    list: publicProcedure.query(async () => {
      const missions = await getAllMissions();
      return missions
        .filter(m => m.status === 'terminee' && m.price)
        .map(m => ({
          id: m.id,
          missionId: m.id,
          reference: `PAY-${String(m.id).padStart(4, '0')}`,
          origin: m.origin,
          destination: m.destination,
          date: m.date,
          amount: m.price || 0,
          method: 'virement',
          status: 'recu',
          clientId: m.clientId,
        }));
    }),
    stats: publicProcedure.query(async () => {
      const missions = await getAllMissions();
      const completed = missions.filter(m => m.status === 'terminee');
      const totalRevenue = completed.reduce((sum, m) => sum + (m.price || 0), 0);
      const pending = missions.filter(m => m.status === 'en_cours');
      const pendingRevenue = pending.reduce((sum, m) => sum + (m.price || 0), 0);
      return {
        totalRevenue,
        pendingRevenue,
        completedCount: completed.length,
        pendingCount: pending.length,
      };
    }),
  }),
  reviews: router({
    list: publicProcedure.query(async () => {
      const missions = await getAllMissions();
      const clients = await getAllClients();
      const DEMO_REVIEWS = [
        { id: 1, missionId: 1, clientId: 1, rating: 5, comment: 'Service impeccable, chauffeur ponctuel et professionnel. Je recommande vivement.', createdAt: new Date('2026-03-23') },
        { id: 2, missionId: 2, clientId: 2, rating: 5, comment: 'Excellente prestation pour notre soirée gala. Discrétion et élégance au rendez-vous.', createdAt: new Date('2026-03-22') },
        { id: 3, missionId: 4, clientId: 1, rating: 4, comment: 'Très bon service, véhicule impeccable. Légèrement en retard mais très professionnel.', createdAt: new Date('2026-03-21') },
        { id: 4, missionId: 5, clientId: 2, rating: 5, comment: 'Parfait comme toujours. Chauffeur souriant et efficace.', createdAt: new Date('2026-03-20') },
      ];
      return DEMO_REVIEWS.map(r => ({
        ...r,
        clientName: clients.find(c => c.id === r.clientId)?.name || 'Client',
        missionNumber: missions.find(m => m.id === r.missionId)?.number || `MSN-${r.missionId}`,
      }));
    }),
    create: publicProcedure
      .input(z.object({
        missionId: z.number(),
        clientId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input }) => ({ id: Date.now(), ...input, createdAt: new Date() })),
  }),
  promoCodes: router({
    list: publicProcedure.query(async () => [
      { id: 1, code: 'BIENVENUE20', type: 'pourcentage', value: 20, minAmount: 100, maxUses: 50, usedCount: 12, active: true, expiresAt: new Date('2026-12-31'), description: 'Réduction bienvenue pour nouveaux clients' },
      { id: 2, code: 'VIP50', type: 'montant', value: 50, minAmount: 300, maxUses: 20, usedCount: 8, active: true, expiresAt: new Date('2026-06-30'), description: 'Réduction VIP clients fidèles' },
      { id: 3, code: 'NOEL2025', type: 'pourcentage', value: 15, minAmount: 150, maxUses: 100, usedCount: 100, active: false, expiresAt: new Date('2026-01-05'), description: 'Promotion Noël 2025 - Expirée' },
      { id: 4, code: 'AEROPORT10', type: 'pourcentage', value: 10, minAmount: 80, maxUses: 200, usedCount: 45, active: true, expiresAt: new Date('2026-09-30'), description: 'Réduction transferts aéroport' },
    ]),
    create: publicProcedure
      .input(z.object({
        code: z.string().min(3),
        type: z.enum(['pourcentage', 'montant']),
        value: z.number().positive(),
        minAmount: z.number().optional(),
        maxUses: z.number().optional(),
        active: z.boolean().optional(),
        expiresAt: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => ({ id: Date.now(), ...input, usedCount: 0, createdAt: new Date() })),
    toggle: publicProcedure
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ input }) => ({ success: true })),
  }),
  bonuses: router({
    list: publicProcedure.query(async () => {
      const chauffeurs = await getAllChauffeurs();
      return [
        { id: 1, chauffeurId: 1, chauffeurName: chauffeurs.find(c => c.id === 1)?.name || 'Ahmed Benali', type: 'performance', amount: 150, month: '2026-02', description: 'Bonus performance — 98% ponctualité', status: 'verse', createdAt: new Date('2026-03-01') },
        { id: 2, chauffeurId: 2, chauffeurName: chauffeurs.find(c => c.id === 2)?.name || 'Pierre Moreau', type: 'avis', amount: 75, month: '2026-02', description: 'Bonus avis clients — 5 étoiles consécutives', status: 'verse', createdAt: new Date('2026-03-01') },
        { id: 3, chauffeurId: 3, chauffeurName: chauffeurs.find(c => c.id === 3)?.name || 'Karim Ouali', type: 'missions', amount: 100, month: '2026-02', description: 'Bonus volume — 25 missions réalisées', status: 'verse', createdAt: new Date('2026-03-01') },
        { id: 4, chauffeurId: 1, chauffeurName: chauffeurs.find(c => c.id === 1)?.name || 'Ahmed Benali', type: 'performance', amount: 200, month: '2026-03', description: 'Bonus performance — Meilleur chauffeur du mois', status: 'en_attente', createdAt: new Date('2026-03-20') },
      ];
    }),
    create: publicProcedure
      .input(z.object({
        chauffeurId: z.number(),
        type: z.enum(['performance', 'avis', 'missions', 'special']),
        amount: z.number().positive(),
        month: z.string(),
        description: z.string().optional(),
        status: z.enum(['en_attente', 'verse', 'annule']).optional(),
      }))
      .mutation(async ({ input }) => {
        const chauffeurs = await getAllChauffeurs();
        return { id: Date.now(), ...input, chauffeurName: chauffeurs.find(c => c.id === input.chauffeurId)?.name || 'Chauffeur', createdAt: new Date() };
      }),
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(['en_attente', 'verse', 'annule']) }))
      .mutation(async ({ input }) => ({ success: true })),
  }),
  chat: router({
    list: publicProcedure.query(async () => {
      const chauffeurs = await getAllChauffeurs();
      return chauffeurs.map((c, i) => ({
        id: c.id,
        chauffeurId: c.id,
        chauffeurName: c.name,
        status: c.status,
        lastMessage: i === 0 ? 'Je suis arrivé à destination, client pris en charge.' : i === 1 ? 'Retard de 10 min sur A1, prévenir le client.' : 'Mission terminée, retour base.',
        lastMessageAt: new Date(Date.now() - i * 3600000),
        unread: i === 1 ? 1 : 0,
      }));
    }),
    messages: publicProcedure
      .input(z.object({ chauffeurId: z.number() }))
      .query(async ({ input }) => [
        { id: 1, from: 'chauffeur', text: 'Bonjour, je prends le service.', time: new Date(Date.now() - 7200000) },
        { id: 2, from: 'admin', text: 'Bonjour, mission MSN-2026-001 confirmée. Client à CDG T2 à 8h30.', time: new Date(Date.now() - 7000000) },
        { id: 3, from: 'chauffeur', text: 'Reçu. Je suis en route.', time: new Date(Date.now() - 6800000) },
        { id: 4, from: 'chauffeur', text: 'Je suis arrivé à destination, client pris en charge.', time: new Date(Date.now() - 3600000) },
      ]),
    send: publicProcedure
      .input(z.object({ chauffeurId: z.number(), text: z.string().min(1) }))
      .mutation(async ({ input }) => ({ id: Date.now(), from: 'admin', text: input.text, time: new Date() })),
  }),

  booking: router({
    submit: publicProcedure
      .input(z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().email(),
        clientPhone: z.string().min(6),
        serviceType: z.string(),
        origin: z.string().min(1),
        destination: z.string().min(1),
        date: z.string(),
        time: z.string(),
        passengers: z.number().int().min(1),
        luggage: z.number().int().min(0),
        flightNumber: z.string().optional(),
        specialRequests: z.string().optional(),
        vehicleCategory: z.string().optional(),
        estimatedPrice: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const refNumber = String(Math.floor(Math.random() * 90000) + 10000);
        // Envoyer les emails (admin + client)
        const emailResult = await sendBookingEmails(input, refNumber);
        // Créer une demande dans le système
        try {
          await createDemand({
            clientId: 1,
            type: input.serviceType,
            origin: input.origin,
            destination: input.destination,
            date: new Date(input.date),
            passengers: input.passengers,
            luggage: input.luggage,
            message: `Réservation en ligne n°${refNumber} — ${input.clientName} (${input.clientPhone} / ${input.clientEmail})${input.flightNumber ? ' — Vol: ' + input.flightNumber : ''}${input.specialRequests ? ' — Notes: ' + input.specialRequests : ''}`,
            vehicleType: input.vehicleCategory,
            status: 'nouvelle',
            priority: 'normale',
            source: 'web',
          });
        } catch (e) {
          console.error('[BOOKING] Erreur création demande:', e);
        }
        return { success: true, refNumber, emailSent: emailResult.success };
      }),
    testEmail: publicProcedure
      .mutation(async () => {
        return await testSmtpConnection();
      }),
    sendAlert: publicProcedure
      .input(z.object({
        type: z.string(),
        title: z.string(),
        message: z.string(),
        details: z.record(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return await sendUrgencyAlert(input as any);
      }),
  }),
});

export type AppRouter = typeof appRouter;
