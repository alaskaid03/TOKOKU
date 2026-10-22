# TokoKu — Engineering Handover Handbook
**Versi:** 1.0  |  **Tanggal:** 23 Okt 2026  |  **CTO Handover untuk Tim Engineering Baru**
**Lokasi repo:** `C:/Users/ALASKAID/tokoku`  |  **Dev ports:** Backend `3001`, Frontend `5173`
**Status:** Production-ready MVP, 19/19 tests passing, audit & refactor selesai

---

## 1. Project Overview

| Item | Detail |
|---|---|
| **Nama** | TokoKu — Toko Online |
| **Tujuan** | Pemilik toko kelola produk/kategori, pelanggan belanja, transaksi + laporan |
| **Tipe** | Fullstack MVP, siap komersial setelah debt prioritas dikerjakan |
| **Stack** | Node 20 + Express 4 + Prisma 5 + SQLite(dev)/Postgres(prod) + JWT + bcryptjs + Multer + Zod + Vitest | React 18 + Vite 5 + Tailwind 3 + Zustand + Axios |
| **Build** | Frontend `233 kB / 77 kB gzip`, Backend `~5ms /products`, `16→19 tests` setelah refactor |
| **Akun seed** | `admin@tokoku.com / password123` (ADMIN), `customer@test.com / password123` (CUSTOMER) — **WAJIB ganti sebelum prod** |
| **Repo state** | `README.md`, `docker-compose.yml`, `Dockerfile` backend+frontend, `nginx.conf`, `.env.production.example`, `prisma/seed.js`, `tests/api.test.js` |

**Apa yang sudah jalan:** Auth (register/login/me), kategori CRUD, produk CRUD+upload+search+pagination+sort, cart, order dengan `prisma.$transaction`, admin stats, frontend 7 halaman (Login, Register, Products, AdminProducts, Dashboard, Cart, Orders), hardening (headers, CORS whitelist, rate limit, upload whitelist, zod validation, centralized error handler, 404).

**Apa yang belum:** Payment gateway, email, S3, refresh token httpOnly, Postgres, HTTPS, Sentry, CI/CD, notifikasi, pagination UI, search filter kategori (lihat Roadmap).

---

## 2. Arsitektur Sistem

### Diagram Alur
```
[Browser/React :5173] --(Vite proxy /api)--> [Express :3001] --(Prisma Client)--> [SQLite dev.db / Postgres prod]
        |                       |                           |
   Zustand + Axios         JWT auth + Zod             8 Tabel Prisma
   React Router            Multer uploads             StockLog, Payment, OrderItem
```

### Request Lifecycle
```
Request -> security headers -> CORS -> json(100kb) -> rateLimit(200/15m) -> logger -> route -> auth/adminOnly?
  -> zod parseOr400 (400 jika invalid) -> prisma (transaction jika order) -> json response
  -> errorHandler (P2025->404, P2002->409, LIMIT->400, else 500) / notFound (404)
```

### Auth Flow
```
Register: zod registerSchema -> findUnique(email) -> bcrypt.hash(10) -> create role=CUSTOMER (force, ignore client role) -> signToken -> {token, user}
Login: zod loginSchema -> findUnique -> bcrypt.compare -> signToken
Guard: auth middleware: Authorization: Bearer <token> --regex case-insensitive--> verifyToken(getSecret()) -> req.user {id, role, email}
       adminOnly: req.user.role === 'ADMIN' else 403
Frontend: Zustand persist token+user di localStorage, axios interceptor inject Bearer, 401 interceptor clear storage
```

### File Upload
```
Multer: disk `uploads/`, whitelist mimetype jpeg/png/webp (+ ext check), 2MB/file, 5 files, sanitize filename, served `/uploads` static maxAge 1d
```

### Order Transaction
```
POST /api/orders (auth): orderCreateSchema -> cart.findMany -> cek stock -> subtotal reduce -> discount = min(discount, subtotal) anti-negative -> total
  -> prisma.$transaction: order.create (items + payment) + product.update stock decrement + stockLog + cartItem.deleteMany
  -> return order {orderNumber, items, payment}
Race condition: di-handle transaction; prod Postgres butuh `SELECT ... FOR UPDATE` jika scale tinggi.
```

---

## 3. Struktur Folder

```
tokoku/
├── README.md                          # Quick start, Docker, backup, panduan admin
├── docker-compose.yml                 # backend:3001 + frontend:80, volume db+uploads
├── .gitignore
├── backend/
│   ├── Dockerfile                     # node:20-alpine, npm ci, prisma generate
│   ├── package.json                   # scripts: dev/start/db:generate/db:push/db:seed/test
│   ├── vitest.config.js
│   ├── .env                           # dev (JWT_SECRET, DATABASE_URL file:./prisma/dev.db)
│   ├── .env.production.example        # template prod (WAJIB isi JWT_SECRET 64hex)
│   ├── .env.production                # placeholder — GANTI sebelum prod
│   ├── prisma/
│   │   ├── schema.prisma              # 8 model + index
│   │   ├── seed.js                    # admin, customer, 3 kategori, 4 produk
│   │   ├── dev.db                     # SQLite (156KB, gitignore di prod)
│   │   └── dev.db.backup-*            # backup file
│   ├── src/
│   │   ├── server.js                  # headers, CORS, json limit, static uploads, rateLimit, logger, health, routes, notFound, errorHandler
│   │   ├── config/db.js               # PrismaClient singleton
│   │   ├── middleware/auth.js         # auth + adminOnly
│   │   ├── middleware/error.js        # notFound + errorHandler
│   │   ├── middleware/upload.js       # multer whitelist + sanitize
│   │   ├── utils/jwt.js               # getSecret lazy + sign/verify
│   │   ├── utils/slug.js              # toSlug, genSKU, genOrderNumber
│   │   ├── utils/http.js              # asyncHandler, ok/created/fail
│   │   ├── utils/validate.js          # zod schemas + parseOr400
│   │   └── routes/
│   │       ├── auth.js                # POST register/login, GET /me, PUT /me
│   │       ├── products.js            # GET /?search&category&page&limit&sort, GET /:id, POST, PUT, DELETE
│   │       ├── categories.js          # GET /, POST, DELETE /:id
│   │       ├── cart.js                # GET /, POST, DELETE /:productId, DELETE /
│   │       ├── orders.js              # POST /, GET /my, GET /, GET /:id, PATCH /:id/status
│   │       └── admin.js               # GET /stats (auth+adminOnly)
│   ├── tests/api.test.js              # 19 tests (health, auth, products, admin, cart/order, unit)
│   └── uploads/.gitkeep
├── frontend/
│   ├── Dockerfile                     # multi-stage node build -> nginx
│   ├── nginx.conf                     # SPA + /api proxy -> backend:3001
│   ├── package.json                   # react, vite, tailwind, zustand, axios
│   ├── vite.config.js                 # proxy /api -> localhost:3001
│   ├── tailwind.config.js / postcss.config.js / index.html
│   ├── src/
│   │   ├── main.jsx / index.css / App.jsx  # BrowserRouter + Guard (auth/admin)
│   │   ├── lib/api.js                 # axios base /api + Bearer + 401 interceptor
│   │   ├── stores/auth.js             # Zustand persistAuth, login/register/logout/setAuth
│   │   ├── hooks/useApi.js            # useApi(fn) -> {data, loading, error, exec}
│   │   ├── components/Navbar.jsx      # Links + admin guard + handleLogout
│   │   └── pages/
│   │       ├── Login.jsx / Register.jsx
│   │       ├── Products.jsx           # search + loading/error/empty + addToCart
│   │       ├── AdminProducts.jsx      # form + table + delete (admin)
│   │       ├── Dashboard.jsx          # stats + recentOrders
│   │       ├── Cart.jsx               # list + checkout
│   │       └── Orders.jsx             # history
│   └── dist/                          # vite build output
└── docs/
    ├── HANDOVER.md                    # file ini
    ├── ERD.md                         # ERD + relasi
    └── API.md                         # API docs
```

**Kenapa begini:** Flat routes+middleware+utils mudah untuk MVP; jika tim >3 orang, ekstrak `src/services/` (authService, productService, orderService) dan `src/controllers/` dari routes. `validate.js` sudah siap, tinggal tambah schema baru di sana.

---

## 4. Database ERD Explanation

### Schema (prisma/schema.prisma) — SQLite `String` untuk role/status (SQLite tidak support enum)

```
User 1--* CartItem *--1 Product *--1 Category
User 1--* Order 1--* OrderItem *--1 Product
User 1--* Order 1--1 Payment
Product 1--* StockLog
Product 1--* OrderItem
```

| Tabel | PK | FK | Index | Catatan |
|---|---|---|---|---|
| **User** | id cuid | — | email @unique, @@index(role) | password bcrypt hash, role String CUSTOMER/ADMIN default CUSTOMER |
| **Category** | id | — | name @unique, slug @unique | _count products |
| **Product** | id | categoryId -> Category | categoryId, price, stock, createdAt; slug @unique, sku @unique | images String JSON array, isActive bool, weight Int |
| **CartItem** | id | userId, productId onDelete Cascade | userId, @@unique(userId,productId) | quantity default 1 |
| **Order** | id | userId -> User | userId, status, paymentStatus, createdAt; orderNumber @unique | status/paymentStatus String, subtotal/discount/shippingCost/total Int (rupiah, no float), shippingAddress String |
| **OrderItem** | id | orderId Cascade, productId | orderId | snapshot price+subtotal saat order |
| **Payment** | id | orderId @unique Cascade | — | amount, method, status, transactionId, paidAt |
| **StockLog** | id | productId Cascade | productId | change Int (+/-), reason String |

**Relasi penting:**
- `CartItem @@unique(userId,productId)` + upsert — 1 baris per user+produk
- `Order -> OrderItem -> Product` + `Order -> Payment` — 1 order punya N item + 1 payment
- Semua `onDelete: Cascade` untuk CartItem/OrderItem/Payment/StockLog agar hapus user/produk/order tidak orphan
- `Order` pakai `$transaction` — create order + decrement stock + stockLog + clear cart atomik

**Index rationale:** `Product[categoryId, price, stock, createdAt]` untuk filter/sort/pagination; `Order[userId, status, paymentStatus, createdAt]` untuk admin filter & sort; `CartItem[userId]` untuk GET /cart; `StockLog[productId]` untuk audit.

**Migrasi ke Postgres:** Ubah `datasource db { provider="postgresql" url=env("DATABASE_URL") }`, `DATABASE_URL="postgresql://user:pass@host:5432/tokoku?schema=public"`, lalu `npx prisma db push` / `migrate`. Ganti `contains` filter jika butuh `mode: insensitive`.

---

## 5. API Documentation

**Base:** `http://localhost:3001` (dev), `/api` via frontend proxy. **Auth:** `Authorization: Bearer <JWT>` kecuali GET /products, GET /products/:id, GET /categories, GET /health, POST /auth/*.

| Method | Path | Auth | Body/Query | Success | Error |
|---|---|---|---|---|---|
| GET | /api/health | — | — | 200 {status, app, time} | — |
| POST | /api/auth/register | — | {name 2+, email, password 6+} zod | 200 {token, user} role selalu CUSTOMER | 400 validate/email exists, 500 |
| POST | /api/auth/login | — | {email, password} | 200 {token, user} | 400 not found / wrong pass |
| GET | /api/auth/me | auth | — | 200 user | 401 |
| PUT | /api/auth/me | auth | {name, phone, address} | 200 user | 400 name <2 |
| GET | /api/categories | — | — | 200 [Category + _count] | — |
| POST | /api/categories | admin | {name 2+, description} | 200 Category | 400/401/403 |
| DELETE | /api/categories/:id | admin | — | 200 {deleted} | 404 P2025 |
| GET | /api/products | — | ?search & category & page(1) & limit(1-50,12) & sort(newest/price_asc/price_desc) | 200 {products, total, page, totalPages} | 400 zod limit>50 |
| GET | /api/products/:id | — | — | 200 Product+category | 404 |
| POST | /api/products | admin | multipart: name, description, price, stock, categoryId, weight, comparePrice, images[0..5] (2MB each, jpg/png/webp) | 200 Product | 400 zod/whitelist, 401/403 |
| PUT | /api/products/:id | admin | same fields + isActive | 200 Product | 400/404 |
| DELETE | /api/products/:id | admin | — | 200 {deleted} | 404 |
| GET | /api/cart | auth | — | 200 [CartItem+product+category] | 401 |
| POST | /api/cart | auth | {productId, quantity 1-100} zod | 200 CartItem | 400 stock/validate, 404 product |
| DELETE | /api/cart/:productId | auth | — | 200 {removed} | 404 P2025 |
| DELETE | /api/cart | auth | — | 200 {cleared} | 401 |
| POST | /api/orders | auth | {shippingAddress 5+, shippingCost 0-500k, discount 0-10jt, paymentMethod, notes} | 200 Order+items+payment (transaction) | 400 cart empty/stock/validate |
| GET | /api/orders/my | auth | — | 200 [Order+items+product+payment] | 401 |
| GET | /api/orders | admin | — | 200 [Order+user+items+payment] 50 latest | 403 |
| GET | /api/orders/:id | auth | — | 200 Order | 403 forbidden, 404 |
| PATCH | /api/orders/:id/status | admin | {status: PENDING/PAID/PROCESSING/SHIPPED/DELIVERED/CANCELLED, paymentStatus: UNPAID/PAID/FAILED/REFUNDED} | 200 Order | 400 invalid, 404 |
| GET | /api/admin/stats | admin | — | 200 {totalProducts, totalUsers, totalOrders, totalRevenue, lowStock[5], recentOrders[5]} | 403 |

**Curl cepat:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@tokoku.com","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
curl -s http://localhost:3001/api/products | head -c 500
curl -s http://localhost:3001/api/admin/stats -H "Authorization: Bearer $TOKEN" | head -c 500
```

**Error shape:** Selalu `{message: string, issues?: ZodIssue[]}`. Global handler: P2025->404, P2002->409, LIMIT_FILE_SIZE->400, else 500. Unknown route -> 404 {message:'Route not found'}.

---

## 6. Cara Development Lokal

**Prasyarat:** Node 20+, npm. Docker opsional (tidak ada di host Windows saat handover — Dockerfile tetap ada).

```bash
# 0. Lokasi
cd C:/Users/ALASKAID/tokoku

# 1. Backend
cd backend
npm ci
# .env sudah ada (PORT=3001, DATABASE_URL file:./prisma/dev.db, JWT_SECRET dev)
npx prisma generate
npx prisma db push
node prisma/seed.js
# Seed: admin@tokoku.com / password123 (ADMIN), customer@test.com / password123 (CUSTOMER), 3 kategori, 4 produk
npm run dev   # --watch src/server.js, :3001
# atau npm start (tanpa watch)

# 2. Frontend (terminal baru)
cd ../frontend
npm ci
npm run dev   # :5173, proxy /api -> :3001
# Build check: npm run build -> dist/ (233 kB / 77 kB gzip), npm run preview -> :4173

# 3. Test
cd ../backend
npm test      # vitest run, 19/19 harus hijau
# Health:
curl http://localhost:3001/api/health
curl http://localhost:5173/api/health
```

**Port:** Backend 3001, Frontend 5173. Jika 3001 dipakai, `TASKKILL /F /IM node.exe` (Windows) lalu restart. Frontend `atom` sudah di port 5173 — cek `curl -I http://localhost:5173`.

**Env:** `backend/.env` untuk dev, `backend/.env.production` untuk prod (lihat Deployment). Jangan commit `dev.db` ke git di prod (sudah di `.gitignore`).

---

## 7. Cara Deployment Production

### Opsi A — Docker (butuh Docker terinstall di server)
```bash
# Di server prod (Linux/WSL)
cd tokoku
cp backend/.env.production.example backend/.env.production
# Edit: JWT_SECRET -> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" (64 hex, JANGAN pakai default)
# Edit DATABASE_URL jika pakai Postgres: postgresql://user:pass@db:5432/tokoku?schema=public
# Untuk Postgres, ubah prisma/schema.prisma: provider = "postgresql"
docker compose up --build -d
# Frontend: http://<server> :80 (nginx), Backend: http://<server>:3001
# Volume: ./backend/prisma/dev.db dan ./backend/uploads sudah di-mount; untuk Postgres, tambah service `db` di compose
```

**docker-compose.yml:** `backend` build `./backend` (node:20-alpine, npm ci, prisma generate), `frontend` multi-stage build -> nginx:alpine, proxy `/api` dan `/uploads` ke backend:3001.

### Opsi B — Manual (tanpa Docker, mis. VPS)
```bash
cd backend && npm ci --omit=dev && npx prisma generate && npx prisma db push && node prisma/seed.js && PORT=3001 node src/server.js
# PM2: pm2 start src/server.js --name tokoku-backend --env production
# Frontend: cd frontend && npm ci && npm run build && npx serve -s dist -l 3000  # atau copy dist/ ke nginx root
```

### Checklist Deploy
- [ ] `backend/.env.production` JWT_SECRET diganti (64 hex), PORT, DATABASE_URL benar
- [ ] `prisma db push` sukses, `seed.js` jalan, ganti password admin (`PUT /api/auth/me` atau via prisma)
- [ ] `frontend/dist` ter-build, nginx SPA `try_files $uri /index.html` aktif
- [ ] `curl https://<domain>/api/health` 200, headers `X-Content-Type-Options` dll ada
- [ ] Backup `dev.db` atau `pg_dump` terjadwal (cron)

---

## 8. Security Checklist

**Sudah DONE:**
- [x] bcryptjs hash 10 + compare
- [x] JWT hard-fail jika `JWT_SECRET` hilang (`getSecret()` lazy), Bearer case-insensitive, `adminOnly` di semua route sensitif
- [x] Register force `role=CUSTOMER` — ignore client `role`, zod `registerSchema` (name 2+, email, password 6+)
- [x] Upload whitelist `jpeg/png/webp` + ext check + sanitize filename + 2MB/file + 5 files
- [x] CORS whitelist `localhost:5173` + `127.0.0.1:5173`, security headers (nosniff, DENY, Referrer-Policy)
- [x] Rate limit 200/15m/IP (Map `rateLimitStore`), json 100kb, errorHandler (Hanya/Ekstensi/LIMIT_FILE/P2025/P2002)
- [x] Zod `paginationSchema` limit max 50 anti-OOM, `cartSchema` qty 1-100, `orderCreateSchema` discount 0-10jt + `min(discount, subtotal)` anti-negative total
- [x] `prisma.$transaction` untuk order atomik, `allowedStatus` whitelist pada PATCH status
- [x] `notFound` 404 handler, semua route via `asyncHandler`

**WAJIB sebelum user asli:**
- [ ] Ganti `JWT_SECRET` prod (64 hex), ganti password seed `password123`, rotate jika bocor
- [ ] HTTPS (TLS) — nginx/Traefik + certbot, `helmet` penuh jika perlu
- [ ] Ganti localStorage JWT -> httpOnly Secure SameSite cookie + refresh token (XSS steal risk saat ini)
- [ ] Sanitizer XSS untuk `description` (render raw saat ini — tambah DOMPurify di frontend atau sanitize di backend)
- [ ] Jika scale: `SELECT FOR UPDATE` atau optimistic locking untuk stock race condition (transaction saja belum cukup di high concurrency)
- [ ] Rate limit persist (Redis) jika multi-instance; saat ini in-memory.

---

## 9. Monitoring Checklist

**Sudah ada:**
- [x] `GET /api/health` -> {status, app, time} (backend + via frontend proxy)
- [x] Request logger `console.log [ISO] METHOD path` di server.js
- [x] ErrorHandler log `[ERROR]` ke console
- [x] Frontend 401 interceptor clear token, loading/error/empty states di Products

**Tambahkan untuk prod:**
- [ ] Logger terstruktur `pino`/`winston` -> file + `ELK`/`Loki`, bukan console
- [ ] Error tracking `Sentry` (backend + frontend)
- [ ] Uptime monitor `Uptime Kuma` / `BetterStack` polling `/api/health` per menit
- [ ] Metrics `prom-client` (req count, latency, error rate) + Grafana
- [ ] DB monitor: size, slow query (`prisma` $on query), backup freshness
- [ ] Frontend `ErrorBoundary` + `Sentry` + `Web Vitals`

---

## 10. Roadmap Versi 2 (Prioritas)

**P0 — 2 minggu:**
1. Postgres migration + `prisma migrate` + `pg_dump` cron + restore runbook
2. httpOnly cookie + refresh token + CSRF (ganti localStorage)
3. Payment gateway (Midtrans/Xendit) — `Payment.transactionId` + webhook `POST /api/payments/webhook`
4. Email (nodemailer/SES) — order confirmation, password reset `POST /api/auth/forgot` + `reset`

**P1 — 1 bulan:**
5. S3/R2 untuk uploads (ganti `multer disk` -> `multer-s3`), CDN
6. Frontend pagination UI + search filter kategori + sort, `useApi` di semua halaman, `ErrorBoundary`
7. Admin: kelola kategori UI, kelola order (tabel + PATCH status), laporan penjualan per tanggal
8. Notifikasi (in-app + WebSocket/polling)
9. CI/CD: GitHub Actions (lint + vitest + build + docker push)

**P2 — 2-3 bulan:**
10. Service layer (`src/services/`) + controller split, unit test service, e2e `Playwright`
11. Search full-text (Postgres tsvector / Meilisearch), wishlist, review/rating, kupon/diskon
12. Multi-tenant / multi-toko, role `SELLER`, inventory audit, export CSV

---

## 11. Technical Debt Priority

| # | Debt | Dampak | Effort | Prioritas |
|---|---|---|---|---|
| 1 | SQLite dev.db (single file, no concurrent write) | Scale, backup | S | **P0** |
| 2 | JWT di localStorage (XSS steal) | Security | M | **P0** |
| 3 | Upload disk `uploads/` (hilang redeploy tanpa volume) | Data loss | S | P1 |
| 4 | No service layer (logic di routes) | Maintainability | M | P1 |
| 5 | Frontend `alert()` di Products | UX | XS | P1 |
| 6 | `genOrderNumber` Date slice collision risk | Correctness | S | P1 — ganti `cuid`/`nanoid` prefix |
| 7 | No pagination UI (API sudah max 50) | UX | S | P1 |
| 8 | `description` raw render (XSS) | Security | S | P0/P1 |
| 9 | In-memory rateLimit (hilang restart, tidak share) | Security | S | P2 — Redis |
| 10 | `zod` di deps tapi baru dipakai setelah refactor — audit schema coverage | Quality | S | Done (baru), cek coverage |
| 11 | `atom` state `loading/error` manual di tiap halaman — `useApi` belum dipakai di semua halaman | DRY | S | P1 |
| 12 | Seed pakai `Date.now()` untuk sku/slug — test brittle jika seed overlap | Test | XS | Done (tolerable) |

**Catatan:** Debt 1,4,6 baru di-refactor sebagian; 5,7,11 butuh frontend sprint berikutnya.

---

## 12. Estimasi Pekerjaan Berikutnya

| Item | Scope | Estimasi (1 dev) | Catatan |
|---|---|---|---|
| Postgres + backup cron + restore test | Backend | 2-3 hari | Ubah provider, migrate, pg_dump script, docs |
| httpOnly cookie + refresh + CSRF | Backend+Frontend | 4-5 hari | Ubah auth flow, cookie, axios withCredentials |
| Midtrans integration | Backend | 5-7 hari | Create payment, webhook, test, docs |
| Email (SES/nodemailer) + reset password | Backend | 3-4 hari | Template, token, job |
| S3/R2 uploads | Backend | 2-3 hari | multer-s3, env, migrasi file lama |
| Frontend pagination+filter+sort UI | Frontend | 3-4 hari | Pakai `useApi`, query sync URL |
| Admin order & kategori UI | Frontend | 4-5 hari | Tabel, PATCH, laporan |
| CI/CD (GitHub Actions) | DevOps | 1-2 hari | lint, test, build, docker |
| Pino + Sentry + Uptime | Backend+Frontend | 2-3 hari | Env, DSN, runbook |
| Service layer refactor | Backend | 4-5 hari | Ekstrak services, test |
| **Total P0 (Postgres+Cookie+Payment+Email)** | — | **~14-19 hari** | 1 dev, bisa paralel jika 2 dev -> ~8-10 hari |

**Asumsi:** 1 dev mid-senior, sudah paham codebase setelah baca handbook ini, tidak ada perubahan requirement. Jika 2 dev, bagi Backend (auth/payment/DB) dan Frontend (UI/pagination/admin).

---

## Appendix: Perintah Penting

```bash
# Health
curl http://localhost:3001/api/health
curl http://localhost:5173/api/health

# Test
cd C:/Users/ALASKAID/tokoku/backend && npx vitest run   # 19/19
cd C:/Users/ALASKAID/tokoku/frontend && npx vite build  # 77 kB gzip

# DB
cd C:/Users/ALASKAID/tokoku/backend
npx prisma generate
npx prisma db push
node prisma/seed.js
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d)

# Kill & restart (Windows)
TASKKILL /F /IM node.exe
cd backend && node src/server.js
# Frontend: cd frontend && npx vite --port 5173
```

**Kontak handover:** Repo lokal `C:/Users/ALASKAID/tokoku`, tidak ada remote git — `git init` + push ke GitHub sebelum onboarding tim baru. Jangan commit `dev.db`, `.env`, `uploads/*`.

*— CTO Handover, 23 Okt 2026*
