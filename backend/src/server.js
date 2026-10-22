import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import systemRoutes from './routes/system.js'
import { errorHandler, notFound } from './middleware/error.js'
const app = express()
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff')
  res.setHeader('X-Frame-Options','DENY')
  res.setHeader('X-XSS-Protection','0')
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin')
  next()
})
app.use(cors({ origin: true, credentials:true }))
app.use(express.json({ limit:'100kb' }))
app.use('/uploads', express.static('uploads', { maxAge:'1d' }))
const rateLimitStore = new Map()
app.use((req,res,next)=>{
  const ip = req.ip
  const now = Date.now()
  const entry = rateLimitStore.get(ip) || { count:0, start: now }
  if(now - entry.start > 15*60*1000){ entry.count=0; entry.start=now }
  entry.count++
  rateLimitStore.set(ip, entry)
  if(entry.count > 200) return res.status(429).json({message:'Terlalu banyak request'})
  next()
})
app.use((req,res,next)=>{ console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); next() })
app.get('/api/health', (req,res)=>res.json({status:'ok', app:'TokoKu', time: new Date().toISOString()}))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/system', systemRoutes)
app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT||3001
app.listen(PORT, '0.0.0.0', ()=> console.log(`TokoKu backend running on http://0.0.0.0:${PORT} (LAN: http://192.168.1.12:${PORT})`))
