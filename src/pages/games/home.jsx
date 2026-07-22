import BG from "../../assets/Group 28.png";
import Navbar from "../../components/homeNavbar";
import {useCallback,useEffect,useRef,useState} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";
import {apiRequest} from "../../services/api";

const melody=[523.25,659.25,783.99,659.25,587.33,698.46,783.99,0];
const horizontal=[50,39,54,42,55,63,61,51,43];

async function loadLevels(categoryId){
 try{return await apiRequest(`/gameplay/categories/${categoryId}/levels`)}
 catch(error){
  if(!/route not found/i.test(error.message))throw error;
  const legacy=await apiRequest(`/catalog/categories/${categoryId}/levels`);
  return{...legacy,levels:(legacy.levels||[]).map((level,index)=>({...level,best_score:0,completed:false,unlocked:index===0}))};
 }
}

export default function Home(){
 const navigate=useNavigate(),[params]=useSearchParams(),categoryId=params.get("category"),ageId=params.get("ageGroup");
 const[levels,setLevels]=useState([]),[selectedId,setSelectedId]=useState(""),[loading,setLoading]=useState(Boolean(categoryId)),[error,setError]=useState(categoryId?"":"Choose a subject before selecting a level."),[soundOn,setSoundOn]=useState(true);const audioRef=useRef(null),timerRef=useRef(null);
 const stop=useCallback(()=>{window.clearTimeout(timerRef.current);timerRef.current=null;if(audioRef.current){audioRef.current.close();audioRef.current=null}},[]);
 const start=useCallback(()=>{if(!soundOn||audioRef.current)return;const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;const context=new AudioContext();audioRef.current=context;let index=0;const play=()=>{if(audioRef.current!==context)return;const frequency=melody[index%melody.length];if(frequency){const oscillator=context.createOscillator(),gain=context.createGain();oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,context.currentTime);gain.gain.exponentialRampToValueAtTime(.03,context.currentTime+.04);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.35);oscillator.connect(gain).connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.38)}index+=1;timerRef.current=window.setTimeout(play,460)};context.resume().then(play).catch(stop)},[soundOn,stop]);
 useEffect(()=>{if(!soundOn){stop();return undefined}window.addEventListener("pointerdown",start,{once:true});return()=>window.removeEventListener("pointerdown",start)},[soundOn,start,stop]);useEffect(()=>stop,[stop]);
 useEffect(()=>{if(!categoryId)return;loadLevels(categoryId).then(data=>{const found=data.levels||[];setLevels(found);const available=[...found].reverse().find(level=>level.unlocked);setSelectedId(available?.id||"")}).catch(requestError=>setError(requestError.message)).finally(()=>setLoading(false))},[categoryId]);
 const selected=levels.find(level=>level.id===selectedId),mapHeight=Math.max(580,levels.length*112+120);
 return <div className="flex min-h-screen w-full flex-col overflow-hidden text-white" style={{backgroundImage:`url(${BG})`,backgroundSize:"cover",backgroundPosition:"center"}}><Navbar/><button type="button" onClick={()=>setSoundOn(value=>!value)} aria-label={soundOn?"Turn music off":"Turn music on"} className="fixed right-3 top-32 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-xl shadow-lg backdrop-blur sm:right-6 lg:top-24">{soundOn?"🔊":"🔇"}</button>
 <main className="relative flex-1 overflow-y-auto"><div className="sticky top-3 z-20 mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-xl items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 text-slate-800 shadow-lg backdrop-blur"><button onClick={()=>navigate(`/age-selection/little-explore?ageGroup=${ageId||""}`)} className="rounded-xl border px-3 py-2 text-sm font-bold text-purple-700">← Subjects</button><div className="min-w-0 text-center"><p className="truncate font-black">{selected?.name||"Choose a level"}</p>{selected&&<p className="text-xs text-slate-500">Best score {selected.best_score}% · {selected.time_limit_seconds}s per question</p>}</div><span className="rounded-full bg-purple-100 px-3 py-2 text-xs font-black text-purple-700">{levels.filter(level=>level.completed).length}/{levels.length}</span></div>
 {loading?<MapState text="Loading your learning path…"/>:error?<MapState text={error} error/>:levels.length?<div className="relative mx-auto w-full max-w-5xl" style={{height:mapHeight}}>{levels.map((level,index)=>{const isSelected=level.id===selectedId;return <button key={level.id} disabled={!level.unlocked} onClick={()=>setSelectedId(level.id)} style={{left:`calc(${horizontal[index%horizontal.length]}% - 44px)`,bottom:index*108+95}} className={`absolute z-10 grid h-[88px] w-[88px] place-items-center rounded-full border-4 text-center shadow-lg transition sm:h-24 sm:w-24 ${level.completed?"border-emerald-300 bg-emerald-50 text-emerald-800":level.unlocked?isSelected?"scale-110 border-purple-500 bg-purple-600 text-white":"border-white bg-white/90 text-slate-800 hover:scale-105":"cursor-not-allowed border-white/80 bg-slate-200/85 text-slate-500"}`}><span><span className="block text-xl">{level.completed?"✓":level.unlocked?"★":"🔒"}</span><span className="text-xs font-black">Level {level.level_number}</span></span></button>})}</div>:<MapState text="No levels are available for this subject yet."/>}
 </main><div className="fixed inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-slate-900/50 to-transparent p-4 pt-10"><button disabled={!selected} onClick={()=>navigate(`/quiz?ageGroup=${ageId}&category=${categoryId}&level=${selected.id}`)} className="home-start-button w-full max-w-sm rounded-2xl bg-purple-600 px-6 py-4 text-lg font-black text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-50">{selected?`Play Level ${selected.level_number}`:"Select an unlocked level"}</button></div></div>;
}
function MapState({text,error=false}){return <div className={`mx-auto mt-24 max-w-md rounded-2xl p-6 text-center font-bold shadow-lg ${error?"bg-red-50 text-red-700":"bg-white/90 text-slate-600"}`}>{text}</div>}
