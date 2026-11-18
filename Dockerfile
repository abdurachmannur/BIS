FROM node:24-bullseye-slim

# Pasang git, ca-certificates, dan paket kompilasi untuk better-sqlite3 & fitur Update via GitHub
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
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
ENV APP_VERSION=v1.0.0-beta.1

EXPOSE 3000

CMD ["node", "server.js"]
