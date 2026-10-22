import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../stores/auth'
export default function Login(){
  const [email,setEmail]=useState('admin@tokoku.com')
  const [password,setPassword]=useState('password123')
  const [err,setErr]=useState('')
  const {login}=useAuth()
  const nav=useNavigate()
  const submit=async(e)=>{
    e.preventDefault()
    try{ const u=await login(email,password); nav(u.role==='ADMIN'?'/admin':'/products') }catch(e){ setErr(e.response?.data?.message||'Login gagal') }
  }
  return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
    <h1 className="text-2xl font-bold mb-4">Login TokoKu</h1>
    {err && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{err}</div>}
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="w-full bg-primary text-white py-2 rounded font-semibold">Login</button>
    </form>
    <p className="text-sm mt-3">Belum punya akun? <Link to="/register" className="text-primary">Register</Link></p>
    <p className="text-xs text-gray-500 mt-2">Admin: admin@tokoku.com / password123<br/>Customer: customer@test.com / password123</p>
  </div>
}
