import React from 'react';
import { Link, useLocation } from 'react-router-dom';
export default function BottomNav(){
  const loc = useLocation();
  return (
    <nav className="bottom-nav">
      <Link to="/" className={loc.pathname==='/'? 'active':''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12v7a1 1 0 0 0 1 1h3v-5h6v5h3a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <small>Home</small>
      </Link>
      <Link to="/search" className={loc.pathname==='/search'? 'active':''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5"/></svg>
        <small>Search</small>
      </Link>
      <Link to="/write" className={loc.pathname==='/write'? 'active':''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 3.5a2.121 2.121 0 113 3L8 18l-4 1 1-4 11.5-11.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <small>Write</small>
      </Link>
      <Link to="/trade" className={loc.pathname==='/trade'? 'active':''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 9v-4a1 1 0 0 1 1-1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 9l-9 6-9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <small>Trade</small>
      </Link>
      <Link to="/profile" className={loc.pathname==='/profile'? 'active':''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
        <small>Profile</small>
      </Link>
    </nav>
  );
}
