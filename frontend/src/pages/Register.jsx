import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../stores/auth'
export default function Register(){
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState('')
  const {register}=useAuth()
  const nav=useNavigate()
  const submit=async(e)=>{
    e.preventDefault()
    try{ await register(name,email,password); nav('/products') }catch(e){ setErr(e.response?.data?.message||'Register gagal') }
  }
  return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
    <h1 className="text-2xl font-bold mb-4">Register</h1>
    {err && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{err}</div>}
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Nama" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="w-full bg-primary text-white py-2 rounded font-semibold">Daftar</button>
    </form>
    <p className="text-sm mt-3"><Link to="/login" className="text-primary">Sudah punya akun? Login</Link></p>
  </div>
}
