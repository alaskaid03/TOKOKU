import { useEffect, useState } from 'react'
import api from '../lib/api'
export default function Dashboard(){
  const [stats,setStats]=useState(null)
  useEffect(()=>{ api.get('/admin/stats').then(r=>setStats(r.data)).catch(()=>{}) },[])
  if(!stats) return <div className="p-6">Loading...</div>
  return <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow"><p className="text-sm text-gray-500">Total Produk</p><p className="text-2xl font-bold">{stats.totalProducts}</p></div>
      <div className="bg-white p-4 rounded-xl shadow"><p className="text-sm text-gray-500">Pelanggan</p><p className="text-2xl font-bold">{stats.totalUsers}</p></div>
      <div className="bg-white p-4 rounded-xl shadow"><p className="text-sm text-gray-500">Pesanan</p><p className="text-2xl font-bold">{stats.totalOrders}</p></div>
      <div className="bg-white p-4 rounded-xl shadow"><p className="text-sm text-gray-500">Pendapatan</p><p className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p></div>
    </div>
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Pesanan Terbaru</h2>
      {stats.recentOrders.length===0? <p className="text-gray-400 text-sm">Belum ada pesanan</p> :
        <table className="w-full text-sm"><thead><tr className="text-gray-500"><th className="text-left">No</th><th className="text-left">Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>{stats.recentOrders.map(o=><tr key={o.id} className="border-t"><td className="py-2">{o.orderNumber}</td><td>{o.user.name}</td><td>Rp {o.total.toLocaleString('id-ID')}</td><td><span className="bg-yellow-100 px-2 py-0.5 rounded text-xs">{o.status}</span></td></tr>)}</tbody></table>}
    </div>
  </div>
}
