import express from 'express'
import prisma from '../config/db.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { toSlug, genSKU } from '../utils/slug.js'
import { asyncHandler } from '../utils/http.js'
import { productCreateSchema, paginationSchema } from '../utils/validate.js'
import { parseOr400 } from '../utils/validate.js'
const router = express.Router()

router.get('/', asyncHandler(async (req,res)=>{
  const q = parseOr400(paginationSchema, req.query, res)
  if(!q) return
  const where = { isActive:true }
  if(q.search) where.name = { contains: q.search }
  if(q.category) where.categoryId = q.category
  const orderBy = q.sort==='price_asc'?{price:'asc'}:q.sort==='price_desc'?{price:'desc'}:{createdAt:'desc'}
  const skip = (q.page-1)*q.limit
  const [products, total] = await Promise.all([
    prisma.product.findMany({where, include:{category:true}, orderBy, skip, take:q.limit}),
    prisma.product.count({where})
  ])
  res.json({products, total, page:q.page, totalPages:Math.ceil(total/q.limit)})
}))

router.get('/:id', asyncHandler(async (req,res)=>{
  const p = await prisma.product.findUnique({where:{id:req.params.id}, include:{category:true}})
  if(!p) return res.status(404).json({message:'Not found'})
  res.json(p)
}))

function parseProductBody(body, files){
  const images = files?.map(f=>'/uploads/'+f.filename) || null
  return { ...body, images }
}

router.post('/', auth, adminOnly, upload.array('images',5), asyncHandler(async (req,res)=>{
  const data = parseOr400(productCreateSchema, req.body, res)
  if(!data) return
  const images = req.files?.map(f=>'/uploads/'+f.filename) || []
  const product = await prisma.product.create({data:{
    name: data.name.trim(), description: data.description.trim(),
    price: data.price, comparePrice: data.comparePrice ?? null,
    stock: data.stock, weight: data.weight,
    categoryId: data.categoryId,
    slug: toSlug(data.name)+'-'+Date.now().toString().slice(-5),
    sku: genSKU(data.name), images: JSON.stringify(images)
  }})
  if(product.stock>0) await prisma.stockLog.create({data:{productId:product.id, change:product.stock, reason:'Initial stock'}})
  res.json(product)
}))

router.put('/:id', auth, adminOnly, upload.array('images',5), asyncHandler(async (req,res)=>{
  const existing = await prisma.product.findUnique({where:{id:req.params.id}})
  if(!existing) return res.status(404).json({message:'Not found'})
  const {name,description,price,comparePrice,stock,categoryId,weight,isActive}=req.body
  let images = existing.images
  if(req.files?.length) images = JSON.stringify(req.files.map(f=>'/uploads/'+f.filename))
  const oldStock = existing.stock
  const newStock = stock!==undefined && stock!=='' ? parseInt(stock) : oldStock
  if(Number.isNaN(newStock) || newStock < 0) return res.status(400).json({message:'Stok tidak valid'})
  const product = await prisma.product.update({where:{id:req.params.id}, data:{
    name: name?.trim(), description: description?.trim(),
    price: price?parseInt(price):undefined,
    comparePrice: comparePrice?parseInt(comparePrice):undefined,
    stock:newStock, weight:weight?parseInt(weight):undefined,
    categoryId: categoryId || undefined, images,
    slug: name?toSlug(name)+'-'+Date.now().toString().slice(-5):undefined,
    isActive: isActive!==undefined ? (isActive==='true'||isActive===true||isActive==='1') : undefined
  }})
  if(newStock!==oldStock) await prisma.stockLog.create({data:{productId:product.id, change:newStock-oldStock, reason:'Admin update'}})
  res.json(product)
}))

router.delete('/:id', auth, adminOnly, asyncHandler(async (req,res)=>{
  await prisma.product.delete({where:{id:req.params.id}})
  res.json({message:'deleted'})
}))
export default router
