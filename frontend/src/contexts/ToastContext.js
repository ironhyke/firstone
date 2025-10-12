import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, opts = {}) => {
    const { duration = 3000, type = 'info' } = opts;
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);
  const remove = useCallback((id)=> setToasts(t => t.filter(x=>x.id!==id)),[]);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} onClick={()=>remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
