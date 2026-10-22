export const ok = (res, data) => res.json(data)
export const created = (res, data) => res.status(201).json(data)
export const fail = (res, status, message) => res.status(status).json({ message })
export const asyncHandler = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)
