FROM node:20-alpine

# Installer pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances (sans frozen-lockfile pour éviter les conflits de cache)
RUN pnpm install --no-frozen-lockfile

# Copier le reste du code
COPY . .

# Build de l'application
RUN pnpm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["pnpm", "run", "start"]
