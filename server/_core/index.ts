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

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

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
