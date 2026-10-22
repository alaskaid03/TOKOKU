import React from 'react'
export function StockBadge({stock}){
  if(stock===0) return <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Habis</span>
  if(stock<5) return <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Stok rendah: {stock}</span>
  return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Stok {stock}</span>
}
