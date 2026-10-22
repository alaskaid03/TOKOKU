import { useEffect, useState } from 'react'
let push = null
export function toast(msg, type='success'){
  if(push) push({msg, type, id: Date.now()})
}
export default function ToastContainer(){
  const [items,setItems]=useState([])
  useEffect(()=>{
    push = (t)=>{ setItems(s=>[...s, t]); setTimeout(()=> setItems(s=> s.filter(x=>x.id!==t.id)), 3000) }
    return ()=>{ push=null }
  },[])
  return <div className="fixed top-4 right-4 z-50 space-y-2">
    {items.map(t=> <div key={t.id} className={`px-4 py-2 rounded shadow text-sm text-white ${t.type==='error'?'bg-red-500':'bg-green-600'}`}>{t.msg}</div>)}
  </div>
}
