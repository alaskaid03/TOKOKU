## 5. API Documentation

**Base:** `http://localhost:3001` (dev), `/api` via frontend proxy. **Auth:** `Authorization: Bearer *** kecuali GET /products, GET /products/:id, GET /categories, GET /health, POST /auth/*.

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
curl -s http://localhost:3001/api/admin/stats -H "Authorization: Bearer ***" | head -c 500
```

**Error shape:** Selalu `{message: string, issues?: ZodIssue[]}`. Global handler: P2025->404, P2002->409, LIMIT_FILE_SIZE->400, else 500. Unknown route -> 404 {message:'Route not found'}.

---

## 6. Cara Development Lokal