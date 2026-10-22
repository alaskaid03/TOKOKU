import express from 'express'
import prisma from '../config/db.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { toSlug } from '../utils/slug.js'
import { asyncHandler } from '../utils/http.js'
const router = express.Router()

router.get('/', asyncHandler(async (req,res)=>{
  const cats = await prisma.category.findMany({include:{_count:{select:{products:true}}}})
  res.json(cats)
}))
router.post('/', auth, adminOnly, asyncHandler(async (req,res)=>{
  const {name,description}=req.body
  if(!name || name.trim().length < 2) return res.status(400).json({message:'Nama kategori minimal 2 karakter'})
  const cat = await prisma.category.create({data:{name: name.trim(), slug:toSlug(name)+'-'+Date.now().toString().slice(-4), description: description?.trim()}})
  res.json(cat)
}))
router.delete('/:id', auth, adminOnly, asyncHandler(async (req,res)=>{
  await prisma.category.delete({where:{id:req.params.id}})
  res.json({message:'deleted'})
}))
export default router
