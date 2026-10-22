import { verifyToken } from '../utils/jwt.js'
export const auth = (req,res,next) => {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i,'').trim()
  if(!token) return res.status(401).json({message:'Unauthorized'})
  try { req.user = verifyToken(token); next() }
  catch { return res.status(401).json({message:'Token invalid'}) }
}
export const adminOnly = (req,res,next) => {
  if(req.user.role !== 'ADMIN') return res.status(403).json({message:'Admin only'})
  next()
}
