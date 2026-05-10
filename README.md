# 🐛 BSF Harvest System — Backend

Backend production-ready untuk sistem otomasi pemanenan dan penyortiran larva **Black Soldier Fly (BSF)** berbasis Computer Vision.

---

## 🏗️ Arsitektur Sistem

```
Raspberry Pi 4 (Edge AI / OpenCV)
    │
    ├─── MQTT: harvest/result ──────────────┐
    │                                       │
ESP32 (Sensor + Motor Control)             ▼
    │                              ┌─────────────────┐
    ├─── MQTT: sensor/data/{id}    │   BACKEND        │
    ├─── MQTT: sensor/status/{id}  │   Node.js +      │
    └─── MQTT: device/error/{id}   │   Express +      │
                                   │   Prisma + MySQL  │
                            ┌──────┤                   ├──────┐
                            │      └─────────────────┘      │
                         REST API                       WebSocket
                            │                               │
                       Dashboard /                  Real-time updates
                       Mobile App
```

---

## 📁 Struktur Folder

```
bsf-backend/
├── prisma/
│   ├── schema.prisma          # Database schema & relasi
│   └── seed.js                # Data awal (admin, node, settings)
├── src/
│   ├── app.js                 # Entry point
│   ├── config/
│   │   └── prisma.js          # Prisma client singleton
│   ├── controllers/           # HTTP request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── node.controller.js
│   │   ├── sensor.controller.js
│   │   ├── harvest.controller.js
│   │   ├── control.controller.js
│   │   ├── settings.controller.js
│   │   ├── errorLog.controller.js
│   │   ├── report.controller.js
│   │   └── dashboard.controller.js
│   ├── services/              # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── node.service.js
│   │   ├── sensor.service.js
│   │   ├── harvest.service.js
│   │   ├── control.service.js
│   │   ├── settings.service.js
│   │   ├── errorLog.service.js
│   │   ├── report.service.js
│   │   └── dashboard.service.js
│   ├── repositories/          # Database queries (Prisma)
│   │   ├── user.repository.js
│   │   ├── node.repository.js
│   │   ├── sensor.repository.js
│   │   ├── harvest.repository.js
│   │   ├── errorLog.repository.js
│   │   └── settings.repository.js
│   ├── routes/                # Express routes
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── node.routes.js
│   │   ├── sensor.routes.js
│   │   ├── harvest.routes.js
│   │   ├── control.routes.js
│   │   ├── settings.routes.js
│   │   ├── error.routes.js
│   │   ├── report.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authenticate & authorize
│   │   ├── errorHandler.js    # Global error handler + AppError
│   │   └── validate.js        # Joi validation middleware
│   ├── mqtt/
│   │   ├── mqttClient.js      # MQTT init, subscribe, publish, route
│   │   └── handlers/
│   │       ├── sensor.handler.js
│   │       ├── nodeStatus.handler.js
│   │       ├── harvest.handler.js
│   │       └── error.handler.js
│   ├── validations/           # Joi schemas
│   │   ├── auth.validation.js
│   │   ├── user.validation.js
│   │   ├── node.validation.js
│   │   ├── harvest.validation.js
│   │   ├── control.validation.js
│   │   └── settings.validation.js
│   └── utils/
│       ├── catchAsync.js      # Async error wrapper
│       ├── websocket.js       # WebSocket server & broadcast
│       └── response.js        # Response helpers
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Setup & Menjalankan

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd bsf-backend
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit file `.env`:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="mysql://root:password@localhost:3306/bsf_db"

JWT_SECRET=ganti_dengan_secret_yang_kuat
JWT_EXPIRES_IN=7d

MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=bsf-backend-server

WS_PORT=3001
```

### 3. Setup Database MySQL

```sql
CREATE DATABASE bsf_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Prisma Migration & Generate

```bash
# Generate Prisma client
npm run prisma:generate

# Jalankan migrasi (buat tabel)
npm run prisma:migrate
# Masukkan nama migrasi, misal: init_bsf_schema

# Seed data awal
npm run prisma:seed
```

### 5. Setup MQTT Broker (Mosquitto)

```bash
# Install di Ubuntu/Debian
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Test broker
mosquitto_pub -t "test/hello" -m "world"
mosquitto_sub -t "test/hello"
```

### 6. Jalankan Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Output yang diharapkan:
```
🚀 BSF Backend running on port 3000
📡 Environment: development
🌐 Health check: http://localhost:3000/health

📡 Connecting to MQTT broker: mqtt://localhost:1883
✅ MQTT connected
📬 MQTT subscribed to topics: [...]
🔌 WebSocket server running on port 3001
```

---

## 📡 MQTT Topic Design

| Topic | Arah | Keterangan |
|-------|------|------------|
| `sensor/data/{nodeId}` | ESP32 → Backend | Data suhu, kelembapan, tekanan |
| `sensor/status/{nodeId}` | ESP32 → Backend | Status online/offline node |
| `harvest/result` | Raspberry Pi → Backend | Hasil klasifikasi CV |
| `device/control/{nodeId}` | Backend → ESP32 | Perintah kontrol (motor, solenoid, settings) |
| `device/error/{nodeId}` | ESP32/RPi → Backend | Laporan error perangkat |

### Contoh Payload MQTT

**sensor/data/NODE-001**
```json
{
  "temperature": 28.5,
  "humidity": 72.3,
  "pressure": 1013.25
}
```

**harvest/result**
```json
{
  "nodeId": "NODE-001",
  "larvaCount": 120,
  "prepupaCount": 30,
  "rejectCount": 5,
  "durationSec": 45
}
```

**device/control/NODE-001** (dikirim dari backend)
```json
{
  "command": "motor",
  "action": "on",
  "speedRpm": 100,
  "timestamp": "2025-01-01T08:00:00.000Z"
}
```

**device/error/NODE-001**
```json
{
  "errorCode": "CAM_001",
  "errorType": "camera_error",
  "message": "Camera not detected",
  "severity": "high"
}
```

---

## 🌐 API Endpoints

Base URL: `http://localhost:3000/api`

> Semua endpoint kecuali `POST /auth/login` memerlukan header:
> `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Akses |
|--------|----------|-------|
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Semua user |

### User Management
| Method | Endpoint | Akses |
|--------|----------|-------|
| GET | `/users` | Admin |
| POST | `/users` | Admin |
| PUT | `/users/:id` | Admin |
| DELETE | `/users/:id` | Admin |

### Node
| Method | Endpoint | Akses |
|--------|----------|-------|
| GET | `/nodes` | Semua |
| GET | `/nodes/:id/status` | Semua |
| POST | `/nodes` | Admin |
| PUT | `/nodes/:id` | Admin |
| DELETE | `/nodes/:id` | Admin |

### Sensor
| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/sensor/latest` | `nodeId` |
| GET | `/sensor/history` | `nodeId`, `from`, `to`, `limit` |

### Harvest
| Method | Endpoint | Query Params |
|--------|----------|-------------|
| POST | `/harvest` | - |
| GET | `/harvest` | `nodeId`, `from`, `to`, `page`, `limit` |
| GET | `/harvest/stats` | `nodeId`, `from`, `to` |

### Control
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/control/motor` | `{ nodeId, action, speedRpm }` |
| POST | `/control/solenoid` | `{ nodeId, action, delayMs }` |
| POST | `/control/manual-mode` | `{ nodeId, enabled }` |

### Settings
| Method | Endpoint | Akses |
|--------|----------|-------|
| GET | `/settings` | Semua |
| PUT | `/settings` | Admin |

### Error Logs
| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/errors` | `nodeId`, `resolved`, `severity`, `limit` |
| POST | `/errors/resolve/:id` | - |

### Report
| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/report/daily` | `date`, `nodeId` |
| GET | `/report/export/pdf` | `from`, `to` |
| GET | `/report/export/csv` | `from`, `to` |

### Dashboard
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/dashboard/summary` | Ringkasan lengkap sistem |

---

## 🔌 WebSocket (Real-time Dashboard)

Connect ke: `ws://localhost:3001`

Event types yang diterima:
```json
{ "type": "sensor_update", "payload": { ... } }
{ "type": "node_status",   "payload": { ... } }
{ "type": "harvest_update","payload": { ... } }
{ "type": "error_alert",   "payload": { ... } }
```

---

## 🔐 Default Credentials (Setelah Seed)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| peternak1 | peternak123 | peternak |

> ⚠️ **Ganti password default sebelum deploy ke production!**

---

## 🗄️ Database Schema (ERD Ringkas)

```
User (1) ──────< HarvestLog (N)
Node (1) ──────< SensorLog  (N)
Node (1) ──────< HarvestLog (N)
Node (1) ──────< ErrorLog   (N)
Node (1) ───── Settings     (1)
```

---

## 🚀 Tips Production

1. Gunakan **PM2** untuk process management:
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name bsf-backend
   pm2 save && pm2 startup
   ```

2. Gunakan **Nginx** sebagai reverse proxy

3. Aktifkan autentikasi pada **Mosquitto**:
   ```bash
   mosquitto_passwd -c /etc/mosquitto/passwd bsf_user
   ```

4. Set `NODE_ENV=production` di `.env`

5. Tambahkan **Redis** untuk JWT blacklist pada logout