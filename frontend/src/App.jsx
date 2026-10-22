import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ToastContainer from './components/Toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import AdminProducts from './pages/AdminProducts'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import SystemMonitor from './pages/SystemMonitor'
import Reports from './pages/Reports'
import StockHistory from './pages/StockHistory'
import { useAuth } from './stores/auth'
function Guard({children, admin}){
  const {user}=useAuth()
  if(!user) return <Navigate to="/login" />
  if(admin && user.role!=='ADMIN') return <Navigate to="/products" />
  return children
}
export default function App(){
  return <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Navigate to="/products" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/cart" element={<Guard><Cart/></Guard>} />
        <Route path="/orders" element={<Guard><Orders/></Guard>} />
        <Route path="/admin" element={<Guard admin><Dashboard/></Guard>} />
        <Route path="/admin/products" element={<Guard admin><AdminProducts/></Guard>} />
        <Route path="/admin/reports" element={<Guard admin><Reports/></Guard>} />
        <Route path="/admin/stock" element={<Guard admin><StockHistory/></Guard>} />
        <Route path="/admin/system" element={<Guard admin><SystemMonitor/></Guard>} />
      </Routes>
    </div>
  </BrowserRouter>
}
