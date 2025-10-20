import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from "../contexts/AuthContext";
import Spinner from '../components/Spinner';

export default function RegisterPage(){
	const [u,setU]=useState('');const [p,setP]=useState('');const [pc,setPc]=useState('');const nav=useNavigate();
	const { showToast } = useToast();
	const { login } = useAuth();
	const [loading,setLoading] = useState(false);
	const handle=async()=>{
		if(p.length < 6){ showToast('Password must be at least 6 characters','error'); return }
		if(p !== pc){ showToast('Passwords do not match','error'); return }
		setLoading(true);
		try{
			const res=await fetch('http://127.0.0.1:5000/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
			if(res.ok){
				// auto-login
				const r2 = await fetch('http://127.0.0.1:5000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
				const d = await r2.json();
				if(r2.ok){ login(d); showToast('Welcome!','success'); nav('/'); }
				else { showToast('Registered but auto-login failed','info'); nav('/login') }
			}else{const d=await res.json();showToast(d.error||'Registration failed','error')}
		}catch(e){showToast('Network error','error')}
		finally{setLoading(false)}
	};
	return(
		<div className="app">
			<h2>Register</h2>
			<div className="form">
				<input value={u} onChange={e=>setU(e.target.value)} placeholder='Username'/>
				<input type='password' value={p} onChange={e=>setP(e.target.value)} placeholder='Password'/>
				<input type='password' value={pc} onChange={e=>setPc(e.target.value)} placeholder='Confirm password'/>
				<button className="btn" onClick={handle} disabled={loading}>{loading? <Spinner/> : 'Register'}</button>
			</div>
		</div>
	);
}