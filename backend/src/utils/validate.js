import { z } from 'zod'
export const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) })
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
export const productCreateSchema = z.object({
  name: z.string().min(2), description: z.string().min(5),
  price: z.coerce.number().int().positive(), stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().min(1), weight: z.coerce.number().int().min(0).default(0),
  comparePrice: z.coerce.number().int().positive().optional().nullable()
})
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(), category: z.string().optional(),
  sort: z.enum(['newest','price_asc','price_desc']).default('newest')
})
export const cartSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(1000) })
export const orderCreateSchema = z.object({
  shippingAddress: z.string().min(5), shippingCost: z.coerce.number().int().min(0).max(500000).default(0),
  discount: z.coerce.number().int().min(0).max(10000000).default(0),
  paymentMethod: z.string().optional(), notes: z.string().optional()
})
export const parseOr400 = (schema, data, res) => {
  const r = schema.safeParse(data)
  if(!r.success){ res.status(400).json({ message: r.error.issues[0].message, issues: r.error.issues }); return null }
  return r.data
}
