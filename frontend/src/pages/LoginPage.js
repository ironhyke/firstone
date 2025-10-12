import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Spinner from '../components/Spinner';

export default function LoginPage(){
	const [u,setU]=useState('');const [p,setP]=useState('');const nav=useNavigate();const {login}=useAuth();
	const { showToast } = useToast();
	const [loading,setLoading] = useState(false);
	const handle=async()=>{
		setLoading(true);
		try{
			const res=await fetch('http://127.0.0.1:5000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
			const d=await res.json();
			if(res.ok){login(d);showToast('Welcome back!','success');nav('/');}else{showToast(d.error||'Login failed','error')}
		}catch(e){showToast('Network error','error')}
		finally{setLoading(false)}
	};
	return(
		<div className="app">
			<h2>Login</h2>
			<div className="form">
				<input value={u} onChange={e=>setU(e.target.value)} placeholder='Username'/>
				<input type='password' value={p} onChange={e=>setP(e.target.value)} placeholder='Password'/>
				<button className="btn" onClick={handle} disabled={loading}>{loading? <Spinner/> : 'Login'}</button>
			</div>
		</div>
	);
}