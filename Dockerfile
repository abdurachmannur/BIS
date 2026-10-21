# ==============================================================================
# Stage 1: Build Aplikasi React + TypeScript + Vite
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Salin konfigurasi paket terlebih dahulu untuk memaksimalkan layer caching Docker
COPY package.json package-lock.json* bun.lock* ./

# Instal dependensi
RUN npm install --legacy-peer-deps

# Salin seluruh kode sumber aplikasi
COPY . .

# Kompilasi aplikasi untuk produksi ke folder /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Server Produksi Ringan dengan Nginx Alpine
# ==============================================================================
FROM nginx:stable-alpine AS production

# Salin konfigurasi Nginx khusus SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build statis dari Stage 1 ke direktori web Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Ekspos port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
