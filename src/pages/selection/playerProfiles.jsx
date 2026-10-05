import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, assetUrl, clearSession, getActiveProfileId, selectPlayerProfile } from "../../services/api";
import { BrandLogo } from "../../components/Brand";

const colors = ["from-violet-500 to-fuchsia-500", "from-sky-500 to-cyan-400", "from-amber-500 to-orange-400", "from-emerald-500 to-teal-400", "from-rose-500 to-pink-400"];
const faces = ["🦁", "🐼", "🦊", "🐯", "🐨"];

export default function PlayerProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [childCount, setChildCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", age: "" });
  const [familyContent, setFamilyContent] = useState(null);
  const [advertOpen, setAdvertOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const advertSignature = useRef("");

  const load = () => {
    setLoading(true); setError("");
    apiRequest("/auth/user/profiles", { accountContext: true }).then((data) => { setProfiles(data.profiles || []); setChildCount(Number(data.childCount || 0)); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => {
    let active = true;
    const refresh = () => apiRequest("/family-page/content", { accountContext: true }).then((data) => {
        if (!active) return;
        const nextSignature = data.advert?.enabled && data.advert?.imageUrl ? data.advert.imageUrl : "";
        if (!nextSignature) setAdvertOpen(false);
        else if (nextSignature !== advertSignature.current) setAdvertOpen(true);
        advertSignature.current = nextSignature;
        setFamilyContent(data);
      }).catch(() => undefined);
    const onVisibilityChange = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, []);
  useEffect(() => setSlideIndex((current) => current < (familyContent?.slider?.images?.length || 0) ? current : 0), [familyContent]);
  useEffect(() => {
    const images = familyContent?.slider?.images || [];
    if (!familyContent?.slider?.enabled || images.length < 2) return undefined;
    const timer = window.setInterval(() => setSlideIndex((current) => (current + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [familyContent]);
  useEffect(() => {
    if (!advertOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => { if (event.key === "Escape") setAdvertOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [advertOpen]);

  const openAdd = () => { setEditing(null); setForm({ name: "", age: "" }); setAdding(true); setError(""); };
  const openEdit = (profile, event) => { event.stopPropagation(); setEditing(profile); setForm({ name: profile.name, age: String(profile.age || "") }); setAdding(true); setError(""); };
  const close = () => { if (!saving) setAdding(false); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const data = await apiRequest(editing ? `/auth/user/profiles/${editing.id}` : "/auth/user/profiles", { accountContext: true, method: editing ? "PATCH" : "POST", body: JSON.stringify({ name: form.name, age: Number(form.age) }) });
      setProfiles((current) => editing ? current.map((item) => item.id === data.profile.id ? { ...item, ...data.profile } : item) : [...current, data.profile]);
      if (!editing) setChildCount((value) => value + 1);
      if (getActiveProfileId() === data.profile.id) selectPlayerProfile(data.profile);
      setAdding(false);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const play = (profile) => { selectPlayerProfile(profile); navigate("/age-selection"); };

  return <div className="min-h-screen bg-[#fff9ef] text-slate-900">
    <header className="bg-gradient-to-r from-purple-800 via-violet-700 to-fuchsia-600 px-4 py-4 text-white shadow-xl sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><BrandLogo className="w-32 sm:w-48"/><div className="flex items-center gap-2"><div className="rounded-full bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur sm:px-4 sm:text-sm">{childCount} {childCount === 1 ? "child" : "children"}</div><button type="button" onClick={() => { clearSession(); navigate("/login", { replace: true }); }} className="rounded-full border border-white/25 px-3 py-2 text-xs font-black transition hover:bg-white/15 sm:px-4 sm:text-sm">Sign out</button></div></div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <section className="text-center"><p className="text-xs font-black uppercase tracking-[.25em] text-purple-600">Family learning space</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Who is playing?</h1><p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-slate-500 sm:text-base">Choose a player to load their own games, progress, coins, lives, rewards and leaderboard position.</p></section>
      {error && !adding && <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-700">{error}</p>}
      {loading ? <div className="grid place-items-center py-24"><span className="h-12 w-12 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600"/><p className="mt-4 font-bold text-purple-700">Opening your family space…</p></div> : <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {profiles.map((profile, index) => <article key={profile.id} className={`group relative rounded-3xl border-2 bg-white p-4 text-center shadow-lg transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl sm:p-6 ${getActiveProfileId() === profile.id ? "border-purple-400 ring-4 ring-purple-100" : "border-white"}`}>
          {!profile.is_primary && <button type="button" onClick={(event) => openEdit(profile, event)} aria-label={`Edit ${profile.name}`} className="absolute right-2 top-2 z-10 rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-500 hover:bg-purple-100 hover:text-purple-700">Edit</button>}
          <button type="button" onClick={() => play(profile)} className="w-full"><span className={`mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-gradient-to-br text-4xl text-white shadow-lg ${colors[index % colors.length]} sm:h-28 sm:w-28 sm:text-5xl`}>{profile.profile_image_url ? <img src={assetUrl(profile.profile_image_url)} alt="" className="h-full w-full object-cover"/> : faces[index % faces.length]}</span>
          <strong className="mt-4 block truncate text-lg font-black sm:text-xl">{profile.name}</strong><span className="mt-1 block text-xs font-bold text-slate-400">{profile.is_primary ? "Main profile" : `Age ${profile.age}`}{getActiveProfileId() === profile.id ? " · Currently selected" : ""}</span><span className="mt-3 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">{Number(profile.total_xp || 0).toLocaleString()} XP · {Number(profile.coins_count || 0).toLocaleString()} coins</span></button>
        </article>)}
        <button type="button" onClick={openAdd} disabled={childCount >= 10} className="group min-h-48 rounded-3xl border-2 border-dashed border-purple-300 bg-purple-50/60 p-5 text-center transition hover:-translate-y-1 hover:border-purple-500 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-64"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-4xl font-light text-purple-600 shadow-sm sm:h-28 sm:w-28 sm:text-5xl">+</span><strong className="mt-4 block text-lg font-black text-purple-800">Add a child</strong><span className="mt-1 block text-xs font-semibold text-purple-500">Create their own learning profile</span></button>
      </div>}
      {familyContent?.slider?.enabled && familyContent.slider.images?.length > 0 && <section aria-label="Family announcements" className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-purple-100">
        <div className="relative aspect-[16/7] min-h-36 overflow-hidden bg-purple-50 sm:min-h-56">{familyContent.slider.images.map((slide, index) => <img key={slide.id} src={assetUrl(slide.imageUrl)} alt={`Family announcement ${index + 1}`} className={`absolute inset-0 h-full w-full object-contain transition-all duration-1000 ease-in-out ${index === slideIndex ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"}`}/>)}</div>
        {familyContent.slider.images.length > 1 && <div className="flex justify-center gap-2 py-3">{familyContent.slider.images.map((slide, index) => <button key={slide.id} type="button" aria-label={`Show announcement ${index + 1}`} onClick={() => setSlideIndex(index)} className={`h-2 rounded-full transition-all ${index === slideIndex ? "w-7 bg-purple-600" : "w-2 bg-purple-200 hover:bg-purple-300"}`}/>)}</div>}
      </section>}
    </main>
    {advertOpen && familyContent?.advert?.enabled && familyContent.advert.imageUrl && <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onMouseDown={() => setAdvertOpen(false)}><div role="dialog" aria-modal="true" aria-label="Announcement" className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={() => setAdvertOpen(false)} aria-label="Close announcement" className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-950/70 text-2xl leading-none text-white shadow-lg transition hover:bg-slate-950 sm:right-3 sm:top-3">×</button><img src={assetUrl(familyContent.advert.imageUrl)} alt="CeduGames announcement" className="block max-h-[calc(100dvh-1.5rem)] w-full object-contain sm:max-h-[calc(100dvh-3rem)]"/></div></div>}
    {adding && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={close}><form onSubmit={save} onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-purple-600">Player profile</p><h2 className="mt-1 text-2xl font-black">{editing ? `Update ${editing.name}` : "Add a child"}</h2></div><button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xl">×</button></div>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <label className="mt-6 block text-sm font-black text-slate-700">Child's name<input autoFocus required minLength="2" maxLength="120" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="e.g. Ada"/></label>
      <label className="mt-4 block text-sm font-black text-slate-700">Age<input required type="number" min="1" max="25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" placeholder="8"/></label>
      <p className="mt-4 rounded-xl bg-purple-50 p-3 text-xs font-semibold leading-5 text-purple-800">Each child gets separate progress, coins, lives, rewards, badges and leaderboard results under this one family login.</p><button disabled={saving} className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-black text-white shadow-lg hover:bg-purple-700 disabled:opacity-60">{saving ? "Saving…" : editing ? "Save changes" : "Create profile"}</button>
    </form></div>}
  </div>;
}
