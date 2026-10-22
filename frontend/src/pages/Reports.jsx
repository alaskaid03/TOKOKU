import { useEffect, useState } from 'react'
import api from '../lib/api'
export default function Reports(){
  const [range,setRange]=useState('daily')
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=async()=>{
    setLoading(true); setError('')
    try{ const r=await api.get('/admin/sales?range='+range); setData(r.data) }
    catch(e){ setError(e.response?.data?.message||'Gagal') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{load()},[range])
  if(loading) return <div className="p-6">Memuat laporan...</div>
  if(error) return <div className="p-6 text-red-600">{error}</div>
  return <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-xl font-bold mb-4">Laporan Penjualan</h1>
    <div className="flex gap-2 mb-4">
      <button onClick={()=>setRange('daily')} className={`px-4 py-1 rounded ${range==='daily'?'bg-primary text-white':'bg-white border'}`}>Harian</button>
      <button onClick={()=>setRange('weekly')} className={`px-4 py-1 rounded ${range==='weekly'?'bg-primary text-white':'bg-white border'}`}>Mingguan (7 hari)</button>
      <button onClick={load} className="ml-auto bg-dark text-white px-4 py-1 rounded text-sm">Refresh</button>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow"><p className="text-sm text-gray-500">Total Pesanan</p><p className="text-2xl font-bold">{data.totalOrders}</p></div>
      <div className="bg-white p-4 rounded-xl shadow"><p className="text-sm text-gray-500">Pendapatan</p><p className="text-2xl font-bold">Rp {data.totalRevenue.toLocaleString('id-ID')}</p></div>
    </div>
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">Rincian Harian</h3>
      {data.daily.length===0? <p className="text-gray-400 text-sm">Belum ada transaksi</p> :
        <table className="w-full text-sm"><thead><tr className="text-gray-500"><th className="text-left">Tanggal</th><th>Order</th><th className="text-right">Pendapatan</th></tr></thead>
        <tbody>{data.daily.map(d=> <tr key={d.date} className="border-t"><td>{d.date}</td><td>{d.orders}</td><td className="text-right">Rp {d.revenue.toLocaleString('id-ID')}</td></tr>)}</tbody></table>}
      {data.weekly && <p className="text-xs text-gray-400 mt-2">Rata-rata per hari: Rp {data.weekly.avgPerDay.toLocaleString('id-ID')}</p>}
    </div>
    <p className="text-xs text-gray-400 mt-2">Sejak: {new Date(data.since).toLocaleString('id-ID')}</p>
  </div>
}
