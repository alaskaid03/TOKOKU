import { useEffect, useState } from 'react'
import api from '../lib/api'
import { toast } from '../components/Toast'
import { StockBadge } from '../components/Badge'
function imgUrl(p){ try{ const arr=JSON.parse(p.images||'[]'); return arr[0]||null }catch{ return null } }
export default function AdminProducts(){
  const [products,setProducts]=useState([])
  const [cats,setCats]=useState([])
  const [form,setForm]=useState({name:'',description:'',price:'',stock:'',categoryId:''})
  const [editing,setEditing]=useState(null)
  const [msg,setMsg]=useState('')
  const [files,setFiles]=useState([])
  const load=async()=>{
    const {data}=await api.get('/products?limit=50'); setProducts(data.products)
    const c=await api.get('/categories'); setCats(c.data)
    if(c.data.length && !form.categoryId && !editing) setForm(f=>({...f, categoryId:c.data[0].id}))
  }
  useEffect(()=>{load()},[])
  const startEdit=(p)=>{
    setEditing(p); setForm({name:p.name, description:p.description, price:String(p.price), stock:String(p.stock), categoryId:p.categoryId}); setFiles([]); window.scrollTo({top:0, behavior:'smooth'})
  }
  const cancelEdit=()=>{ setEditing(null); setFiles([]); setForm({name:'',description:'',price:'',stock:'',categoryId: cats[0]?.id||''}) }
  const submit=async(e)=>{
    e.preventDefault()
    try{
      const fd = new FormData()
      fd.append('name', form.name); fd.append('description', form.description); fd.append('price', form.price); fd.append('stock', form.stock); fd.append('categoryId', form.categoryId)
      files.forEach(f=> fd.append('images', f))
      if(editing){
        await api.put('/products/'+editing.id, fd, {headers:{'Content-Type':'multipart/form-data'}})
        toast('Produk diperbarui'); setEditing(null)
      } else {
        await api.post('/products', fd, {headers:{'Content-Type':'multipart/form-data'}})
        toast('Produk dibuat')
      }
      setForm({name:'',description:'',price:'',stock:'',categoryId: cats[0]?.id||''}); setFiles([]); load()
    }catch(err){ const m=err.response?.data?.message||'Gagal'; setMsg(m); toast(m,'error') }
  }
  const del=async(id)=>{ if(!confirm('Hapus produk ini?'))return; await api.delete('/products/'+id); toast('Produk dihapus'); load() }
  return <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-xl font-bold mb-4">Kelola Produk (Admin)</h1>
    {msg && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{msg}</div>}
    <form onSubmit={submit} className="bg-white p-4 rounded-xl shadow grid grid-cols-2 gap-3 mb-6">
      <div className="col-span-2 flex justify-between items-center"><span className="font-semibold text-sm">{editing?'Edit Produk: '+editing.name : 'Tambah Produk'}</span>{editing && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500">Batal</button>}</div>
      <input className="border p-2 rounded" placeholder="Nama produk" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      <input className="border p-2 rounded" placeholder="Harga" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
      <input className="border p-2 rounded col-span-2" placeholder="Deskripsi" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required />
      <input className="border p-2 rounded" placeholder="Stok" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required />
      <select className="border p-2 rounded" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <div className="col-span-2">
        <label className="text-sm font-medium">Foto produk (max 5, JPG/PNG/WEBP, 2MB)</label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,5))} className="w-full border p-2 rounded mt-1" />
        {files.length>0 && <p className="text-xs text-gray-500 mt-1">{files.length} file dipilih</p>}
      </div>
      <button className={`col-span-2 py-2 rounded font-semibold text-white ${editing?'bg-amber-600':'bg-primary'}`}>{editing?'Simpan Perubahan':' + Tambah Produk'}</button>
    </form>
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-2">Foto</th><th className="text-left p-2">Nama</th><th>Harga</th><th>Stok</th><th>Kategori</th><th>Aksi</th></tr></thead>
      <tbody>{products.map(p=>{
        const img=imgUrl(p)
        return <tr key={p.id} className="border-t"><td className="p-2">{img ? <img src={img} alt="" className="w-12 h-12 object-cover rounded" /> : <span className="text-gray-300">-</span>}</td><td className="p-2">{p.name}</td><td>Rp {p.price.toLocaleString('id-ID')}</td><td><StockBadge stock={p.stock} /></td><td>{p.category?.name}</td><td className="space-x-2"><button onClick={()=>startEdit(p)} className="text-primary">Edit</button><button onClick={()=>del(p.id)} className="text-red-500">Hapus</button></td></tr>
      })}</tbody></table>
    </div>
  </div>
}
