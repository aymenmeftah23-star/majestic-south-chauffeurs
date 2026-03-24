import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  loginUser, createUser, getAllUsers, findUserById, updateUser, deleteUser, getUserFromToken,
  type UserRole
} from "./auth-local";
import {
  getAllClients, getClientById, createClient, updateClient, deleteClient,
  getAllChauffeurs, getChauffeurById, createChauffeur, updateChauffeur, deleteChauffeur,
  getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
  getAllDemands, getDemandById, createDemand, updateDemand, deleteDemand,
  getAllMissions, getMissionById, createMission, updateMission, deleteMission,
  getAllQuotes, getQuoteById, createQuote, updateQuote, deleteQuote,
  getAllAlerts, getAlertById, createAlert, updateAlert, deleteAlert,
  getAllReviews, getReviewsByMission, getReviewsByChauffeur, createReview, deleteReview,
  getChatMessages, createChatMessage, markChatMessagesRead,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    // Récupérer l'utilisateur courant depuis le cookie JWT local
    me: publicProcedure.query(async opts => {
      // Lire le token JWT depuis le cookie
      const cookieHeader = opts.ctx.req.headers.cookie || '';
      const tokenMatch = cookieHeader.match(/msc_session=([^;]+)/);
      if (tokenMatch) {
        const token = decodeURIComponent(tokenMatch[1]);
        const user = await getUserFromToken(token);
        if (user) return user;
      }
      return null;
    }),

    // Connexion email + mot de passe
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await loginUser(input.email, input.password);
        if (!result) {
          throw new Error('Email ou mot de passe incorrect');
        }
        // Stocker le token dans un cookie sécurisé
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('msc_session', result.token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
          httpOnly: true,
        });
        return { success: true, user: result.user };
      }),

    // Inscription d'un nouveau membre (admin seulement)
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
        name: z.string().min(2),
        phone: z.string().optional(),
        role: z.enum(['admin', 'gestionnaire', 'chauffeur', 'client']).default('gestionnaire'),
      }))
      .mutation(async ({ input, ctx }) => {
        // Vérifier que l'appelant est admin
        const cookieHeader = ctx.req.headers.cookie || '';
        const tokenMatch = cookieHeader.match(/msc_session=([^;]+)/);
        let callerRole: UserRole | null = null;
        if (tokenMatch) {
          const token = decodeURIComponent(tokenMatch[1]);
          const caller = await getUserFromToken(token);
          callerRole = caller?.role || null;
        }
        // Permettre la création du premier compte sans auth (bootstrap)
        const allUsers = await getAllUsers();
        const isBootstrap = allUsers.length === 0;
        if (!isBootstrap && callerRole !== 'admin') {
          throw new Error('Seul un administrateur peut créer des comptes');
        }
        const user = await createUser(input);
        return { success: true, user };
      }),

    // Déconnexion
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie('msc_session', { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Gestion des membres de l'équipe
  members: router({
    // Lister tous les membres
    getAll: publicProcedure.query(async () => {
      return getAllUsers();
    }),

    // Créer un membre (admin seulement)
    create: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        phone: z.string().optional(),
        role: z.enum(['admin', 'gestionnaire', 'chauffeur', 'client']).default('gestionnaire'),
      }))
      .mutation(async ({ input }) => {
        return createUser(input);
      }),

    // Modifier un membre
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        role: z.enum(['admin', 'gestionnaire', 'chauffeur', 'client']).optional(),
        isActive: z.boolean().optional(),
        password: z.string().min(8).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateUser(id, data);
      }),

    // Supprimer un membre
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteUser(input.id);
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
    getAll: publicProcedure.query(async () => await getAllClients()),
    list: publicProcedure.query(async () => await getAllClients()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => await getClientById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().min(1),
        company: z.string().optional(),
        type: z.enum(['particulier', 'business', 'hotel', 'agence', 'partenaire', 'vip', 'corporate', 'croisiere']).optional(),
        address: z.string().optional(),
        preferences: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => await createClient(input as any)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        type: z.enum(['particulier', 'business', 'hotel', 'agence', 'partenaire', 'vip', 'corporate', 'croisiere']).optional(),
        address: z.string().optional(),
        preferences: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateClient(id, data as any);
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
    getAll: publicProcedure.query(async () => {
      const demands = await getAllDemands();
      const clients = await getAllClients();
      return demands.map((d: any) => ({
        ...d,
        clientName: clients.find((c: any) => c.id === d.clientId)?.name ?? null,
      }));
    }),
    list: publicProcedure.query(async () => {
      const demands = await getAllDemands();
      const clients = await getAllClients();
      return demands.map((d: any) => ({
        ...d,
        clientName: clients.find((c: any) => c.id === d.clientId)?.name ?? null,
      }));
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const d = await getDemandById(input.id);
        if (!d) return null;
        const clients = await getAllClients();
        return { ...d, clientName: clients.find((c: any) => c.id === (d as any).clientId)?.name ?? null };
      }),
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
        const demand = await createDemand({ ...rest, date: new Date(date) });
        
        // Notifications
        try {
          const clients = await getAllClients();
          const client = clients.find((c: any) => c.id === input.clientId);
          
          if (client) {
            // Notification SSE à l'admin
            import('./notification-service').then(({ notifyAdmins }) => {
              notifyAdmins({
                type: 'info',
                title: 'Nouvelle demande',
                message: `Nouvelle demande de ${client.name} (${input.origin} -> ${input.destination})`,
                link: '/demands'
              });
            }).catch(console.error);
            
            // Email à l'admin
            import('./email-service').then(({ sendNewDemandNotification }) => {
              sendNewDemandNotification({
                adminEmail: process.env.ADMIN_EMAIL || 'contact@mschauffeur.fr',
                clientName: client.name,
                origin: input.origin,
                destination: input.destination,
                date: new Date(date),
                passengers: input.passengers || 1,
                message: input.message
              });
            }).catch(console.error);
          }
        } catch (e) {
          console.error("Erreur lors de l'envoi des notifications:", e);
        }
        
        return demand;
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
      const missions = await getAllMissions();
      const clients = await getAllClients();
      const chauffeurs = await getAllChauffeurs();
      const vehicles = await getAllVehicles();
      return missions.map((m: any) => ({
        ...m,
        startDate: m.startDate ?? m.date,
        number: m.number ?? `#${m.id}`,
        clientName: clients.find((c: any) => c.id === m.clientId)?.name ?? null,
        chauffeurName: chauffeurs.find((c: any) => c.id === m.chauffeurId)?.name ?? null,
        vehicleName: vehicles.find((v: any) => v.id === m.vehicleId) ? `${vehicles.find((v: any) => v.id === m.vehicleId)?.brand} ${vehicles.find((v: any) => v.id === m.vehicleId)?.model}` : null,
      }));
    }),
    list: publicProcedure.query(async () => {
      const missions = await getAllMissions();
      const clients = await getAllClients();
      const chauffeurs = await getAllChauffeurs();
      const vehicles = await getAllVehicles();
      return missions.map((m: any) => ({
        ...m,
        startDate: m.startDate ?? m.date,
        number: m.number ?? `#${m.id}`,
        clientName: clients.find((c: any) => c.id === m.clientId)?.name ?? null,
        chauffeurName: chauffeurs.find((c: any) => c.id === m.chauffeurId)?.name ?? null,
        vehicleName: vehicles.find((v: any) => v.id === m.vehicleId) ? `${vehicles.find((v: any) => v.id === m.vehicleId)?.brand} ${vehicles.find((v: any) => v.id === m.vehicleId)?.model}` : null,
      }));
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const m = await getMissionById(input.id);
        if (!m) return null;
        const clients = await getAllClients();
        const chauffeurs = await getAllChauffeurs();
        const vehicles = await getAllVehicles();
        return {
          ...m,
          startDate: (m as any).startDate ?? (m as any).date,
          number: (m as any).number ?? `#${m.id}`,
          clientName: clients.find((c: any) => c.id === (m as any).clientId)?.name ?? null,
          chauffeurName: chauffeurs.find((c: any) => c.id === (m as any).chauffeurId)?.name ?? null,
          vehicleName: (() => { const v = vehicles.find((v: any) => v.id === (m as any).vehicleId); return v ? `${v.brand} ${v.model}` : null; })(),
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
        paymentStatus: z.enum(['non_paye', 'paye', 'remboursement']).optional(),
        paymentMethod: z.string().optional(),
        status: z.enum(['a_confirmer', 'confirmee', 'en_preparation', 'chauffeur_assigne', 'vehicule_assigne', 'prete', 'en_cours', 'client_pris_en_charge', 'terminee', 'annulee', 'litige']).optional(),
        notes: z.string().optional(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { date, ...rest } = input;
        const missionNumber = rest.number || `MSN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        const mission = await createMission({ ...rest, number: missionNumber, date: new Date(date) });
        
        // Notifications
        try {
          const clients = await getAllClients();
          const client = clients.find((c: any) => c.id === input.clientId);
          
          if (client) {
            // Email de confirmation au client
            import('./email-service').then(({ sendBookingConfirmation }) => {
              if (client.email) {
                sendBookingConfirmation({
                  clientEmail: client.email,
                  clientName: client.name,
                  missionNumber: input.number,
                  origin: input.origin,
                  destination: input.destination,
                  date: new Date(date),
                  passengers: input.passengers || 1,
                  price: input.price
                });
              }
            }).catch(console.error);
          }
          
          if (input.chauffeurId) {
            const chauffeurs = await getAllChauffeurs();
            const chauffeur = chauffeurs.find((c: any) => c.id === input.chauffeurId);
            
            if (chauffeur && chauffeur.email) {
              // Email au chauffeur
              import('./email-service').then(({ sendChauffeurAssignment }) => {
                sendChauffeurAssignment({
                  chauffeurEmail: chauffeur.email,
                  chauffeurName: chauffeur.name,
                  missionNumber: input.number,
                  clientName: client ? client.name : 'Client',
                  origin: input.origin,
                  destination: input.destination,
                  date: new Date(date),
                  passengers: input.passengers || 1,
                  specialInstructions: input.specialInstructions
                });
              }).catch(console.error);
              
              // Notification SSE au chauffeur (s'il est connecté)
              // Note: dans une vraie app on utiliserait son userId, ici on simplifie
              import('./notification-service').then(({ notifyUser }) => {
                notifyUser(chauffeur.id, {
                  type: 'success',
                  title: 'Nouvelle mission',
                  message: `Mission ${input.number} assignée : ${input.origin} -> ${input.destination}`,
                  link: '/driver/missions'
                });
              }).catch(console.error);
            }
          }
        } catch (e) {
          console.error("Erreur lors de l'envoi des notifications:", e);
        }
        
        return mission;
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        chauffeurId: z.number().optional(),
        vehicleId: z.number().optional(),
        date: z.string().optional(),
        price: z.number().optional(),
        priceHT: z.number().optional(),
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
    getAll: publicProcedure.query(async () => {
      const quotes = await getAllQuotes();
      const demands = await getAllDemands();
      const clients = await getAllClients();
      return quotes.map((q: any) => {
        const demand = demands.find((d: any) => d.id === q.demandId);
        const client = demand ? clients.find((c: any) => c.id === demand.clientId) : null;
        return { ...q, clientName: client?.name ?? null, demandOrigin: demand?.origin ?? null, demandDestination: demand?.destination ?? null };
      });
    }),
    list: publicProcedure.query(async () => {
      const quotes = await getAllQuotes();
      const demands = await getAllDemands();
      const clients = await getAllClients();
      return quotes.map((q: any) => {
        const demand = demands.find((d: any) => d.id === q.demandId);
        const client = demand ? clients.find((c: any) => c.id === demand.clientId) : null;
        return { ...q, clientName: client?.name ?? null, demandOrigin: demand?.origin ?? null, demandDestination: demand?.destination ?? null };
      });
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const q = await getQuoteById(input.id);
        if (!q) return null;
        const demands = await getAllDemands();
        const clients = await getAllClients();
        const demand = demands.find((d: any) => d.id === (q as any).demandId);
        const client = demand ? clients.find((c: any) => c.id === demand.clientId) : null;
        return { ...q, clientName: client?.name ?? null, demandOrigin: demand?.origin ?? null, demandDestination: demand?.destination ?? null };
      }),
    create: publicProcedure
      .input(z.object({
        demandId: z.number(),
        number: z.string().min(1),
        price: z.number(),
        priceHT: z.number(),
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

        // Envoyer un email de confirmation au client
        try {
          const client = demand.clientId ? await getClientById(demand.clientId) : null;
          if (client?.email) {
            const { sendBookingConfirmation } = await import('./email-service');
            await sendBookingConfirmation({
              clientEmail: client.email,
              clientName: client.name,
              missionNumber,
              origin: demand.origin,
              destination: demand.destination,
              date: demand.date,
              passengers: demand.passengers ?? 1,
              price: quote.price,
            });
          }
        } catch (emailErr) {
          console.error('[convertToMission] Email error:', emailErr);
        }

        // Notifier l'admin en temps réel
        try {
          const { notificationService } = await import('./notification-service');
          notificationService.broadcast({
            type: 'mission_created',
            title: 'Mission créée depuis devis',
            message: `La mission ${missionNumber} a été créée automatiquement depuis le devis accepté`,
            data: { missionNumber },
          });
        } catch (notifErr) {
          console.error('[convertToMission] Notification error:', notifErr);
        }

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
          status: m.status === 'terminee' ? 'payee' : 'en_attente',
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
          status: mission.status === 'terminee' ? 'payee' : 'en_attente',
          clientId: mission.clientId,
        };
      }),
  }),

  // ── REVIEWS ────────────────────────────────────────────────
  reviews: router({
    list: publicProcedure.query(async () => await getAllReviews()),
    byMission: publicProcedure
      .input(z.object({ missionId: z.number() }))
      .query(async ({ input }) => await getReviewsByMission(input.missionId)),
    byChauffeur: publicProcedure
      .input(z.object({ chauffeurId: z.number() }))
      .query(async ({ input }) => await getReviewsByChauffeur(input.chauffeurId)),
    create: publicProcedure
      .input(z.object({
        missionId: z.number(),
        clientId: z.number(),
        chauffeurId: z.number().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        ratingPunctuality: z.number().min(1).max(5).optional(),
        ratingComfort: z.number().min(1).max(5).optional(),
        ratingDriving: z.number().min(1).max(5).optional(),
        ratingCleanliness: z.number().min(1).max(5).optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const review = await createReview(input);
        // Notifier l'admin de la nouvelle notation
        try {
          const { notificationService } = await import('./notification-service');
          notificationService.broadcast({
            type: 'new_review',
            title: 'Nouvelle notation client',
            message: `Note ${input.rating}/5 pour la mission #${input.missionId}`,
            data: { missionId: input.missionId, rating: input.rating },
          });
        } catch {}
        return review;
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => await deleteReview(input.id)),
  }),

  // ── CHAT ─────────────────────────────────────────────────────
  chat: router({
    getMessages: publicProcedure
      .input(z.object({
        conversationId: z.string(),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input }) => await getChatMessages(input.conversationId, input.limit)),
    sendMessage: publicProcedure
      .input(z.object({
        conversationId: z.string(),
        senderId: z.number(),
        senderName: z.string(),
        senderRole: z.string(),
        content: z.string().min(1),
        missionId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const msg = await createChatMessage(input);
        // Diffuser le message via SSE
        try {
          const { notificationService } = await import('./notification-service');
          notificationService.broadcast({
            type: 'chat_message',
            title: `Message de ${input.senderName}`,
            message: input.content,
            data: { conversationId: input.conversationId, senderId: input.senderId, msg },
          });
        } catch {}
        return msg;
      }),
    markRead: publicProcedure
      .input(z.object({
        conversationId: z.string(),
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await markChatMessagesRead(input.conversationId, input.userId);
        return { success: true };
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
});

export type AppRouter = typeof appRouter;

