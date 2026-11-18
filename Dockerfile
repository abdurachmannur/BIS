FROM node:24-bullseye-slim

# Pasang paket build dasar agar kompilasi native addon better-sqlite3 selalu lancar
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin file manifes paket dan instal seluruh dependensi
COPY package.json package-lock.json* ./
RUN npm install

# Salin seluruh kode sumber proyek
COPY . .

# Build frontend React/Vite ke folder /app/dist
RUN npm run build

# Siapkan direktori penyimpanan database SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
