import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavItem from "./NavItem";
import Badge from "./badge";
import { apiRequest, isSignedIn, USER_KEY } from "../services/api";

export default function Navbar() {
  const location=useLocation(),navigate=useNavigate();
  const [wallet,setWallet]=useState(null);
  const user=JSON.parse(localStorage.getItem(USER_KEY)||"null");
  useEffect(()=>{if(!isSignedIn())return undefined;let live=true;const load=()=>apiRequest("/gameplay/status").then(data=>{if(live)setWallet(data)}).catch(()=>undefined);load();window.addEventListener("cedugames:wallet-updated",load);return()=>{live=false;window.removeEventListener("cedugames:wallet-updated",load)}},[]);
  const navItems=[{label:"Home",to:"/age-selection/little-explore/math"},{label:"Leaderboard",to:"/leaderboard"},{label:"Shop",to:"/shop"},{label:"Profile",to:"/profile"}];
  const white=["/leaderboard","/shop","/profile","/notifications"].includes(location.pathname),text=white?"text-black":"text-white",bg=white?"bg-white":"bg-gradient-to-r from-purple-300/70 to-purple-400/60 backdrop-blur-md";
  const max=Number(wallet?.max_lives||3),lives=Number(wallet?.lives_remaining??max);
  return <header className={`w-full ${bg} flex flex-wrap items-center justify-between gap-3 rounded-none px-4 py-3 shadow-xl sm:rounded-xl sm:px-6 lg:flex-nowrap lg:px-8`}>
    <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-purple-500 text-white">👤</div><div><p className={`${text} text-sm font-medium`}>{user?.name||user?.username||"Player"}</p><p className={`text-xs ${white?"text-gray-600":"text-white/70"}`}>Ready to play</p></div></div>
    <nav className={`order-3 flex w-full items-center justify-between gap-2 border-t border-current/10 pt-3 font-medium lg:order-none lg:w-auto lg:justify-center lg:gap-10 lg:border-0 lg:pt-0 ${text}`}>{navItems.map(item=><NavItem key={item.label} {...item} active={location.pathname===item.to} textColor={text} activeColor={text}/>)}</nav>
    <div className="flex items-center gap-2 sm:gap-4"><Badge><span aria-label={`${lives} of ${max} lives remaining`}>{Array.from({length:max},(_,i)=><span key={i} className={i<lives?"text-red-500":"text-white/70 grayscale"}>{i<lives?"♥":"♡"}</span>)}</span></Badge><Badge>🪙 {Number(wallet?.coins_count||0).toLocaleString()}</Badge><button aria-label="Notifications" onClick={()=>navigate("/notification")} className={`grid h-10 w-10 place-items-center rounded-full ${white?"bg-gray-200":"bg-white/20"}`}>🔔</button></div>
  </header>;
}
