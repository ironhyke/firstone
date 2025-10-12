import React from 'react';
export default function GetHeartsModal({onClose}){
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Get More Hearts</h3>
        <div className="option"><div><strong>Watch Ad</strong><div className="tiny">Earn 1 heart</div></div><button className="btn secondary">Watch</button></div>
        <div className="option"><div><strong>Starter Pack</strong><div className="tiny">5 hearts</div></div><button className="btn">$0.99</button></div>
        <div style={{textAlign:'center',marginTop:8}}><button className="btn secondary" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
