import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(c=>{
  const t = localStorage.getItem('token')
  if(t) c.headers.Authorization = 'Bearer '+t
  return c
})
api.interceptors.response.use(r=>r, err=>{
  if(err.response?.status===401 && !location.pathname.includes('/login')){
    localStorage.clear()
  }
  return Promise.reject(err)
})
export default api
