import React, { useState } from "react";
import { useHearts } from "../contexts/HeartContext";
import GetHeartsModal from '../components/GetHeartsModal';

export default function HeartsPage(){
  const { hearts, addHearts } = useHearts();
  const [open, setOpen] = useState(false);
  return(
    <div className="app">
      <h2>Hearts: {hearts}</h2>
      <button className="btn secondary" onClick={()=>setOpen(true)}>Get More</button>
      {open && <GetHeartsModal onClose={()=>setOpen(false)} />}
    </div>
  );
}
