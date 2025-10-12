import React, { useState, useEffect, useRef } from 'react';
export default function PostCard({post}){
  const date = new Date(post.createdAt).toLocaleString();
  const [i, setI] = useState(0);
  const imgsRaw = post.images || [];
  const BACKEND_ORIGIN = process.env.REACT_APP_API || 'http://127.0.0.1:5000';
  // normalize image URLs: allow absolute URLs, or join backend origin with paths like '/uploads/x' or 'uploads/x'
  const imgs = imgsRaw.map(raw => {
    const src = (raw || '').toString().trim();
    if(!src) return null;
    if(src.startsWith('http://') || src.startsWith('https://')) return src;
    // ensure leading slash
    const path = src.startsWith('/') ? src : '/' + src;
    // remove any double slashes when joining
    return (BACKEND_ORIGIN.replace(/\/$/, '') + path);
  }).filter(Boolean);
  const ref = useRef();
  const next = ()=> setI(n=> (n+1)%imgs.length);
  const prev = ()=> setI(n=> (n-1+imgs.length)%imgs.length);
  // keyboard navigation
  useEffect(()=>{
    const h = (e)=>{
      if(!imgs.length) return;
      if(e.key === 'ArrowLeft') prev();
      if(e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    return ()=> window.removeEventListener('keydown', h);
  },[imgs.length]);
  // touch swipe
  useEffect(()=>{
    let startX = 0;
    const el = ref.current;
    if(!el) return;
    const onStart = (e)=> startX = e.touches ? e.touches[0].clientX : e.clientX;
    const onEnd = (e)=>{
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const dx = endX - startX;
      if(Math.abs(dx) > 40){ if(dx>0) prev(); else next(); }
    };
    el.addEventListener('touchstart', onStart);
    el.addEventListener('touchend', onEnd);
    el.addEventListener('mousedown', onStart);
    el.addEventListener('mouseup', onEnd);
    return ()=>{
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('mousedown', onStart);
      el.removeEventListener('mouseup', onEnd);
    };
  },[imgs.length]);
  return (
    <article className="post" aria-labelledby={`post-${post._id}`}>
      {imgs.length>0 && (
        <div className="post-image" ref={ref}>
          <img src={imgs[i]} alt="post image" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%230b0a10"/><text x="50%" y="50%" fill="%23aaa" font-size="20" text-anchor="middle">Image not available</text></svg>'}} data-src={imgs[i]} />
          {imgs.length>1 && <div className="carousel-controls"><button onClick={prev} className="btn secondary">‹</button><button onClick={next} className="btn secondary">›</button></div>}
          {imgs.length>1 && <div className="dots">{imgs.map((_,idx)=> <button key={idx} className={idx===i? 'active':''} onClick={()=>setI(idx)}>{'•'}</button>)}</div>}
          {imgs.length>1 && <div className="img-count">{i+1}/{imgs.length}</div>}
        </div>
      )}
      <div className="meta"><strong>{post.emotion}</strong><h4 id={`post-${post._id}`} style={{margin:0}}>{post.title}</h4></div>
      <p className="tiny">{post.excerpt}</p>
      <div className="meta-row tiny" style={{marginTop:8}}><span>By {post.author}</span><span>{date}</span></div>
    </article>
  );
}
