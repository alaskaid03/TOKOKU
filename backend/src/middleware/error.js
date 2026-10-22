export const notFound = (req,res)=> res.status(404).json({message:'Route not found'})
export const errorHandler = (err,req,res,next)=>{
  if(err.message && err.message.includes('Hanya')) return res.status(400).json({message:err.message})
  if(err.message && err.message.includes('Ekstensi')) return res.status(400).json({message:err.message})
  if(err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({message:'File maksimal 2MB'})
  if(err.code === 'P2025') return res.status(404).json({message:'Data tidak ditemukan'})
  if(err.code === 'P2002') return res.status(409).json({message:'Data sudah ada (duplicate)'})
  console.error('[ERROR]', err.message || err)
  res.status(500).json({message:'Internal server error'})
}
