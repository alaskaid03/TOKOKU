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

**Migrasi ke Postgres:** Ubah `datasource db { provider="postgresql" url=env("DATABASE_URL") }`, `DATABASE_URL="postgresql://user:***@host:5432/tokoku?schema=public"`, lalu `npx prisma db push` / `migrate`. Ganti `contains` filter jika butuh `mode: insensitive`.

---

## 5. API Documentation