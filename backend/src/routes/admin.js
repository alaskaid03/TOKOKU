import express from 'express'
import prisma from '../config/db.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'
const router = express.Router()
router.use(auth, adminOnly)

router.get('/stats', asyncHandler(async (req,res)=>{
  const [totalProducts, totalUsers, totalOrders, revenue, lowStock, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({where:{role:'CUSTOMER'}}),
    prisma.order.count(),
    prisma.order.aggregate({_sum:{total:true}, where:{paymentStatus:'PAID'}}),
    prisma.product.findMany({where:{stock:{lt:5}}, take:5}),
    prisma.order.findMany({orderBy:{createdAt:'desc'}, take:5, include:{user:true}})
  ])
  res.json({ totalProducts, totalUsers, totalOrders, totalRevenue: revenue._sum.total||0, lowStock, recentOrders })
}))

router.get('/sales', asyncHandler(async (req,res)=>{
  const { range='daily' } = req.query
  const now = new Date()
  let start, groupFmt
  if(range==='weekly'){
    start = new Date(now); start.setDate(now.getDate()-6); start.setHours(0,0,0,0)
    groupFmt = 'weekly'
  } else {
    start = new Date(now); start.setHours(0,0,0,0)
    groupFmt = 'daily'
  }
  const orders = await prisma.order.findMany({
    where:{ createdAt:{gte: start} },
    select:{ total:true, createdAt:true, status:true }
  })
  const totalRevenue = orders.reduce((s,o)=> s+o.total, 0)
  const totalOrders = orders.length
  const byDate = {}
  for(const o of orders){
    const d = o.createdAt.toISOString().slice(0,10)
    if(!byDate[d]) byDate[d] = { date:d, revenue:0, orders:0 }
    byDate[d].revenue += o.total
    byDate[d].orders += 1
  }
  const daily = Object.values(byDate).sort((a,b)=> a.date.localeCompare(b.date))
  // weekly aggregate
  let weekly = null
  if(range==='weekly'){
    weekly = { revenue: totalRevenue, orders: totalOrders, avgPerDay: totalOrders? Math.round(totalRevenue/7):0, daily }
  }
  res.json({ range: groupFmt, since: start.toISOString(), totalRevenue, totalOrders, daily, weekly })
}))

router.get('/stock-log', asyncHandler(async (req,res)=>{
  const { productId, limit='50' } = req.query
  const where = productId ? {productId} : {}
  const logs = await prisma.stockLog.findMany({
    where, orderBy:{createdAt:'desc'}, take: Math.min(parseInt(limit)||50, 100),
    include:{ product:{select:{name:true, sku:true}} }
  })
  res.json(logs)
}))

router.get('/notifications', asyncHandler(async (req,res)=>{
  const since = req.query.since ? new Date(req.query.since) : new Date(Date.now()-24*60*60*1000)
  const recent = await prisma.order.findMany({
    where:{ createdAt:{gte: since} },
    orderBy:{createdAt:'desc'}, take:20,
    include:{ user:{select:{name:true}}, items:{include:{product:{select:{name:true}}}} }
  })
  const pendingCount = await prisma.order.count({where:{status:'PENDING'}})
  res.json({ since: since.toISOString(), pendingCount, recent })
}))

export default router
