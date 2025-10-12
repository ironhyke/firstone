import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function TradePage(){
  const { token } = useAuth();
  const { showToast } = useToast();
  const [toUser,setToUser] = useState('');
  const [item,setItem] = useState('');
  const [loading,setLoading] = useState(false);
  const submit = async ()=>{
    if(!token){ showToast('Login to trade','error'); return }
    setLoading(true);
    try{
      const r = await fetch('http://127.0.0.1:5000/api/trade',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({ toUser, item, message: '' })});
      if(r.ok){ showToast('Trade request sent','success'); setToUser(''); setItem('') } else { const d=await r.json(); showToast(d.error||'Trade failed','error') }
    }catch(e){ showToast('Network error','error') }
    finally{ setLoading(false) }
  };
  return (
    <div className="app">
      <TopBar />
      <h2>Trade</h2>
      <div className="form">
        <input value={toUser} onChange={e=>setToUser(e.target.value)} placeholder='Recipient username'/>
        <input value={item} onChange={e=>setItem(e.target.value)} placeholder='Item or hearts'/>
        <button className="btn" onClick={submit} disabled={loading}>{loading? 'Sending...':'Send Request'}</button>
      </div>
    </div>
  );
}

