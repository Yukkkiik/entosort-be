# EntoSort Backend

Backend API untuk sistem otomasi pemanenan dan penyortiran larva BSF berbasis IoT, MQTT, WebSocket, dan Computer Vision menggunakan Express.js dan Prisma.

---

# Tech Stack

* Node.js
* Express.js
* Prisma ORM
* MySQL
* JWT Authentication
* MQTT
* WebSocket
* Joi Validation
* MAMP (development)

---

# Project Structure

```text
entosort-be/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── mqtt/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   └── app.js
│
├── .env.example
├── .gitignore
├── package.json
└── prisma.config.ts
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/Yukkkiik/entosort-be.git
cd entosort-be
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Copy `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi konfigurasi database dan JWT pada file `.env`.

Contoh:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="mysql://root:root@localhost:8889/entosort_db"

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=entosort-backend

WS_PORT=3001
```

---

# Database Setup

## 1. Jalankan MySQL

Pastikan MySQL aktif.

Jika menggunakan MAMP:

* Host: `localhost`
* Port: `8889`
* Username: `root`
* Password: `root`

---

## 2. Buat Database

```sql
CREATE DATABASE entosort_db;
```

---

## 3. Generate Prisma Client

```bash
npx prisma generate
```

---

## 4. Jalankan Migration

```bash
npx prisma migrate dev --name init
```

---

## 5. Jalankan Seeder

```bash
npm run prisma:seed
```

---

# Running Project

## Development Mode

```bash
npm run dev
```

## Production Mode

```bash
npm start
```

---

# Prisma Commands

## Generate Prisma Client

```bash
npm run prisma:generate
```

## Run Migration

```bash
npm run prisma:migrate
```

## Open Prisma Studio

```bash
npm run prisma:studio
```

## Run Seeder

```bash
npm run prisma:seed
```

---

# Authentication

Backend menggunakan JWT Authentication.

Authorization header:

```http
Authorization: Bearer your_token
```

Middleware:

* `authenticate`
* `authorize`

Role-based authorization didukung.

---

# API Features

* Authentication & Authorization
* Node Management
* Sensor Logging
* Harvest Logging
* Error Logging
* MQTT Communication
* WebSocket Realtime Update
* CSV Export
* PDF Report

---

# Environment Variables

| Variable       | Description               |
| -------------- | ------------------------- |
| PORT           | Express server port       |
| DATABASE_URL   | MySQL database connection |
| JWT_SECRET     | JWT secret key            |
| JWT_EXPIRES_IN | JWT expiration time       |
| MQTT_HOST      | MQTT broker host          |
| MQTT_PORT      | MQTT broker port          |
| MQTT_USERNAME  | MQTT username             |
| MQTT_PASSWORD  | MQTT password             |
| MQTT_CLIENT_ID | MQTT client identifier    |
| WS_PORT        | WebSocket server port     |

---

# Git Ignore

File berikut tidak diupload ke repository:

```gitignore
node_modules/
.env
```

---

# Recommended Node Version

Disarankan menggunakan:

```text
Node.js v20 LTS
```

---

# Author

Developed for PBL EntoSort Project.
