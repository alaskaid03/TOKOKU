import jwt from 'jsonwebtoken'
const getSecret = ()=> {
  if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing in .env')
  return process.env.JWT_SECRET
}
export const signToken = (payload) => jwt.sign(payload, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
export const verifyToken = (token) => jwt.verify(token, getSecret())
