import React from 'react';
export default function Spinner({ size=18 }){
  const style = { width: size, height: size, display:'inline-block' };
  return <span className="spinner" style={style} aria-hidden="true" />;
}
