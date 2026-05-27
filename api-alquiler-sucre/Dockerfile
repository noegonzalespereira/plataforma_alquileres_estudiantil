# =====================================================
# Etapa 1: Build — compila TypeScript a JavaScript
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero (optimiza caché de Docker)
COPY package*.json ./

# Instalar todas las dependencias (incluye devDeps para compilar)
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar TypeScript → JavaScript en /dist
RUN npm run build

# =====================================================
# Etapa 2: Runtime — imagen final ligera (~150MB)
# =====================================================
FROM node:20-alpine

WORKDIR /app

# Solo instalar dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el build generado en la etapa anterior
COPY --from=builder /app/dist ./dist

# Crear carpeta de uploads para imágenes de inmuebles
RUN mkdir -p /app/uploads

EXPOSE 3000

# Docker verifica que el contenedor responde cada 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
