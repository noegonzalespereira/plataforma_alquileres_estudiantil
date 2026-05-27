# =====================================================
# Etapa 1: Build — compila React con Vite
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL se inyecta en tiempo de build
# En docker-compose se pasa como build arg
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# =====================================================
# Etapa 2: Servir con Nginx
# =====================================================
FROM nginx:alpine

# Copiar los archivos estáticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx (SPA routing + gzip)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
