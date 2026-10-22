import { useEffect, useState } from 'react'
import api from '../lib/api'
export default function Orders(){
  const [orders,setOrders]=useState([])
  useEffect(()=>{ api.get('/orders/my').then(r=>setOrders(r.data)) },[])
  return <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-xl font-bold mb-4">Riwayat Pesanan</h1>
    {orders.length===0? <p className="text-gray-400">Belum ada pesanan</p> :
      orders.map(o=> <div key={o.id} className="bg-white p-4 rounded shadow mb-3">
        <div className="flex justify-between"><span className="font-semibold">{o.orderNumber}</span><span className="bg-yellow-100 px-2 py-0.5 rounded text-xs">{o.status} • {o.paymentStatus}</span></div>
        <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString('id-ID')}</p>
        {o.items.map(it=> <div key={it.id} className="text-sm flex justify-between mt-1"><span>{it.product.name} x {it.quantity}</span><span>Rp {it.subtotal.toLocaleString('id-ID')}</span></div>)}
        <p className="font-bold mt-2">Total: Rp {o.total.toLocaleString('id-ID')}</p>
      </div>)}
  </div>
}
