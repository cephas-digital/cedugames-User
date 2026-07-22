import {useCallback,useEffect,useState} from "react";
import Navbar from "../../components/homeNavbar";
import {apiRequest,isSignedIn} from "../../services/api";

const periods=[{id:"all",label:"All time"},{id:"month",label:"Monthly"},{id:"week",label:"Weekly"}];
const points=(player,period)=>Number(period==="all"?player?.total_xp:player?.period_xp||0);

export default function Leaderboard(){
 const[players,setPlayers]=useState([]),[leaders,setLeaders]=useState([]),[me,setMe]=useState(null),[period,setPeriod]=useState("all"),[page,setPage]=useState(1),[pagination,setPagination]=useState({total:0,limit:20}),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const requests=[apiRequest(`/leaderboard?period=${period}&page=${page}&limit=20`),apiRequest(`/leaderboard?period=${period}&page=1&limit=3`)];if(isSignedIn())requests.push(apiRequest(`/leaderboard/me?period=${period}`));const[data,top,mine]=await Promise.all(requests);setPlayers(data.players||[]);setLeaders(top.players||[]);setPagination(data.pagination||{});setMe(mine?.player||null)}catch(e){setError(e.message)}finally{setLoading(false)}},[period,page]);
 useEffect(()=>{load()},[load]);
 useEffect(()=>{const refresh=()=>{if(document.visibilityState!=="hidden")load()};const timer=window.setInterval(refresh,30000);window.addEventListener("focus",refresh);document.addEventListener("visibilitychange",refresh);return()=>{window.clearInterval(timer);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh)}},[load]);
 const rest=players.slice(page===1?3:0);
 return <div><Navbar/><main className="min-h-screen bg-slate-100 p-3 sm:p-6"><section className="mx-auto max-w-6xl rounded-3xl bg-white p-3 shadow-sm sm:p-8">
  <LivePodium players={leaders} period={period}/>
  <div className="mb-7 mt-4 flex justify-center"><div className="flex rounded-xl bg-slate-100 p-1">{periods.map(item=><button key={item.id} onClick={()=>{setPeriod(item.id);setPage(1)}} className={`rounded-lg px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm ${period===item.id?"bg-white text-purple-700 shadow":"text-slate-500"}`}>{item.label}</button>)}</div></div>
  {me&&<div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 p-5 text-white"><div><p className="text-xs font-bold uppercase text-white/70">Your position</p><p className="text-2xl font-black">#{me.rank} · {me.name}</p></div><div className="flex gap-6 text-center"><Metric label="XP" value={points(me,period).toLocaleString()}/><Metric label="Completed" value={me.completed_levels}/><Metric label="Average" value={`${me.average_score}%`}/></div></div>}
  {error?<div className="rounded-xl bg-red-50 p-5 text-center text-red-700">{error}</div>:loading?<div className="py-24 text-center text-slate-400">Loading leaderboard…</div>:<><div className="overflow-hidden rounded-2xl border"><div className="grid grid-cols-[56px_1fr_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-400 sm:grid-cols-[70px_1fr_120px_120px]"><span>Rank</span><span>Player</span><span className="hidden sm:block">Completed</span><span>XP</span></div>{rest.map(player=><div key={player.id} className={`grid grid-cols-[56px_1fr_auto] items-center gap-3 border-t px-4 py-4 sm:grid-cols-[70px_1fr_120px_120px] ${me?.id===player.id?"bg-purple-50":""}`}><b className="text-lg text-purple-700">#{player.rank}</b><div><p className="font-bold text-slate-900">{player.name}</p><p className="text-xs text-slate-400">Average {player.average_score}% · {player.attempts} attempts</p></div><span className="hidden sm:block">{player.completed_levels} levels</span><b className="text-right">{points(player,period).toLocaleString()}</b></div>)}</div><div className="mt-5 flex items-center justify-between text-sm text-slate-500"><span>{pagination.total||0} ranked players</span><div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(value=>value-1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><button disabled={page*20>=(pagination.total||0)} onClick={()=>setPage(value=>value+1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div></>}
 </section></main></div>;
}

function LivePodium({players,period}){
 const byRank=rank=>players.find(player=>Number(player.rank)===rank);
 return <div className="mx-auto grid max-w-4xl grid-cols-3 items-end gap-2 pt-8 sm:gap-4 sm:pt-14" aria-label="Top three players"><PodiumPlayer rank={2} player={byRank(2)} period={period}/><PodiumPlayer rank={1} player={byRank(1)} period={period}/><PodiumPlayer rank={3} player={byRank(3)} period={period}/></div>;
}

function PodiumPlayer({rank,player,period}){
 const first=rank===1,second=rank===2;
 const surface=first?"from-violet-300 to-purple-200":second?"from-sky-200 to-blue-100":"from-amber-200 to-orange-100";
 const height=first?"h-52 sm:h-72":second?"h-44 sm:h-60":"h-40 sm:h-52";
 return <article className={`relative flex ${height} min-w-0 flex-col items-center rounded-t-2xl bg-gradient-to-b ${surface} px-1.5 pt-9 text-center shadow-lg sm:px-4 sm:pt-14`}><div className={`absolute left-1/2 top-0 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white text-2xl font-black text-white shadow-lg sm:h-24 sm:w-24 sm:text-4xl ${first?"bg-purple-600":second?"bg-sky-500":"bg-orange-500"}`}>{player?.name?.trim()?.[0]?.toUpperCase()||"?"}</div>{first&&<span className="absolute -top-14 left-1/2 -translate-x-1/2 text-4xl sm:-top-20 sm:text-6xl" aria-hidden="true">👑</span>}<span className="text-2xl sm:text-4xl" aria-label={`Rank ${rank}`}>{rank===1?"🥇":rank===2?"🥈":"🥉"}</span><h2 className="mt-2 w-full truncate text-xs font-black text-slate-900 sm:text-xl">{player?.name||"Waiting for player"}</h2><p className="mt-1 text-[9px] font-semibold text-slate-600 sm:text-sm">{player?`${player.completed_levels} completed ${Number(player.completed_levels)===1?"level":"levels"}`:"No ranking yet"}</p><p className="mt-2 text-xs font-black text-purple-800 sm:text-lg">{player?`${points(player,period).toLocaleString()} XP`:"—"}</p></article>;
}

function Metric({label,value}){return <div><p className="text-xl font-black">{value}</p><p className="text-xs text-white/70">{label}</p></div>}
