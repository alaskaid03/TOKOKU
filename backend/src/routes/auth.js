import express from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/db.js'
import { signToken } from '../utils/jwt.js'
import { auth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'
import { registerSchema, loginSchema } from '../utils/validate.js'
import { parseOr400 } from '../utils/validate.js'
const router = express.Router()
const toPublicUser = (u)=> ({id:u.id,name:u.name,email:u.email,role:u.role})
const issueToken = (user)=> signToken({id:user.id, role:user.role, email:user.email})

router.post('/register', asyncHandler(async (req,res)=>{
  const data = parseOr400(registerSchema, req.body, res)
  if(!data) return
  const {name,email,password}=data
  const exists = await prisma.user.findUnique({where:{email}})
  if(exists) return res.status(400).json({message:'Email sudah terdaftar'})
  const hash = await bcrypt.hash(password,10)
  const user = await prisma.user.create({data:{name,email,password:hash, role:'CUSTOMER'}})
  const token = issueToken(user)
  res.json({token, user: toPublicUser(user)})
}))

router.post('/login', asyncHandler(async (req,res)=>{
  const data = parseOr400(loginSchema, req.body, res)
  if(!data) return
  const {email,password}=data
  const user = await prisma.user.findUnique({where:{email}})
  if(!user) return res.status(400).json({message:'Email tidak ditemukan'})
  const ok = await bcrypt.compare(password, user.password)
  if(!ok) return res.status(400).json({message:'Password salah'})
  const token = issueToken(user)
  res.json({token, user: toPublicUser(user)})
}))

router.get('/me', auth, asyncHandler(async (req,res)=>{
  const user = await prisma.user.findUnique({where:{id:req.user.id}, select:{id:true,name:true,email:true,role:true,phone:true,address:true,avatar:true,createdAt:true}})
  res.json(user)
}))

router.put('/me', auth, asyncHandler(async (req,res)=>{
  const {name,phone,address}=req.body
  if(name && name.trim().length < 2) return res.status(400).json({message:'Nama terlalu pendek'})
  const user = await prisma.user.update({where:{id:req.user.id}, data:{name: name?.trim(), phone: phone?.trim(), address: address?.trim()}})
  res.json(toPublicUser(user))
}))
export default router
