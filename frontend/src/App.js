import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WritePage from "./components/WritePage";
import HeartsPage from "./pages/HeartsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import TradePage from "./pages/TradePage";
import SearchPage from "./pages/SearchPage";
import ProfileEditPage from "./pages/ProfileEditPage";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/hearts" element={<HeartsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
  <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </div>
  );
}
