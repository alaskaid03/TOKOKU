# TokoKu — Production Ready

## Stack
Backend: Node.js 20 + Express 4 + Prisma 5 + SQLite (dev) / Postgres (prod) + JWT + bcryptjs + Multer
Frontend: React 18 + Vite 5 + Tailwind 3 + Zustand + Axios
Test: Vitest + Supertest (16 tests)

## Quick Start (server baru)
```bash
git clone <repo> && cd tokoku
cd backend
npm ci
cp .env.production.example .env.production
# edit JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start  # :3001
cd ../frontend
npm ci
npm run build  # dist/ -> serve via nginx / npm run preview
npm run dev    # :5173 (proxy /api -> :3001)
```

## Docker (butuh Docker terinstall)
```bash
cp backend/.env.production.example backend/.env.production # isi JWT_SECRET
docker compose up --build -d
# frontend: http://localhost (80)  backend: http://localhost:3001
```

## Env
`backend/.env` (dev) / `backend/.env.production` (prod). Wajib: JWT_SECRET (64 hex), PORT, DATABASE_URL.

## Backup & Restore
```bash
cp backend/prisma/dev.db backend/prisma/dev.db.backup-$(date +%Y%m%d)
cp backend/prisma/dev.db.backup-YYYYMMDD backend/prisma/dev.db
# Postgres prod: pg_dump / pg_restore
# Ganti prisma/schema.prisma provider = "postgresql" + DATABASE_URL postgres
```

## Panduan Admin
- Login: admin@tokoku.com / password123 (ganti setelah deploy!)
- Dashboard: /admin, Kelola Produk: /admin/products
- Kategori: POST /api/categories (admin), Pesanan: PATCH /api/orders/:id/status
- Upload: hanya JPG/PNG/WEBP, max 2MB, 5 file

## Test & Health
```bash
cd backend && npm test  # 16 tests
curl http://localhost:3001/api/health
curl http://localhost:5173/api/health
```

## Health & Monitoring
- GET /api/health -> {status, app, time}
- Headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- Rate limit: 200 req/15min/IP, Body 100kb
- Logs: console (prod: ganti pino/winston + Sentry)
- Perf: ~5ms /api/products, frontend 76kB gzip

## Lokasi Project
C:/Users/ALASKAID/tokoku  (backend :3001, frontend :5173)
