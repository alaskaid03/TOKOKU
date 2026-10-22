import { create } from 'zustand'
import api from '../lib/api'
function persistAuth(token, user){
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
export const useAuth = create((set)=>({
  user: JSON.parse(localStorage.getItem('user')||'null'),
  token: localStorage.getItem('token')||null,
  setAuth: (token, user)=>{ persistAuth(token,user); set({user, token}) },
  login: async (email,password)=>{
    const {data}=await api.post('/auth/login',{email,password})
    persistAuth(data.token, data.user)
    set({user:data.user, token:data.token})
    return data.user
  },
  register: async (name,email,password)=>{
    const {data}=await api.post('/auth/register',{name,email,password})
    persistAuth(data.token, data.user)
    set({user:data.user, token:data.token})
    return data.user
  },
  logout: ()=>{ localStorage.clear(); set({user:null, token:null}) }
}))
