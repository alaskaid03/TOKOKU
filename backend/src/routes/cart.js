import express from 'express'
import prisma from '../config/db.js'
import { auth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'
import { cartSchema } from '../utils/validate.js'
import { parseOr400 } from '../utils/validate.js'
const router = express.Router()
router.get('/', auth, asyncHandler(async (req,res)=>{
  const items = await prisma.cartItem.findMany({where:{userId:req.user.id}, include:{product:{include:{category:true}}}})
  res.json(items)
}))
router.post('/', auth, asyncHandler(async (req,res)=>{
  const data = parseOr400(cartSchema, req.body, res)
  if(!data) return
  const {productId, quantity}=data
  const product = await prisma.product.findUnique({where:{id:productId}})
  if(!product) return res.status(404).json({message:'Product not found'})
  if(product.stock < quantity) return res.status(400).json({message:`Stok tidak cukup (sisa ${product.stock})`})
  const item = await prisma.cartItem.upsert({
    where:{userId_productId:{userId:req.user.id, productId}},
    update:{quantity}, create:{userId:req.user.id, productId, quantity}
  })
  res.json(item)
}))
router.delete('/:productId', auth, asyncHandler(async (req,res)=>{
  await prisma.cartItem.delete({where:{userId_productId:{userId:req.user.id, productId:req.params.productId}}})
  res.json({message:'removed'})
}))
router.delete('/', auth, asyncHandler(async (req,res)=>{
  await prisma.cartItem.deleteMany({where:{userId:req.user.id}})
  res.json({message:'cleared'})
}))
export default router
