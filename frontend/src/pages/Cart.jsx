import { useEffect, useState } from 'react'
import api from '../lib/api'
import { toast } from '../components/Toast'
export default function Cart(){
  const [items,setItems]=useState([])
  const [msg,setMsg]=useState('')
  const [address,setAddress]=useState('Jl. Test No 1, Jakarta')
  const [shippingCost,setShippingCost]=useState(15000)
  const [showConfirm,setShowConfirm]=useState(false)
  const load=async()=>{ const {data}=await api.get('/cart'); setItems(data) }
  useEffect(()=>{load()},[])
  const subtotal = items.reduce((s,i)=>s+i.product.price*i.quantity,0)
  const total = subtotal + Number(shippingCost||0)
  const doCheckout=async()=>{
    try{
      const {data}=await api.post('/orders',{shippingAddress: address, shippingCost: Number(shippingCost)||0, discount:0, paymentMethod:'TRANSFER'})
      setMsg('Order '+data.orderNumber+' dibuat! Total Rp '+data.total.toLocaleString('id-ID'))
      toast('Order '+data.orderNumber+' berhasil')
      setShowConfirm(false)
      load()
    }catch(e){ const m=e.response?.data?.message||'Gagal'; setMsg(m); toast(m,'error') }
  }
  return <div className="max-w-3xl mx-auto p-6">
    <h1 className="text-xl font-bold mb-4">Keranjang</h1>
    {msg && <div className="bg-green-100 p-2 rounded mb-3 text-sm">{msg}</div>}
    {items.map(i=> <div key={i.id} className="bg-white p-3 rounded shadow mb-2 flex justify-between"><span>{i.product.name} x {i.quantity}</span><span>Rp {(i.product.price*i.quantity).toLocaleString('id-ID')}</span></div>)}
    {items.length===0? <p className="text-gray-400">Keranjang kosong</p> : <>
      <div className="bg-white p-4 rounded-xl shadow mt-4 space-y-2">
        <p className="text-sm">Subtotal: Rp {subtotal.toLocaleString('id-ID')}</p>
        <label className="block text-sm">Alamat <input className="w-full border p-2 rounded mt-1" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Alamat pengiriman" /></label>
        <label className="block text-sm">Ongkir <input className="w-full border p-2 rounded mt-1" type="number" value={shippingCost} onChange={e=>setShippingCost(e.target.value)} /></label>
        <p className="font-bold">Total: Rp {total.toLocaleString('id-ID')}</p>
        <button onClick={()=>setShowConfirm(true)} className="w-full bg-primary text-white py-2 rounded font-semibold">Checkout</button>
      </div>
      {showConfirm && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
          <h3 className="font-bold mb-2">Konfirmasi Pesanan</h3>
          <p className="text-sm text-gray-600 mb-1">Alamat: {address}</p>
          <p className="text-sm">Subtotal Rp {subtotal.toLocaleString('id-ID')} + Ongkir Rp {Number(shippingCost||0).toLocaleString('id-ID')} = <b>Rp {total.toLocaleString('id-ID')}</b></p>
          <p className="text-sm text-gray-600 mb-4">{items.length} item</p>
          <div className="flex gap-2">
            <button onClick={()=>setShowConfirm(false)} className="flex-1 border py-2 rounded">Batal</button>
            <button onClick={doCheckout} className="flex-1 bg-primary text-white py-2 rounded">Bayar</button>
          </div>
        </div>
      </div>}
    </>}
  </div>
}
