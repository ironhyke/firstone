import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHearts } from "../contexts/HeartContext";
import { useAuth } from "../contexts/AuthContext";

export default function TopBar() {
  const { hearts } = useHearts();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav('/'); };
  return (
    <header className="topbar">
      <Link to="/" className="brand">Emotionally</Link>
      <nav className="nav">
        <Link to="/write">Write</Link>
        <Link to="/hearts">Hearts ({hearts})</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <Link to="/profile">{user.username}</Link>}
        {user && <a href="#" onClick={(e)=>{e.preventDefault();doLogout();}}>Logout</a>}
      </nav>
    </header>
  );
}
