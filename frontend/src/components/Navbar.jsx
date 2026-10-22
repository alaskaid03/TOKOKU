import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import AdminBell from './AdminBell'
export default function Navbar(){
  const {user, logout} = useAuth()
  const nav = useNavigate()
  const handleLogout = ()=>{ logout(); nav('/login') }
  return <nav className="bg-dark text-white px-6 py-3 flex items-center justify-between">
    <Link to="/" className="font-bold text-xl">TokoKu 🛒</Link>
    <div className="flex gap-4 items-center text-sm">
      <Link to="/products">Produk</Link>
      {user?.role==='ADMIN' && <Link to="/admin" className="bg-primary px-3 py-1 rounded">Dashboard</Link>}
      {user?.role==='ADMIN' && <Link to="/admin/products">Kelola Produk</Link>}
      {user?.role==='ADMIN' && <Link to="/admin/reports">Laporan</Link>}
      {user?.role==='ADMIN' && <Link to="/admin/stock">Stok</Link>}
      {user?.role==='ADMIN' && <Link to="/admin/system" className="border border-white/30 px-3 py-1 rounded">System</Link>}
      {user?.role==='ADMIN' && <AdminBell />}
      {user && <Link to="/cart">Keranjang</Link>}
      {user && <Link to="/orders">Pesanan</Link>}
      {!user ? <><Link to="/login">Login</Link><Link to="/register" className="bg-primary px-3 py-1 rounded">Register</Link></> :
        <><span className="opacity-80">{user.name} ({user.role})</span><button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button></>}
    </div>
  </nav>
}
