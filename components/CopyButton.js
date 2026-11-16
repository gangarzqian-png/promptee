'use client';
import { useState } from 'react';
export default function CopyButton({text}){
  const [ok,setOk]=useState(false);
  return <button type="button" className="btn" style={{marginTop:10}} onClick={async()=>{try{await navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),1500)}catch{}}}>{ok?'コピーしました ✓':'プロンプトをコピー'}</button>;
}
