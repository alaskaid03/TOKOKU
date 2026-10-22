import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'
export default function AdminBell(){
  const [pending,setPending]=useState(0)
  const [recent,setRecent]=useState([])
  const [open,setOpen]=useState(false)
  const load=async()=>{
    try{ const r=await api.get('/admin/notifications'); setPending(r.data.pendingCount); setRecent(r.data.recent.slice(0,5)) }catch{}
  }
  useEffect(()=>{ load(); const id=setInterval(load, 30000); return ()=> clearInterval(id) },[])
  return <div className="relative">
    <button onClick={()=>setOpen(!open)} className="relative bg-white/10 px-3 py-1 rounded text-sm">
      🔔 {pending>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{pending}</span>}
      {pending===0 && <span className="text-xs opacity-70">0</span>}
    </button>
    {open && <div className="absolute right-0 mt-2 w-80 bg-white text-dark rounded-xl shadow-xl z-50 p-3">
      <div className="flex justify-between items-center mb-2"><span className="font-semibold text-sm">Order Baru ({pending} pending)</span><button onClick={()=>setOpen(false)} className="text-gray-400">✕</button></div>
      {recent.length===0? <p className="text-sm text-gray-400">Tidak ada order terbaru</p> :
        recent.map(o=> <div key={o.id} className="border-t py-2 text-sm"><p className="font-medium">{o.orderNumber} — {o.user.name}</p><p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('id-ID')} • Rp {o.total.toLocaleString('id-ID')} • {o.status}</p></div>)}
      <Link to="/admin" onClick={()=>setOpen(false)} className="block text-center text-sm text-primary mt-2">Lihat Dashboard</Link>
    </div>}
  </div>
}
