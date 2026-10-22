import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main(){
  const hash = await bcrypt.hash('password123',10)
  const admin = await prisma.user.upsert({where:{email:'admin@tokoku.com'}, update:{}, create:{name:'Admin TokoKu', email:'admin@tokoku.com', password:hash, role:'ADMIN'}})
  const customer = await prisma.user.upsert({where:{email:'customer@test.com'}, update:{}, create:{name:'Budi Customer', email:'customer@test.com', password:hash, role:'CUSTOMER'}})
  const cat1 = await prisma.category.upsert({where:{slug:'elektronik'}, update:{}, create:{name:'Elektronik', slug:'elektronik', description:'Gadget dan elektronik'}})
  const cat2 = await prisma.category.upsert({where:{slug:'fashion'}, update:{}, create:{name:'Fashion', slug:'fashion', description:'Pakaian dan aksesoris'}})
  const cat3 = await prisma.category.upsert({where:{slug:'makanan'}, update:{}, create:{name:'Makanan', slug:'makanan', description:'Makanan dan minuman'}})
  const products = [
    {name:'Smartphone X Pro', description:'HP flagship kamera 108MP', price:7500000, stock:25, categoryId:cat1.id, sku:'SKU-SMA-'+Date.now(), slug:'smartphone-x-pro-'+Date.now(), images:'[]'},
    {name:'Kaos Polos Premium', description:'Kaos katun combed 30s', price:85000, stock:100, categoryId:cat2.id, sku:'SKU-KAO-'+(Date.now()+1), slug:'kaos-polos-premium-'+(Date.now()+1), images:'[]'},
    {name:'Kopi Arabika 250g', description:'Kopi arabika gayo premium', price:65000, stock:50, categoryId:cat3.id, sku:'SKU-KOP-'+(Date.now()+2), slug:'kopi-arabika-250g-'+(Date.now()+2), images:'[]'},
    {name:'Headset Bluetooth', description:'Headset wireless bass mantap', price:350000, stock:40, categoryId:cat1.id, sku:'SKU-HEA-'+(Date.now()+3), slug:'headset-bluetooth-'+(Date.now()+3), images:'[]'},
  ]
  for(const p of products){ try{ await prisma.product.create({data:p}) }catch(e){} }
  console.log('Seed done. admin@tokoku.com / password123')
}
main().finally(()=>prisma.$disconnect())
