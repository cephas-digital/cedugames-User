import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/homeNavbar";
import Coin from "../../assets/coin.png";
import CoinHeader from "../../assets/coin-header.png";
import { apiRequest, isSignedIn } from "../../services/api";

const money = (minor, currency) => new Intl.NumberFormat("en-NG", { style:"currency", currency:currency || "NGN", maximumFractionDigits:2 }).format(Number(minor || 0) / 100);
const dateTime = (value) => new Intl.DateTimeFormat("en-NG", { dateStyle:"medium", timeStyle:"short" }).format(new Date(value));

export default function CoinShop() {
  const [activeTab,setActiveTab]=useState("packages");
  const [packages,setPackages]=useState([]);
  const [transactions,setTransactions]=useState([]);
  const [balance,setBalance]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const signedIn=isSignedIn();

  useEffect(()=>{let live=true;(async()=>{setLoading(true);setError("");try{const packageData=await apiRequest("/coins/packages");if(!live)return;setPackages(packageData.packages||[]);if(signedIn){const [wallet,history]=await Promise.all([apiRequest("/coins/me"),apiRequest("/coins/me/transactions?limit=50")]);if(!live)return;setBalance(wallet.balance);setTransactions(history.transactions||[]);}}catch(e){if(live)setError(e.message);}finally{if(live)setLoading(false);}})();return()=>{live=false};},[signedIn]);
  const groups=useMemo(()=>transactions.reduce((all,item)=>{const key=new Intl.DateTimeFormat("en-NG",{month:"long",year:"numeric"}).format(new Date(item.created_at));(all[key] ||= []).push(item);return all;},{}),[transactions]);

  return <div><Navbar/><main className="min-h-screen bg-slate-100 p-3 sm:p-6"><section className="mx-auto w-full max-w-7xl rounded-3xl bg-white p-4 shadow-sm sm:p-8">
    <div className="mb-7 flex flex-col items-center"><img src={CoinHeader} alt="Coin shop" className="w-full max-w-xl"/>{balance!==null&&<div className="mt-3 rounded-full bg-amber-50 px-5 py-2 font-bold text-amber-700">Balance: {Number(balance).toLocaleString()} coins</div>}</div>
    <div className="mb-8 flex justify-center gap-10 font-bold">{[["packages","Coin packages"],["history","Transaction history"]].map(([id,label])=><button key={id} onClick={()=>setActiveTab(id)} className={`cursor-pointer border-b-2 pb-2 ${activeTab===id?"border-[#9B5DE5] text-[#9B5DE5]":"border-transparent text-gray-400"}`}>{label}</button>)}</div>
    {error&&<div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {loading?<div className="py-20 text-center text-gray-500">Loading your coin shop…</div>:activeTab==="packages"?<>
      {packages.length?<div className="grid grid-cols-1 gap-5 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">{packages.map(pkg=><article key={pkg.id} className="flex flex-col items-center rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50 to-white p-5 text-center shadow-sm"><span className="mb-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-600">{pkg.name}</span><img src={Coin} alt="" className="my-2 h-24 w-24 object-contain"/><h2 className="text-xl font-black text-slate-900">{Number(pkg.coins).toLocaleString()} coins</h2>{pkg.description&&<p className="mt-2 min-h-10 text-sm text-slate-500">{pkg.description}</p>}<div className="mt-5 w-full rounded-full bg-[#9B5DE5] px-4 py-2 font-bold text-white">{money(pkg.price_minor,pkg.currency)}</div></article>)}</div>:<div className="py-20 text-center text-gray-500">No coin packages are available right now.</div>}
      <p className="mt-7 text-center text-xs text-slate-400">Purchasing will be enabled after secure payment verification is connected.</p>
    </>:!signedIn?<div className="py-20 text-center text-gray-500">Sign in to view your coin history.</div>:transactions.length?<div className="space-y-7">{Object.entries(groups).map(([month,items])=><section key={month}><h2 className="mb-3 font-bold text-slate-700">{month}</h2><div className="space-y-3">{items.map(item=><article key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 sm:p-4"><div className="flex min-w-0 items-center gap-3"><img src={Coin} alt="" className="h-12 w-12 shrink-0"/><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{item.description}</p><p className="text-xs text-slate-400">{dateTime(item.created_at)}{item.reference?` · ${item.reference}`:""}</p></div></div><div className="text-right"><p className={`font-black ${Number(item.amount)>=0?"text-emerald-600":"text-red-600"}`}>{Number(item.amount)>0?"+":""}{Number(item.amount).toLocaleString()}</p><p className="text-xs text-slate-400">Balance {Number(item.balance_after).toLocaleString()}</p></div></article>)}</div></section>)}</div>:<div className="py-20 text-center text-gray-500">No coin transactions yet.</div>}
  </section></main></div>;
}
