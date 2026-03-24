export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY ?? "",
  // SMTP
  SMTP_HOST: process.env.SMTP_HOST ?? "mail.mschauffeur.fr",
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "465"),
  SMTP_USER: process.env.SMTP_USER ?? "booking@mschauffeur.fr",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "booking@mschauffeur.fr",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "contact@mschauffeur.fr",
  // App URL
  APP_URL: process.env.APP_URL ?? "https://majestic-south-chauffeurs-production.up.railway.app",
};
