import React, { createContext, useContext, useState, useEffect } from "react";
const HeartContext = createContext();
export function HeartProvider({ children }) {
  const [hearts, setHearts] = useState(() => Number(localStorage.getItem("hearts") || 5));
  const [unlocked, setUnlocked] = useState(() => JSON.parse(localStorage.getItem("unlocked") || "[]"));
  useEffect(() => localStorage.setItem("hearts", hearts), [hearts]);
  useEffect(() => localStorage.setItem("unlocked", JSON.stringify(unlocked)), [unlocked]);
  const addHearts = (n) => setHearts(h => h + n);
  const unlockPost = (id, cost) => {
    if (unlocked.includes(id)) return { ok: true };
    if (hearts < cost) return { ok: false, message: "Not enough hearts" };
    setHearts(h => h - cost);
    setUnlocked(u => [...u, id]);
    return { ok: true };
  };
  return <HeartContext.Provider value={{ hearts, addHearts, unlockPost, unlocked }}>{children}</HeartContext.Provider>;
}
export const useHearts = () => useContext(HeartContext);
