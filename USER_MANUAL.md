# TaskBoard - Kullanıcı Kılavuzu ve Sistem Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Kurulum ve Yapılandırma](#kurulum-ve-yapılandırma)
5. [Environment Variables](#environment-variables)
6. [Docker Yapılandırması](#docker-yapılandırması)
7. [Backend (API) Servisi](#backend-api-servisi)
8. [Worker Servisi](#worker-servisi)
9. [Frontend (Web) Uygulaması](#frontend-web-uygulaması)
10. [RabbitMQ Kullanımı](#rabbitmq-kullanımı)
11. [Redis Kullanımı](#redis-kullanımı)
12. [TanStack Query Kullanımı](#tanstack-query-kullanımı)
13. [Socket.io Kullanımı](#socketio-kullanımı)
14. [Authentication Flow](#authentication-flow)
15. [API Endpoints](#api-endpoints)
16. [Troubleshooting](#troubleshooting)
17. [Best Practices](#best-practices)

---

## 🎯 Genel Bakış

TaskBoard, gerçek zamanlı görev yönetimi için geliştirilmiş fullstack bir JavaScript uygulamasıdır. Proje, modern mikroservis mimarisi kullanarak geliştirilmiş ve aşağıdaki özelliklere sahiptir:

- ✅ OTP tabanlı kimlik doğrulama (Email/Telefon)
- ✅ JWT Access & Refresh Token sistemi
- ✅ Rol tabanlı erişim kontrolü (Admin/Member)
- ✅ Gerçek zamanlı güncellemeler (Socket.io)
- ✅ Asenkron event işleme (RabbitMQ)
- ✅ Cache ve rate limiting (Redis)
- ✅ MongoDB veritabanı
- ✅ Proje ve görev yönetimi
- ✅ Görev yorumları
- ✅ Takım yönetimi ve davet sistemi
- ✅ Gerçek zamanlı bildirimler
- ✅ Dark/Light tema desteği
- ✅ Responsive UI (Shadcn UI)

---

## 🏗️ Sistem Mimarisi

### Mimari Diyagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React + Vite + TanStack Query + Socket.io Client    │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/WebSocket
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐            ┌─────────▼──────────┐
│   API Server   │            │  Worker Service  │
│  (Express.js)  │            │  (RabbitMQ)      │
│                │            │                  │
│  - REST API    │            │  - Mailer        │
│  - Socket.io   │            │  - Notifier     │
│  - Auth        │            │  - Analytics     │
│  - RBAC        │            │  - Cron Jobs     │
└───────┬────────┘            └─────────┬────────┘
        │                               │
        │                               │
        ├───────────────┬───────────────┤
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   MongoDB    │ │    Redis    │ │  RabbitMQ   │
│  (Database)  │ │   (Cache)   │ │  (Message   │
│              │ │             │ │   Queue)    │
└──────────────┘ └─────────────┘ └─────────────┘
```

### Servisler

1. **API Server** (`apps/api`)
   - Express.js REST API
   - Socket.io WebSocket server
   - Authentication & Authorization
   - Rate limiting
   - Request validation

2. **Worker Service** (`apps/worker`)
   - RabbitMQ consumers
   - Email sending (Nodemailer)
   - Notification processing
   - Analytics event handling
   - Scheduled cron jobs

3. **Web Application** (`apps/web`)
   - React + Vite
   - TanStack Query (data fetching)
   - Socket.io Client (real-time)
   - Zustand (state management)
   - Shadcn UI components

### Veri Akışı

#### 1. OTP İsteği Akışı
```
Client → API: POST /api/auth/otp/request
  ↓
Rate Limit Check (Redis)
  ↓
Generate OTP → Store in Redis (5 min TTL)
  ↓
Publish to RabbitMQ: 'otp.requested'
  ↓
Worker: Consume event → Send Email
```

#### 2. Task Oluşturma Akışı
```
Client → API: POST /api/tasks
  ↓
Validate & Authenticate
  ↓
Save to MongoDB
  ↓
Publish to RabbitMQ: 'task.created'
  ↓
Emit Socket.io: 'task.created'
  ↓
Worker: Analytics consumer → Store event
```

#### 3. Real-time Güncelleme Akışı
```
Client → Socket.io: Join room
  ↓
Server: Add to room
  ↓
Task Updated → Emit to room
  ↓
Clients in room: Receive update
  ↓
TanStack Query: Invalidate & Refetch
```

---

## 🛠️ Teknoloji Stack

### Backend Teknolojileri

#### Express.js
- **Kullanım:** REST API endpoint'leri, middleware'ler, routing
- **Konum:** `apps/api/src/`
- **Özellikler:**
  - RESTful API tasarımı
  - Middleware zinciri (auth, validation, rate limiting)
  - Error handling
  - CORS yapılandırması

#### MongoDB + Mongoose
- **Kullanım:** Veri kalıcılığı, şema tanımları
- **Konum:** `apps/api/src/schemas/`, `apps/api/src/modules/*/repository.js`
- **Özellikler:**
  - Schema validation
  - Population (ilişkili veriler)
  - Indexing
  - Transactions

#### Socket.io
- **Kullanım:** Gerçek zamanlı iletişim
- **Konum:** `apps/api/src/loaders/socket.js`, `apps/api/src/sockets/`
- **Özellikler:**
  - Room-based messaging
  - Authentication middleware
  - Event handlers
  - Real-time notifications

#### RabbitMQ (amqplib)
- **Kullanım:** Asenkron event işleme
- **Konum:** `apps/api/src/config/rabbit.js`, `apps/worker/src/config/rabbit.js`
- **Özellikler:**
  - Topic exchange
  - Durable queues
  - Message persistence
  - Consumer acknowledgment

#### Redis (ioredis)
- **Kullanım:** Cache, rate limiting, session management
- **Konum:** `apps/api/src/config/redis.js`, `apps/worker/src/config/redis.js`
- **Özellikler:**
  - Key-value storage
  - TTL (Time To Live)
  - Atomic operations
  - Pub/Sub (notifications)

#### JWT (jsonwebtoken)
- **Kullanım:** Authentication tokens
- **Konum:** `apps/api/src/utils/jwt.js`, `apps/api/src/modules/auth/`
- **Özellikler:**
  - Access tokens (15 min)
  - Refresh tokens (7 days)
  - Token blacklisting
  - Automatic refresh

#### Nodemailer
- **Kullanım:** Email gönderimi
- **Konum:** `apps/worker/src/services/mailer.js`
- **Özellikler:**
  - SMTP configuration
  - HTML email templates
  - Error handling
  - Stub mode (development)

### Frontend Teknolojileri

#### React 18
- **Kullanım:** UI component'leri, state management
- **Konum:** `apps/web/src/`
- **Özellikler:**
  - Functional components
  - Hooks (useState, useEffect, custom hooks)
  - Context API
  - Error boundaries

#### Vite
- **Kullanım:** Build tool, dev server
- **Konum:** `apps/web/vite.config.js`
- **Özellikler:**
  - Fast HMR (Hot Module Replacement)
  - ES modules
  - Optimized builds
  - Environment variables

#### TanStack Query (React Query)
- **Kullanım:** Server state management, data fetching
- **Konum:** `apps/web/src/app/providers/query-client.jsx`
- **Özellikler:**
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Error handling
  - DevTools integration

#### TanStack Table
- **Kullanım:** Tablo component'leri
- **Konum:** `apps/web/src/components/common/data-table.jsx`
- **Özellikler:**
  - Sorting
  - Filtering
  - Pagination
  - Column definitions

#### Zustand
- **Kullanım:** Client state management
- **Konum:** `apps/web/src/store/`
- **Özellikler:**
  - Lightweight
  - TypeScript support
  - DevTools integration
  - Persist middleware

#### Socket.io Client
- **Kullanım:** Real-time communication
- **Konum:** `apps/web/src/lib/socket.js`, `apps/web/src/hooks/use-socket.js`
- **Özellikler:**
  - Auto-reconnect
  - Room joining/leaving
  - Event listeners
  - Authentication

#### Axios
- **Kullanım:** HTTP client
- **Konum:** `apps/web/src/api/client.js`
- **Özellikler:**
  - Request/Response interceptors
  - Automatic token refresh
  - Error handling
  - Timeout configuration

#### React Router DOM
- **Kullanım:** Client-side routing
- **Konum:** `apps/web/src/app/routes/`
- **Özellikler:**
  - Protected routes
  - Route guards
  - Dynamic routing
  - Navigation hooks

#### Shadcn UI
- **Kullanım:** UI component library
- **Konum:** `apps/web/src/components/ui/`
- **Özellikler:**
  - Accessible components
  - Customizable styling
  - Dark mode support
  - Tailwind CSS integration

#### Tailwind CSS
- **Kullanım:** Utility-first CSS framework
- **Konum:** `apps/web/tailwind.config.js`
- **Özellikler:**
  - Responsive design
  - Dark mode
  - Custom utilities
  - JIT compilation

---

## 🚀 Kurulum ve Yapılandırma

### Gereksinimler

- **Node.js:** >= 18.0.0
- **pnpm:** >= 8.0.0
- **Docker:** >= 20.10.0
- **Docker Compose:** >= 2.0.0

### Adım 1: Projeyi Klonlayın

```bash
git clone <repository-url>
cd nodelabs_task
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
pnpm install
```

### Adım 3: Environment Variables

Root dizinde `.env` dosyası oluşturun:

```bash
cp .env.example .env
# veya manuel olarak oluşturun
```

Detaylı environment variable açıklamaları için [Environment Variables](#environment-variables) bölümüne bakın.

### Adım 4: Docker Servislerini Başlatın

```bash
# Tüm servisleri başlat (MongoDB, Redis, RabbitMQ)
docker-compose up -d

# Servislerin durumunu kontrol et
docker-compose ps

# Logları görüntüle
docker-compose logs -f
```

### Adım 5: Development Servislerini Başlatın

```bash
# Tüm servisleri başlat
pnpm dev

# Veya ayrı ayrı başlat
pnpm dev:api      # Backend API (port 3000)
pnpm dev:web      # Frontend (port 5173)
pnpm dev:worker   # Worker service
```

### Adım 6: Servisleri Kontrol Edin

- **API:** http://localhost:3000
- **Web:** http://localhost:5173
- **RabbitMQ Management:** http://localhost:15672 (guest/guest)
- **MongoDB:** mongodb://localhost:27017
- **Redis:** redis://localhost:6379

---

## ⚙️ Environment Variables

### Root `.env` Dosyası

Tüm servisler root dizindeki `.env` dosyasını kullanır.

#### Database Yapılandırması

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/taskboard
```

#### Redis Yapılandırması

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Opsiyonel, production'da kullanın
REDIS_URL=redis://127.0.0.1:6379
```

#### RabbitMQ Yapılandırması

```env
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE=taskboard_events
```

**Not:** Docker Compose kullanıyorsanız, container isimlerini kullanın:
```env
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

#### SMTP Yapılandırması (Email)

```env
# SMTP Configuration (Gmail örneği)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false                    # true for 465, false for 587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password          # Gmail App Password (16 karakter)
SMTP_FROM=your-email@gmail.com      # Genellikle SMTP_USER ile aynı
```

**Gmail App Password Oluşturma:**
1. Google Account → Security → 2-Step Verification (açık olmalı)
2. App passwords → Select app: "Mail" → Generate
3. 16 karakterlik şifreyi kopyalayın ve `SMTP_PASS` olarak kullanın

**Diğer SMTP Sağlayıcıları:**
- **Outlook:** `smtp-mail.outlook.com:587`
- **SendGrid:** `smtp.sendgrid.net:587`
- **AWS SES:** Bölgeye göre değişir

#### Application Yapılandırması

```env
# Application
APP_URL=http://localhost:5173        # Frontend URL
NODE_ENV=development                 # development | production
LOG_LEVEL=info                       # debug | info | warn | error
```

#### JWT Yapılandırması

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m                # Access token süresi
JWT_REFRESH_EXPIRY=7d                # Refresh token süresi
```

**Production'da:**
- `JWT_SECRET` güçlü ve rastgele bir string olmalı
- En az 32 karakter uzunluğunda olmalı
- Environment variable olarak saklanmalı, kodda hardcode edilmemeli

#### Rate Limiting Yapılandırması

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=10000           # 10 saniye (milisaniye)
RATE_LIMIT_MAX_REQUESTS=100          # Maksimum istek sayısı
```

#### CORS Yapılandırması

```env
# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

Birden fazla origin için virgülle ayırın.

#### OTP Yapılandırması

```env
# OTP
OTP_EXPIRY=300                       # 5 dakika (saniye)
OTP_LENGTH=6                         # OTP uzunluğu (6-8 arası önerilir)
```

### Environment Variable Yükleme

#### API Servisi
- **Konum:** `apps/api/src/config/env.js`
- **Yükleme:** `dotenv.config()` otomatik olarak root `.env` dosyasını yükler

#### Worker Servisi
- **Konum:** `apps/worker/src/config/env.js`
- **Yükleme:** Root dizindeki `.env` dosyasını manuel olarak yükler
- **Path:** `../../../.env` (worker/src/config → root)

#### Web Uygulaması
- **Konum:** `apps/web/src/config/env.js`
- **Yükleme:** Vite environment variables kullanır
- **Format:** `VITE_*` prefix'i gerekli
- **Örnek:** `VITE_API_URL=http://localhost:3000`

---

## 🐳 Docker Yapılandırması

### Docker Compose Servisleri

#### MongoDB

```yaml
mongodb:
  image: mongo:7
  ports:
    - "27017:27017"
  volumes:
    - mongodb_data:/data/db
```

**Kullanım:**
```bash
# MongoDB'ye bağlan
docker exec -it taskboard_mongodb mongosh

# Veritabanını seç
use taskboard

# Koleksiyonları listele
show collections
```

#### Redis

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

**Kullanım:**
```bash
# Redis CLI'ye bağlan
docker exec -it taskboard_redis redis-cli

# Tüm key'leri listele
KEYS *

# Bir key'in değerini görüntüle
GET otp:email:user@example.com
```

#### RabbitMQ

```yaml
rabbitmq:
  image: rabbitmq:3-management-alpine
  ports:
    - "5672:5672"   # AMQP port
    - "15672:15672" # Management UI
  environment:
    RABBITMQ_DEFAULT_USER: guest
    RABBITMQ_DEFAULT_PASS: guest
```

**Management UI:**
- **URL:** http://localhost:15672
- **Username:** guest
- **Password:** guest

**Kullanım:**
```bash
# RabbitMQ Management UI'da:
# - Queues: Tüm kuyrukları görüntüle
# - Exchanges: Exchange'leri görüntüle
# - Connections: Aktif bağlantıları görüntüle
# - Channels: Aktif kanalları görüntüle
```

### Docker Komutları

```bash
# Tüm servisleri başlat
docker-compose up -d

# Servisleri durdur
docker-compose down

# Servisleri yeniden başlat
docker-compose restart

# Logları görüntüle
docker-compose logs -f

# Belirli bir servisin loglarını görüntüle
docker-compose logs -f api

# Servisleri yeniden build et
docker-compose up -d --build

# Volume'ları temizle (DİKKAT: Veriler silinir!)
docker-compose down -v
```

### Production Docker Yapılandırması

Production için aşağıdaki değişiklikleri yapın:

1. **Environment Variables:**
   - `.env` dosyasını production değerleriyle güncelleyin
   - Secrets'ları environment variable olarak geçirin

2. **Security:**
   - RabbitMQ default kullanıcı/şifreyi değiştirin
   - MongoDB authentication ekleyin
   - Redis password ekleyin

3. **Resource Limits:**
   ```yaml
   services:
     api:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

---

## 🔧 Backend (API) Servisi

### Proje Yapısı

```
apps/api/src/
├── config/           # Yapılandırma dosyaları
│   ├── env.js       # Environment variables
│   ├── mongo.js     # MongoDB bağlantısı
│   ├── redis.js     # Redis bağlantısı
│   ├── rabbit.js    # RabbitMQ bağlantısı
│   └── cors.js      # CORS yapılandırması
├── events/          # Event publisher
│   └── publisher.js
├── jobs/            # Scheduled jobs
│   └── daily-report.js
├── loaders/         # Servis yükleyicileri
│   ├── express.js   # Express app setup
│   ├── rabbit.js    # RabbitMQ setup
│   └── socket.js    # Socket.io setup
├── middlewares/     # Express middleware'ler
│   ├── auth.js      # JWT authentication
│   ├── error.js     # Error handling
│   ├── ratelimit.js # Rate limiting
│   ├── rbac.js      # Role-based access control
│   └── validate.js  # Request validation
├── modules/         # Feature modules
│   ├── auth/        # Authentication
│   ├── users/       # User management
│   ├── projects/    # Project management
│   ├── tasks/        # Task management
│   ├── comments/    # Comment management
│   └── teams/       # Team management
├── routes.js        # Main router
├── schemas/         # Mongoose schemas
└── utils/           # Utility functions
```

### Middleware'ler

#### Authentication Middleware

**Konum:** `apps/api/src/middlewares/auth.js`

**Kullanım:**
```javascript
import { authenticate } from '../middlewares/auth.js';

router.get('/protected', authenticate, controller.getProtected);
```

**İşlevler:**
1. `Authorization` header'dan token'ı alır
2. JWT'yi doğrular
3. Token blacklist kontrolü yapar (Redis)
4. `req.user` objesine user bilgilerini ekler

**req.user Yapısı:**
```javascript
{
  userId: "user_id",
  email: "user@example.com",
  role: "admin" | "member"
}
```

#### Rate Limiting Middleware

**Konum:** `apps/api/src/middlewares/ratelimit.js`

**Kullanım:**
```javascript
import { rateLimit } from '../middlewares/ratelimit.js';

// Varsayılan ayarlar
router.post('/api', rateLimit(), controller.handler);

// Özel ayarlar
router.post('/api', rateLimit({
  windowMs: 60000,      // 1 dakika
  maxRequests: 10,     // 10 istek
  key: 'custom-key'    // Özel key
}), controller.handler);
```

**Redis Key Formatı:**
- `ratelimit:{ip}:{userId}` - Varsayılan
- `ratelimit:{custom-key}` - Özel key

**Response Headers:**
- `X-RateLimit-Limit`: Maksimum istek sayısı
- `X-RateLimit-Remaining`: Kalan istek sayısı

#### RBAC Middleware

**Konum:** `apps/api/src/middlewares/rbac.js`

**Kullanım:**
```javascript
import { requireAdmin, requireMember } from '../middlewares/rbac.js';

// Sadece admin
router.delete('/api', requireAdmin, controller.delete);

// Admin veya member
router.get('/api', requireMember, controller.get);
```

#### Validation Middleware

**Konum:** `apps/api/src/middlewares/validate.js`

**Kullanım:**
```javascript
import { validate } from '../middlewares/validate.js';
import { createProjectSchema } from '../modules/projects/validators.js';

router.post('/api/projects', validate(createProjectSchema), controller.create);
```

**Validation Schema (AJV):**
```javascript
export const createProjectSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 3, maxLength: 100 },
    description: { type: 'string', maxLength: 500 }
  }
};
```

### Module Yapısı

Her modül şu dosyalardan oluşur:

- **routes.js:** Express router tanımları
- **controller.js:** Request handler'lar
- **service.js:** Business logic
- **repository.js:** Database operations
- **validators.js:** Request validation schemas

**Örnek: Projects Module**

```javascript
// routes.js
router.post('/', authenticate, requireMember, validate(createSchema), controller.create);

// controller.js
async create(req, res, next) {
  try {
    const project = await projectService.create({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

// service.js
async create(data) {
  // Business logic
  const project = await projectRepository.create(data);
  // Event publishing
  await publishEvent('project.created', { ... });
  return project;
}

// repository.js
async create(data) {
  return Project.create(data);
}
```

### Error Handling

**Konum:** `apps/api/src/middlewares/error.js`

**Kullanım:**
```javascript
// app.js
app.use(errorHandler);
```

**Error Formatı:**
```json
{
  "error": "Error message",
  "status": 400,
  "details": {} // Opsiyonel
}
```

**Custom Error:**
```javascript
throw new Error('Custom error message');
// Status code: 500 (default)

// Status code ile
const error = new Error('Not found');
error.status = 404;
throw error;
```

---

## ⚙️ Worker Servisi

### Proje Yapısı

```
apps/worker/src/
├── config/          # Yapılandırma
│   ├── env.js
│   ├── mongo.js
│   ├── redis.js
│   └── rabbit.js
├── consumers/      # RabbitMQ consumers
│   ├── index.js
│   ├── mailer.consumer.js
│   ├── notifier.consumer.js
│   └── analytics.consumer.js
├── services/       # Business logic
│   ├── mailer.js
│   ├── notify.js
│   └── report.js
├── jobs/           # Scheduled jobs
│   ├── index.js
│   └── nightly-summary.js
└── models/         # Mongoose models
    └── Event.js
```

### RabbitMQ Consumers

#### Mailer Consumer

**Konum:** `apps/worker/src/consumers/mailer.consumer.js`

**Routing Keys:**
- `otp.requested` - OTP email gönderimi
- `team.invitation` - Takım davet email'i

**Queue:** `mailer_queue`

**Kullanım:**
```javascript
// Event payload
{
  email: "user@example.com",
  otp: "123456",
  mode: "login"
}

// Worker işlemi
await sendOTPEmail({ email, otp, mode });
```

**SMTP Yapılandırması:**
- `.env` dosyasındaki `SMTP_*` değişkenleri kullanılır
- SMTP yapılandırılmamışsa **STUB mode** aktif olur
- STUB mode'da email gönderilmez, sadece log'a yazılır

#### Notifier Consumer

**Konum:** `apps/worker/src/consumers/notifier.consumer.js`

**Routing Keys:**
- `task.*` - Tüm task event'leri
- `comment.added` - Yorum eklendi

**Queue:** `notifier_queue`

**İşlem:**
1. Event'i Redis pub/sub'a yayınlar
2. API servisi Redis'ten dinler ve Socket.io ile client'lara gönderir

#### Analytics Consumer

**Konum:** `apps/worker/src/consumers/analytics.consumer.js`

**Routing Keys:**
- `task.*` - Task event'leri
- `comment.*` - Comment event'leri

**Queue:** `analytics_queue`

**İşlem:**
1. Event'i MongoDB'ye kaydeder (`Event` collection)
2. İsteğe bağlı olarak metrikleri günceller

### Scheduled Jobs

**Konum:** `apps/worker/src/jobs/`

**Kullanım (node-cron):**
```javascript
import cron from 'node-cron';

// Her gece 00:00'da çalış
cron.schedule('0 0 * * *', async () => {
  await generateNightlySummary();
});
```

**Cron Formatı:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 ve 7 = Pazar)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Örnekler:**
- `0 0 * * *` - Her gün gece yarısı
- `0 */6 * * *` - Her 6 saatte bir
- `*/30 * * * *` - Her 30 dakikada bir

### Mailer Service

**Konum:** `apps/worker/src/services/mailer.js`

**Fonksiyonlar:**
- `sendEmail({ to, subject, html, text })` - Genel email gönderimi
- `sendOTPEmail({ email, otp, mode, name })` - OTP email'i
- `sendTeamInvitationEmail({ email, teamName, inviterName, role, teamId })` - Davet email'i

**Email Template:**
- HTML formatında
- Responsive tasarım
- Branding (TaskBoard)

**SMTP Bağlantı Testi:**
Worker başlatıldığında SMTP bağlantısı otomatik test edilir:
- Başarılı: `✅ [MAILER] SMTP connection verified successfully`
- Başarısız: `❌ [MAILER] SMTP connection verification failed`

---

## 💻 Frontend (Web) Uygulaması

### Proje Yapısı

```
apps/web/src/
├── api/             # API client functions
│   ├── client.js   # Axios instance
│   ├── auth.api.js
│   ├── projects.api.js
│   └── ...
├── app/            # App configuration
│   ├── providers/  # Context providers
│   │   ├── query-client.jsx
│   │   ├── socket-provider.jsx
│   │   └── theme-provider.jsx
│   └── routes/     # Route definitions
├── components/     # Reusable components
│   ├── common/     # Common components
│   └── ui/         # Shadcn UI components
├── features/       # Feature modules
│   ├── auth/
│   ├── projects/
│   ├── tasks/
│   └── teams/
├── hooks/          # Custom React hooks
│   ├── use-auth.js
│   ├── use-role.js
│   └── use-socket.js
├── layouts/        # Layout components
├── lib/            # Utility libraries
├── store/          # Zustand stores
└── styles/         # Global styles
```

### TanStack Query Kullanımı

#### Query Client Yapılandırması

**Konum:** `apps/web/src/app/providers/query-client.jsx`

**Varsayılan Ayarlar:**
```javascript
{
  queries: {
    refetchOnWindowFocus: false,  // Pencere focus olduğunda refetch yapma
    retry: 1,                     // 1 kez retry
    onError: (error) => { ... }   // Error handling
  },
  mutations: {
    retry: false,                  // Mutation'ları retry etme
    onError: (error) => { ... }
  }
}
```

#### useQuery Kullanımı

```javascript
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../../../api/projects.api.js';

function ProjectsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],  // Cache key
    queryFn: () => projectsAPI.getAll(),  // Data fetching function
    retry: (failureCount, error) => {
      // 401 hatasında retry yapma
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

**Query Key Stratejisi:**
- `['projects']` - Tüm projeler
- `['projects', { status: 'active' }]` - Filtrelenmiş projeler
- `['project', id]` - Tek bir proje
- `['tasks', { projectId: id }]` - Projeye ait görevler

#### useMutation Kullanımı

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateProject() {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: () => {
      // Cache'i invalidate et (yeniden fetch yapar)
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      // Error handling
      console.error('Failed to create project:', error);
    },
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

#### Optimistic Updates

```javascript
const updateMutation = useMutation({
  mutationFn: (data) => tasksAPI.update(id, data),
  onMutate: async (newData) => {
    // İyimser güncelleme
    await queryClient.cancelQueries(['task', id]);
    const previousTask = queryClient.getQueryData(['task', id]);
    queryClient.setQueryData(['task', id], { ...previousTask, ...newData });
    return { previousTask };
  },
  onError: (err, newData, context) => {
    // Hata durumunda geri al
    queryClient.setQueryData(['task', id], context.previousTask);
  },
  onSettled: () => {
    // Her durumda refetch yap
    queryClient.invalidateQueries(['task', id]);
  },
});
```

#### Query Invalidation

```javascript
// Tek bir query'yi invalidate et
queryClient.invalidateQueries(['project', id]);

// Tüm project query'lerini invalidate et
queryClient.invalidateQueries(['projects']);

// Tüm query'leri invalidate et
queryClient.invalidateQueries();
```

### Socket.io Client Kullanımı

#### Socket Provider

**Konum:** `apps/web/src/app/providers/socket-provider.jsx`

**Kullanım:**
```javascript
import { SocketProvider } from './providers/socket-provider.jsx';

function App() {
  return (
    <SocketProvider>
      {/* App content */}
    </SocketProvider>
  );
}
```

#### useSocket Hook

**Konum:** `apps/web/src/hooks/use-socket.js`

**Kullanım:**
```javascript
import { useSocketEvent } from '../../../hooks/use-socket.js';

function TaskDetail({ taskId }) {
  const queryClient = useQueryClient();

  // Socket event dinle
  useSocketEvent('task.updated', (data) => {
    // Task güncellendiğinde cache'i invalidate et
    queryClient.invalidateQueries(['task', taskId]);
  });

  // Room'a katıl
  useSocketEvent('room:join', () => {
    // Room'a katıldı
  });

  return <div>{/* Component */}</div>;
}
```

**Socket Events:**
- `task.created` - Yeni görev oluşturuldu
- `task.updated` - Görev güncellendi
- `task.assigned` - Görev atandı
- `comment.added` - Yorum eklendi
- `notification` - Bildirim geldi

### Zustand State Management

#### Auth Store

**Konum:** `apps/web/src/store/auth.store.js`

**Kullanım:**
```javascript
import { useAuthStore } from '../store/auth.store.js';

function Component() {
  const { user, accessToken, login, logout } = useAuthStore();

  return (
    <div>
      {user ? (
        <div>Welcome, {user.name}</div>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

**Store Methods:**
- `login(user, tokens)` - Kullanıcıyı giriş yaptır
- `logout()` - Kullanıcıyı çıkış yaptır
- `updateToken(accessToken)` - Access token'ı güncelle
- `refreshToken()` - Token'ı yenile

### API Client (Axios)

**Konum:** `apps/web/src/api/client.js`

**Özellikler:**
- Automatic token injection
- Token refresh on 401
- Error handling
- Request/Response interceptors

**Kullanım:**
```javascript
import client from './client.js';

// Token otomatik eklenir
const response = await client.get('/api/projects');

// 401 hatasında otomatik token refresh
// Refresh başarısızsa logout ve redirect
```

---

## 🐰 RabbitMQ Kullanımı

### Exchange Yapılandırması

**Exchange:** `taskboard_events`
**Type:** `topic`
**Durable:** `true`

**Yapılandırma:**
```javascript
// apps/api/src/config/rabbit.js
await channel.assertExchange('taskboard_events', 'topic', {
  durable: true
});
```

### Event Publishing

**Konum:** `apps/api/src/events/publisher.js`

**Kullanım:**
```javascript
import { publishEvent } from '../events/publisher.js';

await publishEvent('task.created', {
  taskId: task._id.toString(),
  projectId: task.projectId.toString(),
  userId: task.createdBy.toString(),
  timestamp: new Date().toISOString()
});
```

**Routing Key Formatı:**
- `task.created` - Görev oluşturuldu
- `task.updated` - Görev güncellendi
- `task.assigned` - Görev atandı
- `comment.added` - Yorum eklendi
- `otp.requested` - OTP istendi
- `team.invitation` - Takım daveti

### Queue Yapılandırması

#### Mailer Queue

```javascript
// apps/worker/src/consumers/mailer.consumer.js
const queue = 'mailer_queue';
await channel.assertQueue(queue, { durable: true });
await channel.bindQueue(queue, 'taskboard_events', 'otp.requested');
await channel.bindQueue(queue, 'taskboard_events', 'team.invitation');
```

#### Notifier Queue

```javascript
const queue = 'notifier_queue';
await channel.assertQueue(queue, { durable: true });
await channel.bindQueue(queue, 'taskboard_events', 'task.*');
await channel.bindQueue(queue, 'taskboard_events', 'comment.added');
```

#### Analytics Queue

```javascript
const queue = 'analytics_queue';
await channel.assertQueue(queue, { durable: true });
await channel.bindQueue(queue, 'taskboard_events', 'task.*');
await channel.bindQueue(queue, 'taskboard_events', 'comment.*');
```

### Consumer Pattern

```javascript
await channel.consume(queue, async (msg) => {
  if (!msg) return;

  try {
    const content = JSON.parse(msg.content.toString());
    const routingKey = msg.fields.routingKey;

    // İşlemi yap
    await processEvent(routingKey, content);

    // Başarılı işlem - mesajı acknowledge et
    channel.ack(msg);
  } catch (error) {
    logger.error('Consumer error:', error);
    // Hata durumunda - mesajı requeue et
    channel.nack(msg, false, true);
  }
});
```

### Message Persistence

Mesajlar kalıcı olarak işaretlenir:
```javascript
ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
  persistent: true
});
```

### RabbitMQ Management UI

**URL:** http://localhost:15672
**Credentials:** guest/guest

**Kullanım:**
1. **Queues:** Tüm kuyrukları görüntüle
2. **Exchanges:** Exchange'leri görüntüle
3. **Bindings:** Queue-Exchange bağlantılarını görüntüle
4. **Messages:** Mesajları incele
5. **Connections:** Aktif bağlantıları görüntüle

---

## 🔴 Redis Kullanımı

### Bağlantı Yapılandırması

**Konum:** `apps/api/src/config/redis.js`

```javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: undefined, // Opsiyonel
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});
```

### Key Yapısı

#### OTP Storage
```
otp:email:{email} → OTP code (TTL: 5 min)
otp:phone:{phone} → OTP code (TTL: 5 min)
```

**Kullanım:**
```javascript
// OTP kaydet
await redis.setex(`otp:email:${email}`, 300, otpCode);

// OTP oku
const storedOtp = await redis.get(`otp:email:${email}`);

// OTP sil
await redis.del(`otp:email:${email}`);
```

#### Token Storage
```
refresh:{userId} → Refresh token (TTL: 7 days)
blacklist:{token} → "1" (TTL: token expiry)
```

**Kullanım:**
```javascript
// Refresh token kaydet
await redis.setex(`refresh:${userId}`, 604800, refreshToken);

// Token blacklist'e ekle
await redis.setex(`blacklist:${token}`, 900, '1');

// Blacklist kontrolü
const isBlacklisted = await redis.get(`blacklist:${token}`);
```

#### Rate Limiting
```
ratelimit:otp:{identifier} → Request count (TTL: 15 min)
ratelimit:{ip}:{userId} → Request count (TTL: 10 sec)
```

**Kullanım:**
```javascript
const key = `ratelimit:otp:${email}`;
const current = await redis.incr(key);

if (current === 1) {
  await redis.expire(key, 900); // 15 dakika
}

if (current > 5) {
  throw new Error('Rate limit exceeded');
}
```

### Redis Commands

```bash
# Redis CLI'ye bağlan
docker exec -it taskboard_redis redis-cli

# Tüm key'leri listele
KEYS *

# Pattern ile key'leri listele
KEYS otp:*

# Key'in değerini oku
GET otp:email:user@example.com

# Key'in TTL'ini görüntüle
TTL otp:email:user@example.com

# Key'i sil
DEL otp:email:user@example.com

# Key'in varlığını kontrol et
EXISTS otp:email:user@example.com

# Tüm key'leri temizle (DİKKAT!)
FLUSHALL
```

### Pub/Sub (Notifications)

**Publisher (Worker):**
```javascript
await redis.publish('notifications', JSON.stringify({
  type: 'task.updated',
  data: { taskId, userId }
}));
```

**Subscriber (API):**
```javascript
const subscriber = redis.duplicate();
await subscriber.subscribe('notifications');

subscriber.on('message', (channel, message) => {
  const notification = JSON.parse(message);
  // Socket.io ile client'lara gönder
  io.emit('notification', notification);
});
```

---

## 🔍 TanStack Query Kullanımı

### Query Client Provider

**Konum:** `apps/web/src/app/providers/query-client.jsx`

```javascript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 dakika
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

### useQuery Örnekleri

#### Basit Query
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: () => projectsAPI.getAll()
});
```

#### Parametreli Query
```javascript
const { data } = useQuery({
  queryKey: ['project', id],
  queryFn: () => projectsAPI.getById(id),
  enabled: !!id // id varsa query'yi çalıştır
});
```

#### Filtreli Query
```javascript
const { data } = useQuery({
  queryKey: ['projects', { status: 'active', search: query }],
  queryFn: () => projectsAPI.getAll({ status: 'active', search: query })
});
```

#### Dependent Query
```javascript
const { data: project } = useQuery({
  queryKey: ['project', id],
  queryFn: () => projectsAPI.getById(id)
});

const { data: tasks } = useQuery({
  queryKey: ['tasks', { projectId: id }],
  queryFn: () => tasksAPI.getAll({ projectId: id }),
  enabled: !!project // project yüklendikten sonra çalıştır
});
```

### useMutation Örnekleri

#### Create Mutation
```javascript
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: (data) => projectsAPI.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['projects']);
  }
});
```

#### Update Mutation
```javascript
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => projectsAPI.update(id, data),
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries(['project', variables.id]);
    queryClient.invalidateQueries(['projects']);
  }
});
```

#### Delete Mutation
```javascript
const deleteMutation = useMutation({
  mutationFn: (id) => projectsAPI.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries(['projects']);
  }
});
```

### Query Invalidation Stratejileri

```javascript
// Tek bir query'yi invalidate et
queryClient.invalidateQueries(['project', id]);

// Tüm project query'lerini invalidate et
queryClient.invalidateQueries(['projects']);

// Pattern ile invalidate et
queryClient.invalidateQueries({ queryKey: ['projects'] });

// Tüm query'leri invalidate et
queryClient.invalidateQueries();
```

### Optimistic Updates

```javascript
const updateMutation = useMutation({
  mutationFn: (data) => tasksAPI.update(id, data),
  onMutate: async (newData) => {
    // İptal et
    await queryClient.cancelQueries(['task', id]);
    
    // Önceki değeri sakla
    const previousTask = queryClient.getQueryData(['task', id]);
    
    // İyimser güncelleme
    queryClient.setQueryData(['task', id], (old) => ({
      ...old,
      ...newData
    }));
    
    return { previousTask };
  },
  onError: (err, newData, context) => {
    // Hata durumunda geri al
    queryClient.setQueryData(['task', id], context.previousTask);
  },
  onSettled: () => {
    // Her durumda refetch
    queryClient.invalidateQueries(['task', id]);
  }
});
```

---

## 🔌 Socket.io Kullanımı

### Server-Side (API)

#### Socket.io Setup

**Konum:** `apps/api/src/loaders/socket.js`

```javascript
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true
  },
  path: '/socket.io'
});

// Authentication middleware
io.use(authenticateSocket);

// Event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.userId);
  
  socket.on('room:join', (roomId) => {
    socket.join(`project:${roomId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
```

#### Room Management

```javascript
// Room'a katıl
socket.join(`project:${projectId}`);

// Room'dan çık
socket.leave(`project:${projectId}`);

// Room'a mesaj gönder
io.to(`project:${projectId}`).emit('task.updated', data);

// Tüm client'lara gönder
io.emit('notification', data);

// Sadece bir client'a gönder
socket.emit('notification', data);
```

#### Event Handlers

**Konum:** `apps/api/src/sockets/handlers/`

```javascript
// tasks.js
export function setupTaskHandlers(io, socket) {
  socket.on('task:subscribe', (taskId) => {
    socket.join(`task:${taskId}`);
  });
  
  socket.on('task:unsubscribe', (taskId) => {
    socket.leave(`task:${taskId}`);
  });
}

// Task güncellendiğinde
function emitTaskUpdated(io, taskId, data) {
  io.to(`task:${taskId}`).emit('task.updated', data);
}
```

### Client-Side (Web)

#### Socket Connection

**Konum:** `apps/web/src/lib/socket.js`

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken
  },
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000
});
```

#### useSocket Hook

**Konum:** `apps/web/src/hooks/use-socket.js`

```javascript
import { useEffect } from 'react';
import { useSocket } from './use-socket.js';

function Component() {
  const socket = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('task.updated', (data) => {
      console.log('Task updated:', data);
    });
    
    return () => {
      socket.off('task.updated');
    };
  }, [socket]);
}
```

#### useSocketEvent Hook

```javascript
import { useSocketEvent } from '../../../hooks/use-socket.js';

function TaskDetail({ taskId }) {
  const queryClient = useQueryClient();
  
  // Event dinle ve cache'i invalidate et
  useSocketEvent('task.updated', () => {
    queryClient.invalidateQueries(['task', taskId]);
  });
  
  return <div>{/* Component */}</div>;
}
```

### Socket Events

#### Client → Server
- `room:join` - Room'a katıl
- `room:leave` - Room'dan çık
- `task:subscribe` - Task güncellemelerine abone ol
- `notification:subscribe` - Bildirimlere abone ol

#### Server → Client
- `task.created` - Yeni görev oluşturuldu
- `task.updated` - Görev güncellendi
- `task.assigned` - Görev atandı
- `comment.added` - Yorum eklendi
- `notification` - Bildirim geldi

---

## 🔐 Authentication Flow

Detaylı authentication flow için `AUTH_FLOW.md` dosyasına bakın.

### Özet

1. **OTP İsteği:**** `POST /api/auth/otp/request`
2. **OTP Doğrulama:** `POST /api/auth/otp/verify`
3. **Token Kullanımı:** `Authorization: Bearer {token}`
4. **Token Yenileme:** `POST /api/auth/refresh`
5. **Logout:** `POST /api/auth/logout`

### Token Yapısı

**Access Token:**
- Süre: 15 dakika
- Payload: `{ userId, email, role }`
- Kullanım: API isteklerinde

**Refresh Token:**
- Süre: 7 gün
- Storage: Redis (`refresh:{userId}`)
- Kullanım: Access token yenileme

### Token Refresh Mekanizması

**Frontend (Axios Interceptor):**
```javascript
// 401 hatasında otomatik refresh
if (error.response?.status === 401) {
  const newToken = await refreshToken();
  // İsteği yeni token ile tekrar dene
  return client.request(originalRequest);
}
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/otp/request      # OTP iste
POST   /api/auth/otp/verify       # OTP doğrula
POST   /api/auth/refresh          # Token yenile
POST   /api/auth/logout           # Çıkış yap
```

### Projects

```
GET    /api/projects              # Projeleri listele
GET    /api/projects/:id          # Proje detayı
POST   /api/projects              # Proje oluştur
PUT    /api/projects/:id          # Proje güncelle
DELETE /api/projects/:id          # Proje sil
```

### Tasks

```
GET    /api/tasks                 # Görevleri listele
GET    /api/tasks/:id             # Görev detayı
POST   /api/tasks                 # Görev oluştur
PUT    /api/tasks/:id             # Görev güncelle
DELETE /api/tasks/:id             # Görev sil
```

### Comments

```
GET    /api/comments/task/:taskId # Görev yorumları
POST   /api/comments              # Yorum oluştur
PUT    /api/comments/:id          # Yorum güncelle
DELETE /api/comments/:id          # Yorum sil
```

### Teams

```
GET    /api/teams                 # Takımları listele
GET    /api/teams/:id             # Takım detayı
POST   /api/teams                 # Takım oluştur
PUT    /api/teams/:id             # Takım güncelle
DELETE /api/teams/:id             # Takım sil
POST   /api/teams/:id/invite      # Üye davet et
POST   /api/teams/:id/accept      # Daveti kabul et
POST   /api/teams/:id/decline     # Daveti reddet
```

### Users

```
GET    /api/users/me              # Kullanıcı bilgileri
PUT    /api/users/me              # Kullanıcı güncelle
GET    /api/users/me/sessions     # Aktif oturumlar
```

---

## 🔧 Troubleshooting

### Mail Gönderilmiyor

**Sorun:** Email'ler gönderilmiyor

**Çözüm:**
1. `.env` dosyasında `SMTP_USER` ve `SMTP_PASS` kontrol edin
2. Gmail kullanıyorsanız App Password oluşturun
3. Worker loglarını kontrol edin:
   ```bash
   docker-compose logs -f worker
   ```
4. SMTP bağlantı testini çalıştırın:
   ```bash
   cd apps/worker && node test-email.js
   ```

### RabbitMQ Bağlantı Hatası

**Sorun:** `RabbitMQ connection error`

**Çözüm:**
1. RabbitMQ container'ının çalıştığını kontrol edin:
   ```bash
   docker-compose ps rabbitmq
   ```
2. `.env` dosyasında `RABBITMQ_URL` kontrol edin
3. RabbitMQ Management UI'ya erişin: http://localhost:15672
4. Logları kontrol edin:
   ```bash
   docker-compose logs rabbitmq
   ```

### Redis Bağlantı Hatası

**Sorun:** `Redis connection error`

**Çözüm:**
1. Redis container'ının çalıştığını kontrol edin:
   ```bash
   docker-compose ps redis
   ```
2. Redis CLI ile bağlantıyı test edin:
   ```bash
   docker exec -it taskboard_redis redis-cli ping
   ```
3. `.env` dosyasında `REDIS_HOST` ve `REDIS_PORT` kontrol edin

### MongoDB Bağlantı Hatası

**Sorun:** `MongoDB connection error`

**Çözüm:**
1. MongoDB container'ının çalıştığını kontrol edin:
   ```bash
   docker-compose ps mongodb
   ```
2. MongoDB'ye bağlanmayı test edin:
   ```bash
   docker exec -it taskboard_mongodb mongosh
   ```
3. `.env` dosyasında `MONGODB_URI` kontrol edin

### Token Refresh Hatası

**Sorun:** Token refresh çalışmıyor

**Çözüm:**
1. Redis'te refresh token'ın varlığını kontrol edin:
   ```bash
   docker exec -it taskboard_redis redis-cli
   KEYS refresh:*
   ```
2. Token expiry sürelerini kontrol edin (`.env`)
3. Frontend console'da hata mesajlarını kontrol edin

### Socket.io Bağlantı Hatası

**Sorun:** Real-time güncellemeler çalışmıyor

**Çözüm:**
1. Socket.io server'ın çalıştığını kontrol edin
2. CORS ayarlarını kontrol edin (`.env`)
3. Browser console'da WebSocket hatalarını kontrol edin
4. Network tab'da WebSocket bağlantısını kontrol edin

### TanStack Query Cache Sorunları

**Sorun:** Eski veriler gösteriliyor

**Çözüm:**
1. Query key'lerini kontrol edin (parametreler doğru mu?)
2. Cache'i manuel invalidate edin:
   ```javascript
   queryClient.invalidateQueries(['projects']);
   ```
3. DevTools'ta cache durumunu kontrol edin

---

## 💡 Best Practices

### Backend

1. **Error Handling:**
   - Tüm async fonksiyonlarda try-catch kullanın
   - Anlamlı error mesajları döndürün
   - Error status code'larını doğru kullanın

2. **Validation:**
   - Tüm input'ları validate edin
   - AJV schema'larını kullanın
   - Custom error mesajları ekleyin

3. **Security:**
   - Tüm protected route'larda authentication kontrol edin
   - RBAC middleware'lerini kullanın
   - Rate limiting uygulayın
   - SQL injection ve XSS koruması (MongoDB zaten korumalı)

4. **Performance:**
   - Database query'lerini optimize edin
   - Gereksiz population'lardan kaçının
   - Redis cache kullanın
   - Pagination uygulayın

### Frontend

1. **State Management:**
   - Server state için TanStack Query kullanın
   - Client state için Zustand kullanın
   - Gereksiz state'lerden kaçının

2. **Data Fetching:**
   - Query key'lerini doğru yapılandırın
   - Dependent query'ler için `enabled` kullanın
   - Optimistic updates kullanın

3. **Error Handling:**
   - Tüm query ve mutation'larda error handling ekleyin
   - User-friendly error mesajları gösterin
   - 401 hatalarını özel olarak handle edin

4. **Performance:**
   - Lazy loading kullanın
   - Code splitting uygulayın
   - Gereksiz re-render'lardan kaçının (React.memo, useMemo)

### RabbitMQ

1. **Message Design:**
   - Mesajları idempotent yapın
   - Gerekli tüm bilgileri mesajda bulundurun
   - Versioning ekleyin (gelecekte)

2. **Error Handling:**
   - Consumer'larda try-catch kullanın
   - Hata durumunda mesajı requeue edin
   - Dead letter queue kullanın (production)

3. **Monitoring:**
   - RabbitMQ Management UI'ı düzenli kontrol edin
   - Queue length'leri izleyin
   - Message rate'leri takip edin

### Redis

1. **Key Naming:**
   - Consistent naming convention kullanın
   - Namespace'ler kullanın (`otp:`, `refresh:`, vb.)
   - TTL'leri doğru ayarlayın

2. **Memory Management:**
   - Gereksiz key'leri temizleyin
   - TTL'leri kullanın
   - Memory limit'leri ayarlayın (production)

3. **Operations:**
   - Atomic operations kullanın
   - Pipeline kullanın (çoklu işlem)
   - Pub/Sub için duplicate client kullanın

---

## 📚 Ek Kaynaklar

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Redis Documentation](https://redis.io/docs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Socket.io Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📝 Changelog

### v1.0.0
- İlk sürüm
- OTP authentication
- Project & Task management
- Real-time updates
- Team management
- Email notifications

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje değerlendirme amaçlıdır.

---

**Son Güncelleme:** 2024-01-18
**Versiyon:** 1.0.0
