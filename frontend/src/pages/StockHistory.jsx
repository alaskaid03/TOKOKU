import { useEffect, useState } from 'react'
import api from '../lib/api'
export default function StockHistory(){
  const [logs,setLogs]=useState([])
  const [products,setProducts]=useState([])
  const [filter,setFilter]=useState('')
  const load=async()=>{
    const q = filter ? '?productId='+filter : ''
    const r=await api.get('/admin/stock-log'+q); setLogs(r.data)
  }
  useEffect(()=>{
    api.get('/products?limit=50').then(r=>setProducts(r.data.products))
    load()
  },[])
  useEffect(()=>{load()},[filter])
  return <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-xl font-bold mb-4">Riwayat Stok</h1>
    <div className="flex gap-2 mb-4">
      <select value={filter} onChange={e=>setFilter(e.target.value)} className="border p-2 rounded flex-1">
        <option value="">Semua produk</option>
        {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button onClick={load} className="bg-primary text-white px-4 rounded">Refresh</button>
    </div>
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-2">Waktu</th><th className="text-left">Produk</th><th>Perubahan</th><th className="text-left">Alasan</th></tr></thead>
      <tbody>{logs.map(l=> <tr key={l.id} className="border-t"><td className="p-2 text-xs">{new Date(l.createdAt).toLocaleString('id-ID')}</td><td>{l.product.name}</td><td className={l.change>0?'text-green-600':'text-red-600'}>{l.change>0?'+':''}{l.change}</td><td className="text-xs">{l.reason}</td></tr>)}</tbody></table>
      {logs.length===0 && <p className="text-center text-gray-400 py-6">Belum ada riwayat</p>}
    </div>
  </div>
}
