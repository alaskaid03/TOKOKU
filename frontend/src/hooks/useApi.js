import { useState, useCallback } from 'react'
export function useApi(fn){
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const exec = useCallback(async (...args)=>{
    setLoading(true); setError('')
    try{ const r = await fn(...args); setData(r.data ?? r); return r }
    catch(e){ const msg=e.response?.data?.message||e.message; setError(msg); throw e }
    finally{ setLoading(false) }
  },[fn])
  return { data, loading, error, exec, setData }
}
