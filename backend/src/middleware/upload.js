import multer from 'multer'
import path from 'path'
const ALLOWED = new Set(['image/jpeg','image/png','image/webp','image/jpg'])
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null,'uploads/'),
  filename: (req,file,cb)=>{
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,30)
    cb(null, Date.now()+'-'+base+ext)
  }
})
export const upload = multer({
  storage,
  limits:{fileSize:2*1024*1024, files:5},
  fileFilter:(req,file,cb)=>{
    if(!ALLOWED.has(file.mimetype)) return cb(new Error('Hanya JPG/PNG/WEBP'),false)
    const ext = path.extname(file.originalname).toLowerCase()
    if(!['.jpg','.jpeg','.png','.webp'].includes(ext)) return cb(new Error('Ekstensi tidak diizinkan'),false)
    cb(null,true)
  }
})
