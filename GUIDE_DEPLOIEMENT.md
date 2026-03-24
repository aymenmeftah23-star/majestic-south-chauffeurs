# Guide de Déploiement — Majestic South Chauffeurs

## Architecture de l'application

L'application est un **monorepo full-stack** composé de :

| Composant | Technologie | Description |
|-----------|-------------|-------------|
| Frontend | React 18 + TypeScript + Vite | Interface utilisateur SPA |
| Backend | Node.js + Express + tRPC | API REST typée |
| Styles | TailwindCSS | Design system gold/noir |
| ORM | Drizzle ORM | Compatible MySQL/TiDB |
| PDF | PDFKit | Génération de documents |
| Auth | OAuth (Manus) | Authentification utilisateurs |

---

## Fonctionnalités implémentées

### Administration (Back-office)
- **Tableau de bord** — KPIs temps réel, alertes, planning du jour
- **Missions** — Liste complète avec filtres par statut, CRUD complet
- **Clients** — Grille de cartes avec profils détaillés
- **Chauffeurs** — Tableau avec statuts et affectations
- **Véhicules** — Grille avec informations de flotte
- **Demandes** — Gestion des demandes entrantes
- **Devis** — Création et suivi des devis
- **Facturation** — Génération de factures
- **Planning** — Vue calendrier des missions
- **Statistiques** — Graphiques et analyses
- **Alertes** — Système de notifications

### Portail Client
- **Espace client** — Dashboard personnalisé
- **Mes missions** — Historique des trajets
- **Mes devis** — Consultation et acceptation
- **Mes demandes** — Suivi des réservations
- **Profil** — Gestion des informations

### Formulaire de Réservation (3 étapes)
- **Étape 1** — Type de service, trajet, date/heure, aller-retour
- **Étape 2** — Passagers, bagages, coordonnées, numéro de vol
- **Étape 3** — Choix du véhicule, récapitulatif, confirmation

### Génération PDF
- **Bon de Mission** — `GET /api/pdf/mission/:id`
- **Devis** — `GET /api/pdf/quote/:id`
- **Facture** — `GET /api/pdf/invoice/:clientId`

### Landing Page Publique
- Page d'accueil premium avec services, flotte, témoignages
- Formulaire de contact
- Boutons de réservation et connexion

---

## Installation et démarrage

### Prérequis
- Node.js >= 18
- pnpm >= 8 (`npm install -g pnpm`)

### Installation

```bash
# Extraire le ZIP
unzip majestic-south-chauffeurs.zip
cd projects

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env
```

### Configuration `.env`

```env
# Base de données (optionnel - mode démo sans DB)
DATABASE_URL=mysql://user:password@host:3306/majestic_south

# OAuth (optionnel - pour l'authentification)
MANUS_OAUTH_CLIENT_ID=your_client_id
MANUS_OAUTH_CLIENT_SECRET=your_client_secret

# Port (défaut: 3000)
PORT=3000
NODE_ENV=production
```

### Démarrage en développement

```bash
pnpm dev
# L'application sera disponible sur http://localhost:3000
```

### Build de production

```bash
pnpm build
pnpm start
```

---

## Routes de l'application

### Pages publiques
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Connexion |
| `/register` | Inscription |
| `/booking` | Formulaire de réservation |
| `/client-portal` | Espace client |

### Back-office (admin)
| Route | Description |
|-------|-------------|
| `/dashboard` | Tableau de bord |
| `/missions` | Gestion des missions |
| `/clients` | Gestion des clients |
| `/chauffeurs` | Gestion des chauffeurs |
| `/vehicles` | Gestion de la flotte |
| `/demands` | Demandes entrantes |
| `/quotes` | Devis |
| `/billing` | Facturation |
| `/planning` | Calendrier |
| `/statistics` | Statistiques |
| `/alerts` | Alertes |
| `/settings` | Paramètres |

### API PDF
| Route | Description |
|-------|-------------|
| `GET /api/pdf/mission/:id` | Bon de mission PDF |
| `GET /api/pdf/quote/:id` | Devis PDF |
| `GET /api/pdf/invoice/:clientId` | Facture PDF |

---

## Déploiement sur serveur VPS

### Avec PM2

```bash
# Installer PM2
npm install -g pm2

# Build
pnpm build

# Démarrer
pm2 start dist/index.js --name "majestic-south"
pm2 save
pm2 startup
```

### Avec Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Avec Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name majestic-south.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Personnalisation

### Modifier les informations de l'entreprise

Éditer le fichier `server/db.ts` pour les données démo, ou configurer la base de données MySQL pour les données réelles.

### Modifier le design

Les couleurs principales sont définies dans les composants :
- **Or** : `#C9A84C` (gold premium)
- **Fond sombre** : `#0a0a0a`
- **Fond carte** : `#111111`

### Ajouter des données réelles

1. Configurer `DATABASE_URL` dans `.env`
2. Exécuter les migrations : `pnpm db:push`
3. L'application utilisera automatiquement la base de données

---

## Support

Pour toute question technique, contacter l'équipe de développement.

**Version** : 1.0.0  
**Date** : Mars 2026  
**Stack** : React + Node.js + TypeScript + TailwindCSS + PDFKit
