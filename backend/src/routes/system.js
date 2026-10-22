import express from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import prisma from '../config/db.js'
import { auth, adminOnly } from '../middleware/auth.js'
import { asyncHandler } from '../utils/http.js'
const router = express.Router()
router.get('/health', (req,res)=> res.json({status:'ok', app:'TokoKu', time:new Date().toISOString(), uptime: process.uptime()}))
router.get('/status', auth, adminOnly, asyncHandler(async (req,res)=>{
  const start = Date.now()
  let dbStatus = 'ok', dbLatencyMs = 0, totalProducts = 0, ordersToday = 0
  const t0 = Date.now()
  try{
    await prisma.$queryRaw`SELECT 1`
    dbLatencyMs = Date.now() - t0
    totalProducts = await prisma.product.count()
    const today = new Date(); today.setHours(0,0,0,0)
    ordersToday = await prisma.order.count({where:{createdAt:{gte: today}}})
  }catch(e){ dbStatus = 'error: ' + e.message }
  const backupDir = path.resolve('prisma/backups')
  let lastBackup = null, backupCount = 0
  try{
    const files = fs.readdirSync(backupDir).filter(f=>f.endsWith('.db')).map(f=> ({name:f, mtime: fs.statSync(path.join(backupDir,f)).mtime}))
    backupCount = files.length
    if(files.length) files.sort((a,b)=> b.mtime - a.mtime), lastBackup = { file: files[0].name, time: files[0].mtime.toISOString() }
  }catch{}
  let dbSize = null
  try{ const s = fs.statSync(path.resolve('prisma/dev.db')); dbSize = { bytes: s.size, human: (s.size/1024).toFixed(1)+' KB', mtime: s.mtime.toISOString() } }catch{}
  let disk = null
  try{
    const out = execSync('powershell -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name,Used,Free | ConvertTo-Json"', {timeout:5000}).toString()
    const drives = JSON.parse(out)
    const arr = Array.isArray(drives)?drives:[drives]
    disk = arr.filter(d=>d.Free!=null).map(d=> ({
      drive: d.Name+':', size: (d.Used||0)+(d.Free||0), free: d.Free, used: d.Used,
      freeHuman: (d.Free/1024/1024/1024).toFixed(1)+' GB', sizeHuman: ((d.Used+d.Free)/1024/1024/1024).toFixed(1)+' GB'
    }))
  }catch{
    disk = [{ note:'disk info unavailable', free: os.freemem(), total: os.totalmem(), freeHuman: (os.freemem()/1024/1024/1024).toFixed(1)+' GB' }]
  }
  res.json({
    backend: { status:'ok', uptimeSec: Math.floor(process.uptime()), time: new Date().toISOString(), latencyMs: Date.now()-start },
    database: { status: dbStatus, latencyMs: dbLatencyMs, size: dbSize, totalProducts, ordersToday },
    backup: { lastBackup, backupCount, dir: 'prisma/backups' },
    disk,
    system: { hostname: os.hostname(), platform: os.platform(), arch: os.arch(), cpus: os.cpus().length, freemem: os.freemem(), totalmem: os.totalmem() }
  })
}))
export default router
