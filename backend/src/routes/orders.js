import express from 'express'
import prisma from '../config/db.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { genOrderNumber } from '../utils/slug.js'
import { asyncHandler } from '../utils/http.js'
import { orderCreateSchema } from '../utils/validate.js'
import { parseOr400 } from '../utils/validate.js'
const router = express.Router()

router.post('/', auth, asyncHandler(async (req,res)=>{
  const data = parseOr400(orderCreateSchema, req.body, res)
  if(!data) return
  const cart = await prisma.cartItem.findMany({where:{userId:req.user.id}, include:{product:true}})
  if(!cart.length) return res.status(400).json({message:'Keranjang kosong'})
  for(const c of cart){ if(c.product.stock < c.quantity) return res.status(400).json({message:'Stok '+c.product.name+' tidak cukup'}) }
  const subtotal = cart.reduce((s,c)=> s + c.product.price*c.quantity, 0)
  const discount = Math.min(data.discount, subtotal) // prevent negative total
  const total = subtotal - discount + data.shippingCost
  const orderNumber = genOrderNumber()
  const order = await prisma.$transaction(async (tx)=>{
    const o = await tx.order.create({data:{
      orderNumber, userId:req.user.id, subtotal, discount, shippingCost:data.shippingCost, total,
      shippingAddress: data.shippingAddress, paymentMethod: data.paymentMethod, notes: data.notes,
      items:{create: cart.map(c=>({productId:c.productId, quantity:c.quantity, price:c.product.price, subtotal:c.product.price*c.quantity}))},
      payment:{create:{amount:total, method: data.paymentMethod||'TRANSFER', status:'UNPAID'}}
    }, include:{items:true, payment:true}})
    for(const c of cart){
      await tx.product.update({where:{id:c.productId}, data:{stock:{decrement:c.quantity}}})
      await tx.stockLog.create({data:{productId:c.productId, change:-c.quantity, reason:'Order '+orderNumber}})
    }
    await tx.cartItem.deleteMany({where:{userId:req.user.id}})
    return o
  })
  res.json(order)
}))

router.get('/my', auth, asyncHandler(async (req,res)=>{
  const orders = await prisma.order.findMany({where:{userId:req.user.id}, include:{items:{include:{product:true}}, payment:true}, orderBy:{createdAt:'desc'}})
  res.json(orders)
}))
router.get('/', auth, adminOnly, asyncHandler(async (req,res)=>{
  const orders = await prisma.order.findMany({include:{user:true, items:{include:{product:true}}, payment:true}, orderBy:{createdAt:'desc'}, take:50})
  res.json(orders)
}))
router.get('/:id', auth, asyncHandler(async (req,res)=>{
  const order = await prisma.order.findUnique({where:{id:req.params.id}, include:{items:{include:{product:true}}, payment:true, user:true}})
  if(!order) return res.status(404).json({message:'Not found'})
  if(req.user.role!=='ADMIN' && order.userId!==req.user.id) return res.status(403).json({message:'Forbidden'})
  res.json(order)
}))
router.patch('/:id/status', auth, adminOnly, asyncHandler(async (req,res)=>{
  const {status, paymentStatus}=req.body
  const allowedStatus = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED']
  const allowedPayment = ['UNPAID','PAID','FAILED','REFUNDED']
  if(status && !allowedStatus.includes(status)) return res.status(400).json({message:'Status tidak valid'})
  if(paymentStatus && !allowedPayment.includes(paymentStatus)) return res.status(400).json({message:'Payment status tidak valid'})
  const data={}
  if(status) data.status=status
  if(paymentStatus) data.paymentStatus=paymentStatus
  const order = await prisma.order.update({where:{id:req.params.id}, data})
  if(paymentStatus) await prisma.payment.update({where:{orderId:req.params.id}, data:{status:paymentStatus, paidAt: paymentStatus==='PAID'?new Date():null}})
  res.json(order)
}))
export default router
