import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import PostCard from '../components/PostCard';
import { useToast } from '../contexts/ToastContext';

export default function SearchPage(){
  const [q,setQ] = useState('');
  const [results,setResults] = useState([]);
  const { showToast } = useToast();
  const run = async()=>{
    try{
      const r = await fetch(`http://127.0.0.1:5000/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json(); setResults(d);
    }catch(e){ showToast('Search failed','error') }
  };
  return (
    <div className="app">
      <TopBar />
      <h2>Search</h2>
      <div className="form"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search posts"/><button className="btn" onClick={run}>Search</button></div>
      <div style={{marginTop:12}}>{results.map(p=> <PostCard key={p._id} post={p} />)}</div>
    </div>
  );
}

