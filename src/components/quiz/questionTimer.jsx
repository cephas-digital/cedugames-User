import { useEffect, useRef, useState } from "react";

export default function QuestionTimer({seconds=30,paused=false,onTimeout}){
 const duration=Math.max(1,Number(seconds)||30),[remaining,setRemaining]=useState(duration),timeoutRef=useRef(onTimeout),expiredRef=useRef(false);
 useEffect(()=>{timeoutRef.current=onTimeout},[onTimeout]);
 useEffect(()=>{if(paused||expiredRef.current)return undefined;const timer=window.setInterval(()=>setRemaining(value=>{if(value<=1){window.clearInterval(timer);if(!expiredRef.current){expiredRef.current=true;window.setTimeout(()=>timeoutRef.current?.(),0)}return 0}return value-1}),1000);return()=>window.clearInterval(timer)},[paused,duration]);
 const percent=Math.max(0,remaining/duration*100),urgent=remaining<=Math.min(10,Math.ceil(duration*.25));
 return <div className="mx-auto mt-3 max-w-3xl rounded-xl bg-white/95 p-3 text-slate-800 shadow"><div className="mb-2 flex items-center justify-between text-sm font-black"><span>{urgent?"Hurry up!":"Time remaining"}</span><span className={urgent?"text-red-600":"text-purple-700"}>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,"0")}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent?"bg-red-500":"bg-emerald-500"}`} style={{width:`${percent}%`}}/></div></div>;
}
