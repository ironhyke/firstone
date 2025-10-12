import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
export default function WritePage() {
  const [title,setTitle]=useState('');const [content,setContent]=useState('');
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef();
  const submit=async()=>{
    if(!token){showToast('You must be logged in to post','error'); return}
    setLoading(true);
    try{
      const fd = new FormData();
      fd.append('title', title);
      fd.append('excerpt', content);
      fd.append('content', content);
      fd.append('emotion', '✍️');
      files.forEach(f=> fd.append('images', f));

      // use XHR to track upload progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', 'http://127.0.0.1:5000/api/posts', true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(xhr.responseText || 'Upload failed'));
        };
        xhr.onerror = function(){ reject(new Error('Network error')) };
        xhr.send(fd);
      });
      showToast('Post published','success');
      setTitle('');setContent('');setFiles([]);setPreviews([]);setProgress(0);
      window.dispatchEvent(new Event('refreshPosts'));
      navigate('/', { replace: false });
    }catch(e){
      showToast((e && e.message) || 'Network error','error');
    }finally{setLoading(false)}
  };

  const onFiles = (list) => {
    const arr = Array.from(list||[]).slice(0,6);
    setFiles(arr);
    const p = arr.map(f => URL.createObjectURL(f));
    setPreviews(p);
  };

  const removePreview = (idx) => {
    // revoke object url to free memory
    URL.revokeObjectURL(previews[idx]);
    const nfiles = files.filter((_,i)=>i!==idx);
    const npre = previews.filter((_,i)=>i!==idx);
    setFiles(nfiles); setPreviews(npre);
  };

  // cleanup on unmount
  React.useEffect(()=>{
    return ()=>{
      previews.forEach(p=>{ try{ URL.revokeObjectURL(p) }catch(e){} });
      if(xhrRef.current){ try{ xhrRef.current.abort() }catch(e){} }
    };
  },[]);
  return(
    <div className="write">
      <h2>Write Emotion</h2>
      <div className="form">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder='Title'/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder='Content'/>
        <input type="file" accept="image/*" multiple onChange={e=>onFiles(e.target.files)} />
        {previews.length>0 && <div className="preview-grid">{previews.map((src,idx)=> (
          <div key={idx} className="preview-item"><img src={src} alt="preview"/><button className="btn secondary" onClick={()=>removePreview(idx)}>Remove</button></div>
        ))}</div>}
        {progress>0 && <div className="progress"><div className="bar" style={{width:progress+'%'}}/></div>}
        <button className="btn" onClick={submit} disabled={loading}>{loading? <Spinner/> : 'Submit'}</button>
      </div>
    </div>
  );
}
