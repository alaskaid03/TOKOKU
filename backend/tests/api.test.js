import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import 'dotenv/config'
const BASE = 'http://localhost:3001'
let adminToken, customerToken, prodId
beforeAll(async ()=>{
  const a = await request(BASE).post('/api/auth/login').send({email:'admin@tokoku.com', password:'password123'})
  adminToken = a.body.token
  const c = await request(BASE).post('/api/auth/login').send({email:'customer@test.com', password:'password123'})
  customerToken = c.body.token
})
describe('Health', ()=>{
  it('GET /api/health', async ()=>{
    const r = await request(BASE).get('/api/health')
    expect(r.status).toBe(200)
    expect(r.body.app).toBe('TokoKu')
  })
})
describe('Auth', ()=>{
  it('register weak name -> 400', async ()=>{
    const r = await request(BASE).post('/api/auth/register').send({name:'T', email:'weak'+Date.now()+'@t.com', password:'123'})
    expect(r.status).toBe(400)
  })
  it('register role escalation blocked', async ()=>{
    const r = await request(BASE).post('/api/auth/register').send({name:'Hacker', email:'hack'+Date.now()+'@t.com', password:'123456', role:'ADMIN'})
    expect(r.body.user.role).toBe('CUSTOMER')
  })
  it('login wrong password -> 400', async ()=>{
    const r = await request(BASE).post('/api/auth/login').send({email:'admin@tokoku.com', password:'wrong'})
    expect(r.status).toBe(400)
  })
  it('GET /api/auth/me without token -> 401', async ()=>{
    const r = await request(BASE).get('/api/auth/me')
    expect(r.status).toBe(401)
  })
})
describe('Products & Categories', ()=>{
  it('GET /api/products', async ()=>{
    const r = await request(BASE).get('/api/products')
    expect(r.status).toBe(200)
    expect(r.body.products.length).toBeGreaterThan(0)
  })
  it('GET /api/products limit cap 50', async ()=>{
    const r = await request(BASE).get('/api/products?limit=100')
    expect(r.status).toBe(400)
  })
  it('POST /api/products without admin -> 401/403', async ()=>{
    const r = await request(BASE).post('/api/products').send({name:'X', description:'desc-test', price:1000, stock:1, categoryId:'x'})
    expect([401,403]).toContain(r.status)
  })
  it('POST /api/products as admin -> 200', async ()=>{
    const cat = await request(BASE).get('/api/categories')
    const catId = cat.body[0].id
    const r = await request(BASE).post('/api/products').set('Authorization','Bearer '+adminToken).send({name:'Test Vitest '+Date.now(), description:'desc testing', price:50000, stock:10, categoryId: catId})
    expect(r.status).toBe(200)
    prodId = r.body.id
  })
  it('customer cannot access /api/admin/stats', async ()=>{
    const r = await request(BASE).get('/api/admin/stats').set('Authorization','Bearer '+customerToken)
    expect(r.status).toBe(403)
  })
  it('admin can access stats', async ()=>{
    const r = await request(BASE).get('/api/admin/stats').set('Authorization','Bearer '+adminToken)
    expect(r.status).toBe(200)
    expect(r.body).toHaveProperty('totalProducts')
  })
  it('cart negative qty -> 400', async ()=>{
    const r = await request(BASE).post('/api/cart').set('Authorization','Bearer '+customerToken).send({productId: prodId, quantity:-5})
    expect(r.status).toBe(400)
  })
  it('404 route', async ()=>{
    const r = await request(BASE).get('/api/notfound')
    expect(r.status).toBe(404)
  })
})
describe('Cart & Order', ()=>{
  it('add to cart', async ()=>{
    const r = await request(BASE).post('/api/cart').set('Authorization','Bearer '+customerToken).send({productId: prodId, quantity:1})
    expect(r.status).toBe(200)
  })
  it('create order', async ()=>{
    const r = await request(BASE).post('/api/orders').set('Authorization','Bearer '+customerToken).send({shippingAddress:'Jl Test No 1 Jakarta', shippingCost:10000, paymentMethod:'TRANSFER'})
    expect(r.status).toBe(200)
    expect(r.body).toHaveProperty('orderNumber')
  })
  it('GET /api/orders/my', async ()=>{
    const r = await request(BASE).get('/api/orders/my').set('Authorization','Bearer '+customerToken)
    expect(r.status).toBe(200)
    expect(Array.isArray(r.body)).toBe(true)
  })
})
describe('Unit: slug & jwt', ()=>{
  it('toSlug', async ()=>{
    const { toSlug } = await import('../src/utils/slug.js')
    expect(toSlug('Hello World')).toBe('hello-world')
  })
  it('jwt sign/verify', async ()=>{
    const { signToken, verifyToken } = await import('../src/utils/jwt.js')
    const t = signToken({id:'123', role:'ADMIN'})
    const d = verifyToken(t)
    expect(d.id).toBe('123')
  })
  it('jwt tampered -> throw', async ()=>{
    const { verifyToken } = await import('../src/utils/jwt.js')
    expect(()=> verifyToken('bad.token.here')).toThrow()
  })
})
