import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage(){
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if(!token) return;
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/my-posts?page=${page}&limit=6`,{headers:{'Authorization':`Bearer ${token}`}})
      .then(r=>{if(!r.ok) throw new Error('Failed'); return r.json()})
      .then(data=>{
        if(page===1) setPosts(data.posts||[]); else setPosts(p=>[...p,...(data.posts||[])]);
        setPages(data.pages||1);
      }).catch(()=>{
        if(page===1) setPosts([]);
      }).finally(()=>setLoading(false));
  },[token, page]);

  return (
    <div className="app">
      <TopBar />
      <h2>Profile - {user?.username || 'Guest'}</h2>
      <p className="tiny">Your stories</p>
      <div>
        {posts.map(p=> (
          <div key={p._id} className="post" style={{marginBottom:8}}>
            <div className="meta"><strong>{p.emotion}</strong><span>{p.title}</span></div>
            <p className="tiny">{p.excerpt}</p>
          </div>
        ))}
        {loading && <div style={{textAlign:'center',marginTop:8}}><span className="spinner"/></div>}
        {page < pages && !loading && <div style={{textAlign:'center',marginTop:8}}><button className="btn" onClick={()=>setPage(p=>p+1)}>Load more</button></div>}
      </div>
    </div>
  );
}
