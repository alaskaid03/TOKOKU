import { useEffect, useState } from 'react'
import api from '../lib/api'
export default function SystemMonitor(){
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=async()=>{
    setLoading(true); setError('')
    try{ const r=await api.get('/system/status'); setData(r.data) }
    catch(e){ setError(e.response?.data?.message||'Gagal memuat status') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{load()},[])
  if(loading) return <div className="p-6">Memuat System Monitor...</div>
  if(error) return <div className="p-6"><div className="bg-red-100 text-red-700 p-3 rounded">{error}</div><button onClick={load} className="mt-3 bg-dark text-white px-4 py-1 rounded">Coba lagi</button></div>
  const {backend,database,backup,disk,system} = data
  const ok = (s)=> s==='ok' ? '✅' : '❌'
  return <div className="max-w-5xl mx-auto p-6">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-bold">System Monitor</h1>
      <button onClick={load} className="bg-primary text-white px-4 py-1.5 rounded text-sm">Refresh</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">Backend {ok(backend.status)}</h3>
        <p className="text-sm text-gray-600">Uptime: {Math.floor(backend.uptimeSec/60)}m {backend.uptimeSec%60}s</p>
        <p className="text-xs text-gray-400">{backend.time}</p>
        <p className="text-xs">Latency: {backend.latencyMs}ms</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">Database {ok(database.status)}</h3>
        <p className="text-sm">Latency: {database.latencyMs}ms</p>
        <p className="text-sm">Ukuran: {database.size?.human || '-'}</p>
        <p className="text-xs text-gray-400">{database.size?.mtime || ''}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">Backup</h3>
        <p className="text-sm">{backup.lastBackup ? `Terakhir: ${backup.lastBackup.file}` : 'Belum ada backup'}</p>
        <p className="text-xs text-gray-400">{backup.lastBackup?.time || ''}</p>
        <p className="text-sm">Total file: {backup.backupCount}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">Produk & Order</h3>
        <p className="text-sm">Total produk: {database.totalProducts}</p>
        <p className="text-sm">Order hari ini: {database.ordersToday}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">Disk</h3>
        {disk?.map((d,i)=><div key={i} className="text-sm">{d.drive || d.note}: {d.freeHuman || (d.free/1024/1024/1024).toFixed(1)+' GB free'} {d.sizeHuman?`/ ${d.sizeHuman}`:''}</div>)}
        {!disk && <p className="text-sm text-gray-400">Tidak tersedia</p>}
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold">System</h3>
        <p className="text-sm">{system.hostname} — {system.platform} {system.arch}</p>
        <p className="text-sm">CPU: {system.cpus} core</p>
        <p className="text-xs text-gray-400">RAM free {(system.freemem/1024/1024/1024).toFixed(1)} GB / {(system.totalmem/1024/1024/1024).toFixed(1)} GB</p>
      </div>
    </div>
  </div>
}
