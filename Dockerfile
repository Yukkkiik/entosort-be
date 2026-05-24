# Base image
FROM node:18-alpine

# Install dependencies sistem yang dibutuhkan Prisma
RUN apk add --no-cache openssl

# Folder kerja di dalam container
WORKDIR /app

# Copy package.json dulu (supaya cache layer lebih efisien)
COPY package*.json ./

# Copy prisma schema (dibutuhkan saat npm install)
COPY prisma ./prisma/

# Install semua dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy semua source code
COPY . .

# Expose port Express (sesuaikan dengan port di app.js kamu)
EXPOSE 3000

# Jalankan app
CMD ["node", "src/app.js"]