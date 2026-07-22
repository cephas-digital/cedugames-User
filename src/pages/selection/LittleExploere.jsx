import {useEffect,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import Navbar from "../../components/navbar";
import welcome from "../../assets/image.png";
import fallback from "../../assets/math.png";
import AgeCard from "../../components/ageCard";
import WelcomeCard from "../../components/welcomeCard";
import {apiRequest} from "../../services/api";

export default function Categories(){
 const[params]=useSearchParams(),ageId=params.get("ageGroup"),[items,setItems]=useState([]),[loading,setLoading]=useState(Boolean(ageId)),[error,setError]=useState(ageId?"":"Select an age group first.");
 useEffect(()=>{if(!ageId)return;apiRequest(`/catalog/age-groups/${ageId}/categories`).then(data=>setItems(data.categories||[])).catch(requestError=>setError(requestError.message)).finally(()=>setLoading(false))},[ageId]);
 return <div className="min-h-screen bg-slate-100"><Navbar/><main className="space-y-5 px-3 py-4 sm:space-y-10 sm:px-6 sm:py-8 lg:px-10"><WelcomeCard image={welcome} header="Pick a Subject and Let's Play to Learn!" text="Choose a category to see its available learning levels."/><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8"><div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-purple-600">Learning categories</p><h1 className="mt-1 text-xl font-black text-slate-800 sm:text-2xl">Select your subject</h1><p className="mt-1 text-sm text-slate-500">Tap one subject to view its levels.</p></div><Link to="/age-selection" className="shrink-0 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 active:scale-95">Change age</Link></div>
 {loading?<p className="py-16 text-center text-slate-400">Loading categories…</p>:error?<p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>:items.length?<div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">{items.map((item,index)=><div key={item.id} className="relative"><span className="absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-purple-600 text-sm font-black text-white shadow" aria-hidden="true">{index+1}</span><AgeCard link={`/play?ageGroup=${ageId}&category=${item.id}`} image={item.image_url||fallback} title={item.name} subtitle={`${item.level_count||0} ${Number(item.level_count)===1?"level":"levels"} available`} description={item.description||"Open this subject and start learning."} color="bg-purple-50" className="min-h-[220px] border-purple-300 pl-5 sm:min-h-[240px]"/></div>)}</div>:<div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-400">No categories are available for this age group yet.</div>}
 </section></main></div>;
}
