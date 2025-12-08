# Usamos la imagen oficial de Node.js ligera
FROM node:18-alpine AS base

# Fase de Dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Fase de Construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js durante el build
ENV NEXT_TELEMETRY_DISABLED 1

# Descargar JUnit si no está presente (asegura reproducibilidad)
# Aunque lo tengamos local, esto asegura que el container lo tenga
RUN node -e "const fs = require('fs'); const https = require('https'); if(!fs.existsSync('public/junit.jar')) { const file = fs.createWriteStream('public/junit.jar'); https.get('https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/1.10.0/junit-platform-console-standalone-1.10.0.jar', function(response) { response.pipe(file); }); }"

RUN npm run build

# Fase de Ejecución (Imagen final reducida)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar permisos para cache de Next.js
mkdir .next
chown nextjs:nodejs .next

# Copiamos solo lo necesario para correr (Standalone output)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# 'hostname' parece ser necesario para docker en algunas versiones de next
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
