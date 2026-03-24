import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { generateMissionPDF, generateQuotePDF, generateInvoicePDF } from "../pdf-service";
import { startCronService } from "../cron-service";
import { createCheckoutSession, constructWebhookEvent, isStripeEnabled } from "../stripe-service";
import { generateICalContent } from "../ical-service";
import { ENV } from "./env";
import { createUser, loginUser } from "../auth-local";
import { DEMO_MISSIONS, DEMO_CLIENTS, DEMO_CHAUFFEURS, DEMO_VEHICLES, DEMO_QUOTES } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Healthcheck pour Railway
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Majestic South Chauffeurs", timestamp: new Date().toISOString() });
  });

  // Route d'inscription client
  app.post("/api/register", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, company, password, role } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
      }
      const name = `${firstName} ${lastName}`;
      const user = await createUser({ email, password, name, phone, role: role || "client" });
      try {
        const { getDb } = await import("../db");
        const db = getDb();
        if (db) {
          const { clients } = await import("../../drizzle/schema");
          await db.insert(clients).values({
            firstName, lastName, email, phone: phone || "", company: company || "",
            type: "particulier", status: "actif",
          });
        }
      } catch (dbErr) { console.log("[Register] Client cree en memoire (DB non disponible)"); }
      res.json({ success: true, user });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  // Route de login client
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis" });
      const result = await loginUser(email, password);
      if (!result) return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      res.json({ success: true, user: result.user, token: result.token });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  // Real-time notifications SSE
  app.get("/api/notifications/stream", (req, res) => {
    const userIdStr = req.query.userId as string;
    const userId = userIdStr ? parseInt(userIdStr, 10) : 1; // Default to admin if not specified
    
    // Importer dynamiquement pour éviter les problèmes de cycle
    import("../notification-service").then(({ addClient }) => {
      addClient(userId, res);
    }).catch(err => {
      console.error("Failed to load notification service", err);
      res.status(500).end();
    });
  });

  // PDF generation routes
  app.get("/api/pdf/mission/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const m = DEMO_MISSIONS.find(x => x.id === id) || DEMO_MISSIONS[0];
      const client = DEMO_CLIENTS.find(c => c.id === m.clientId);
      const chauffeur = DEMO_CHAUFFEURS.find(c => c.id === m.chauffeurId);
      const vehicle = DEMO_VEHICLES.find(v => v.id === m.vehicleId);
      const buf = await generateMissionPDF({ ...m, client, chauffeur, vehicle });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="mission-${id}.pdf"`);
      res.send(buf);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/pdf/quote/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const q = DEMO_QUOTES.find(x => x.id === id) || DEMO_QUOTES[0];
      const demand = (await import("../db")).DEMO_DEMANDS.find((d: any) => d.id === q.demandId);
      const client = demand ? DEMO_CLIENTS.find(c => c.id === demand.clientId) : DEMO_CLIENTS[0];
      const buf = await generateQuotePDF({
        ...q,
        client,
        origin: demand?.origin,
        destination: demand?.destination,
        date: demand?.date,
        passengers: demand?.passengers,
        serviceType: (demand as any)?.serviceType || (demand as any)?.type,
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="devis-${q.number}.pdf"`);
      res.send(buf);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/pdf/invoice/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const client = DEMO_CLIENTS.find(c => c.id === clientId) || DEMO_CLIENTS[0];
      const missions = DEMO_MISSIONS.filter(m => m.clientId === clientId && m.status === "terminee");
      const totalHT = missions.reduce((s, m) => s + (m.price || 0) / 1.2, 0);
      const totalTTC = missions.reduce((s, m) => s + (m.price || 0), 0);
      const invoiceNum = `FAC-${new Date().getFullYear()}-${String(clientId).padStart(3, "0")}`;
      const buf = await generateInvoicePDF({
        id: clientId,
        number: invoiceNum,
        client,
        missions,
        totalHT,
        tva: 20,
        totalTTC,
        status: "en_attente",
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="facture-${invoiceNum}.pdf"`);
      res.send(buf);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Route iCal - Export calendrier chauffeur
  app.get("/api/calendar/:chauffeurId.ics", async (req, res) => {
    try {
      const chauffeurId = parseInt(req.params.chauffeurId);
      const chauffeur = DEMO_CHAUFFEURS.find(c => c.id === chauffeurId) || DEMO_CHAUFFEURS[0];
      const missions = DEMO_MISSIONS.filter(m => m.chauffeurId === chauffeurId);
      const icalMissions = missions.map(m => ({
        id: m.id,
        number: String(m.id),
        origin: m.origin,
        destination: m.destination,
        date: m.date,
        status: m.status,
        notes: m.notes,
        clientName: DEMO_CLIENTS.find(c => c.id === m.clientId)?.name,
        vehicleModel: DEMO_VEHICLES.find(v => v.id === m.vehicleId)?.model,
        passengers: undefined,
      }));
      const content = generateICalContent(icalMissions, chauffeur?.name);
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="calendrier-${chauffeurId}.ics"`);
      res.send(content);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Route iCal global (toutes les missions)
  app.get("/api/calendar/all.ics", async (req, res) => {
    try {
      const icalMissions = DEMO_MISSIONS.map(m => ({
        id: m.id,
        number: String(m.id),
        origin: m.origin,
        destination: m.destination,
        date: m.date,
        status: m.status,
        notes: m.notes,
        clientName: DEMO_CLIENTS.find(c => c.id === m.clientId)?.name,
        vehicleModel: DEMO_VEHICLES.find(v => v.id === m.vehicleId)?.model,
        passengers: undefined,
      }));
      const content = generateICalContent(icalMissions, 'Toutes les missions');
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="toutes-missions.ics"');
      res.send(content);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Routes Stripe
  app.post("/api/stripe/create-checkout", async (req, res) => {
    try {
      if (!isStripeEnabled()) {
        return res.status(503).json({ error: "Stripe non configure" });
      }
      const { missionId, missionNumber, amount, clientEmail, clientName, origin, destination, date, type } = req.body;
      const baseUrl = ENV.APP_URL;
      const session = await createCheckoutSession({
        missionId, missionNumber, amount, clientEmail, clientName, origin, destination, date,
        type: type || 'acompte',
        successUrl: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/missions/${missionId}`,
      });
      if (!session) return res.status(500).json({ error: "Erreur creation session" });
      res.json(session);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Webhook Stripe (doit etre avant express.json pour avoir le raw body)
  app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const event = constructWebhookEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
    if (!event) return res.status(400).send('Webhook Error');
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const missionId = parseInt(session.metadata?.missionId || '0');
      console.log(`[Stripe] Paiement confirme pour la mission ${missionId}`);
      // TODO: Mettre a jour le statut de paiement en DB
    }
    res.json({ received: true });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Démarrer le service CRON
  startCronService();

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
