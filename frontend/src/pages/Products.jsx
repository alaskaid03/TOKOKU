import { useEffect, useState } from 'react'
import api from '../lib/api'
import { toast } from '../components/Toast'
import { StockBadge } from '../components/Badge'
function imgUrl(p){ try{ const arr=JSON.parse(p.images||'[]'); return arr[0]||null }catch{ return null } }
export default function Products(){
  const [products,setProducts]=useState([])
  const [search,setSearch]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const load=async()=>{
    setLoading(true); setError('')
    try{ const {data}=await api.get('/products?search='+encodeURIComponent(search)); setProducts(data.products) }
    catch(e){ setError(e.response?.data?.message||'Gagal memuat produk') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{load()},[])
  const addToCart=async(productId)=>{
    try{ await api.post('/cart',{productId, quantity:1}); toast('Ditambah ke keranjang') }
    catch(e){ toast(e.response?.data?.message||'Gagal','error') }
  }
  return <div className="max-w-6xl mx-auto p-6">
    <div className="flex gap-2 mb-6">
      <input className="border p-2 rounded flex-1" placeholder="Cari produk..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} />
      <button onClick={load} className="bg-primary text-white px-6 rounded">Cari</button>
    </div>
    {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>}
    {loading ? <p className="text-center text-gray-400">Memuat...</p> : <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p=> {
          const img = imgUrl(p)
          return <div key={p.id} className="bg-white rounded-xl shadow p-4">
            {img ? <img src={img} alt={p.name} className="h-32 w-full object-cover rounded" onError={e=>e.target.style.display='none'} /> : <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-3xl">📦</div>}
            <h3 className="font-semibold mt-2">{p.name}</h3>
            <p className="text-xs text-gray-500">{p.category?.name}</p>
            <div className="mt-1"><StockBadge stock={p.stock} /></div>
            <p className="font-bold text-primary mt-1">Rp {p.price.toLocaleString('id-ID')}</p>
            <button onClick={()=>addToCart(p.id)} className="w-full mt-2 bg-dark text-white py-1.5 rounded text-sm">+ Keranjang</button>
          </div>
        })}
      </div>
      {products.length===0 && <p className="text-center text-gray-400 mt-10">Tidak ada produk</p>}
    </>}
  </div>
}
