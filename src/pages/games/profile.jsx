import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/homeNavbar";
import BadgeImage from "../../assets/badge.png";
import Coin from "../../assets/coin.png";
import Trophy from "../../assets/trophy.png";
import {
  apiRequest,
  assetUrl,
  clearSession,
  updateCachedUser,
} from "../../services/api";

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Not yet";
const ago = (value) => {
  if (!value) return "Not yet";
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date(value);
};
const criteriaLabel = {
  levels_completed: "levels completed",
  attempts_completed: "game attempts",
  perfect_scores: "perfect scores",
  total_xp: "total XP",
};
const tierColor = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-slate-200 text-slate-700",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-violet-100 text-violet-700",
};
function ActionIcon({ name, size = 18 }) {
  const paths = {
    pencil: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    camera: <><path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z"/><circle cx="12" cy="13" r="3"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Spinner({ label = "Loading" }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-20 text-sm font-semibold text-purple-700"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
      {label}
    </div>
  );
}
function Stat({ image, label, value, color }) {
  return (
    <article
      className={`flex min-w-0 items-center gap-2 rounded-2xl border border-white/80 p-3 shadow-sm sm:gap-3 sm:p-4 ${color}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white sm:h-14 sm:w-14">
        <img src={image} alt="" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] leading-4 text-slate-500 sm:text-xs">{label}</p>
        <p className="truncate text-base font-black text-slate-900 sm:text-xl">
          {value}
        </p>
      </div>
    </article>
  );
}
function Progress({ label, value, total }) {
  const percent = total ? Math.min(100, Math.round((value * 100) / total)) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>
          {value}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-purple-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
function PasswordField({ label, name, value, onChange, minLength }) {
  return (
    <label className="mt-5 block text-sm font-bold text-slate-700">
      {label}
      <span className="ml-1 text-red-500" aria-hidden="true">*</span>
      <input
        required
        minLength={minLength}
        type="password"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
      />
    </label>
  );
}

export default function Profile() {
  const navigate = useNavigate(),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [editing, setEditing] = useState(false),
    [changingPassword, setChangingPassword] = useState(false),
    [passwordBusy, setPasswordBusy] = useState(false),
    [passwordError, setPasswordError] = useState(""),
    [passwordForm, setPasswordForm] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [saving, setSaving] = useState(false),
    [uploadingImage, setUploadingImage] = useState(false),
    [confirmLogout, setConfirmLogout] = useState(false),
    [referralData, setReferralData] = useState(null),
    [referralNotice, setReferralNotice] = useState(""),
    [referralError, setReferralError] = useState(""),
    [referralBusy, setReferralBusy] = useState(false),
    [referralPageBusy, setReferralPageBusy] = useState(false),
    [referralPage, setReferralPage] = useState(1),
    [form, setForm] = useState({ name: "", username: "", age: "" });
  const [historyType, setHistoryType] = useState("games");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyData, setHistoryData] = useState({ history: [], pagination: { page: 1, total: 0, totalPages: 0 } });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [profileTab, setProfileTab] = useState("overview");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/auth/user/profile");
      setData(response);
      const u = response.user;
      setForm({ name: u.name, username: u.username, age: u.age });
      if (!u.parent_user_id) {
        try { setReferralData(await apiRequest("/referrals/me?page=1&limit=25")); setReferralPage(1); setReferralError(""); }
        catch (referralRequestError) { setReferralError(referralRequestError.message); }
      } else setReferralData(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError("");
    apiRequest(`/auth/user/play-history?type=${historyType}&page=${historyPage}&limit=10`, { signal: controller.signal })
      .then((response) => setHistoryData(response))
      .catch((requestError) => { if (requestError.name !== "AbortError") setHistoryError(requestError.message || "Unable to load play history."); })
      .finally(() => { if (!controller.signal.aborted) setHistoryLoading(false); });
    return () => controller.abort();
  }, [historyPage, historyType]);
  const user = data?.user,
    performance = user?.performance || {},
    earned = useMemo(
      () => (data?.badges || []).filter((b) => b.earned),
      [data],
    ),
    passRate = Number(performance.attempts)
      ? Math.round(
          (Number(performance.passed_attempts) * 100) /
            Number(performance.attempts),
        )
      : 0;
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await apiRequest("/auth/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          age: Number(form.age),
        }),
      });
      setData((current) => ({
        ...current,
        user: { ...current.user, ...response.user },
      }));
      updateCachedUser(response.user);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const uploadProfileImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type,
      )
    ) {
      setError("Choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Profile pictures must be 10 MB or smaller.");
      return;
    }
    setUploadingImage(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await apiRequest("/user/profile/image", {
        method: "POST",
        body,
      });
      setData((current) => ({
        ...current,
        user: { ...current.user, ...response.user },
      }));
      updateCachedUser(response.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingImage(false);
    }
  };
  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };
  const referralLink = referralData?.referralCode ? `https://cedu.cephassuite.com/sign-up?ref=${encodeURIComponent(referralData.referralCode)}` : "";
  const playStoreLink = "https://play.google.com/store/apps/details?id=com.cedugames&pcampaignid=web_share";
  const referralMessage = `Join me on Cedu Educational Games!\n\nSign up with my referral link: ${referralLink}\nMy referral code: ${referralData?.referralCode || ""}\n\nGet the Android app on Google Play: ${playStoreLink}\nIf you sign up in the app, enter my referral code above.`;
  const copyReferral = async (value, successText) => {
    try { await navigator.clipboard.writeText(value); setReferralNotice(successText); }
    catch { setReferralNotice("Clipboard access is unavailable in this browser."); }
  };
  const shareReferral = async () => {
    setReferralBusy(true); setReferralNotice("");
    try {
      if (navigator.share) await navigator.share({ title: "Join me on Cedu", text: referralMessage });
      else await copyReferral(referralMessage, "Referral invitation with web and app links copied.");
    } catch (shareError) { if (shareError.name !== "AbortError") setReferralError("Unable to open sharing options. Copy your referral link instead."); }
    finally { setReferralBusy(false); }
  };
  const loadReferralPage = async (page) => {
    setReferralPageBusy(true);
    try { setReferralData(await apiRequest(`/referrals/me?page=${page}&limit=25`)); setReferralPage(page); }
    catch (requestError) { setReferralError(requestError.message); }
    finally { setReferralPageBusy(false); }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    setPasswordError("");
    try {
      await apiRequest("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      clearSession();
      navigate("/login", {
        replace: true,
        state: {
          message: "Password updated successfully. Please sign in again.",
        },
      });
    } catch (e) {
      setPasswordError(e.message);
    } finally {
      setPasswordBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-[1500px] px-2 py-2 sm:px-5 sm:py-3 lg:px-7">
        <section className="flex h-[calc(100dvh-13rem)] min-h-[28rem] flex-col overflow-hidden rounded-[1.35rem] border border-white/80 bg-white shadow-[0_12px_40px_-24px_rgba(37,24,71,0.35)] sm:h-[calc(100dvh-8.5rem)] sm:min-h-[34rem] sm:rounded-3xl">
          {loading ? <Spinner label="Loading your profile..." /> : error && !data ? (
            <div className="m-auto p-6 text-center"><p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p><button onClick={load} className="mt-4 rounded-xl bg-purple-600 px-5 py-2.5 font-bold text-white">Try again</button></div>
          ) : <>
            {error && <div role="alert" className="mx-4 mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-6">{error}</div>}
            <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-white to-purple-50/50 px-3 py-3 sm:px-6">
              <div className="relative shrink-0">
                <div className="grid h-12 w-12 overflow-hidden rounded-full bg-purple-100 text-xl font-black text-purple-700 ring-2 ring-purple-300 sm:h-14 sm:w-14">
                  {user.profile_image_url ? <img src={assetUrl(user.profile_image_url)} alt={`${user.name}'s profile`} className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center">{user.name?.[0]?.toUpperCase() || "P"}</span>}
                </div>
                <button type="button" onClick={() => setEditing(true)} aria-label="Edit profile" className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-purple-600 text-white"><ActionIcon name="pencil" size={14}/></button>
              </div>
              <div className="min-w-0 flex-1"><h1 className="truncate text-lg font-black text-slate-900 sm:text-xl">{user.name}</h1><p className="truncate text-xs text-slate-500 sm:text-sm">@{user.username} · {user.email}</p></div>
              <div className="flex w-full gap-2 sm:ml-auto sm:w-auto"><button onClick={() => { setPasswordError(""); setChangingPassword(true); }} className="flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-purple-200 bg-purple-50 px-2.5 text-[11px] font-bold text-purple-700 transition hover:bg-purple-100 sm:flex-none sm:px-4 sm:text-sm"><ActionIcon name="shield" size={16}/><span className="sm:hidden">Password</span><span className="hidden sm:inline">Change password</span></button><button onClick={() => setConfirmLogout(true)} className="flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-red-200 bg-red-50 px-2.5 text-[11px] font-bold text-red-600 transition hover:bg-red-100 sm:flex-none sm:px-4 sm:text-sm"><ActionIcon name="logout" size={16}/>Log out</button></div>
            </header>
            <div className="grid grid-cols-2 gap-2 border-b border-slate-100 bg-slate-50/50 px-3 py-3 sm:grid-cols-4 sm:gap-3 sm:px-6">
              <Stat image={Trophy} label="Total XP" value={Number(user.total_xp).toLocaleString()} color="bg-purple-100"/><Stat image={Coin} label="Coin balance" value={Number(user.coins_count).toLocaleString()} color="bg-yellow-100"/><Stat image={BadgeImage} label="Badges earned" value={earned.length.toLocaleString()} color="bg-blue-100"/><Stat image={Trophy} label="Levels completed" value={Number(performance.completed_levels).toLocaleString()} color="bg-emerald-100"/>
            </div>
            <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 bg-white px-2 pt-1 sm:px-6" role="tablist" aria-label="Profile sections">
              {[{id:"overview",label:"Overview"},{id:"history",label:"Play history"},...(!user.parent_user_id?[{id:"referrals",label:"Referrals"}]:[])].map(tab=><button key={tab.id} type="button" role="tab" aria-selected={profileTab===tab.id} onClick={()=>setProfileTab(tab.id)} className={`shrink-0 rounded-t-xl border-b-2 px-3 py-3 text-xs font-bold transition sm:px-4 sm:text-sm ${profileTab===tab.id?"border-purple-600 bg-purple-50/60 text-purple-700":"border-transparent text-slate-500 hover:text-slate-800"}`}>{tab.label}</button>)}
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-3 sm:bg-white sm:p-6" role="tabpanel">
              {profileTab === "overview" && <div className="grid gap-4 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5 lg:col-span-2"><h2 className="text-lg font-black text-slate-900">Learning progress</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Attempts",Number(performance.attempts)],["Pass rate",`${passRate}%`],["Average",`${Number(performance.average_score)}%`],["Best score",`${Number(performance.best_score)}%`]].map(([label,value])=><div key={label}><p className="text-xs text-slate-400">{label}</p><p className="text-xl font-black sm:text-2xl">{value}</p></div>)}</div><div className="mt-5"><Progress label="Correct answers" value={Number(performance.correct_answers)} total={Number(performance.questions_answered)}/></div><p className="mt-4 text-xs text-slate-400">Last played: {ago(performance.last_played)}</p></section>
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h2 className="text-lg font-black">Account</h2><dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm sm:grid-cols-1"><div><dt className="text-slate-400">Age</dt><dd className="font-bold">{user.age}</dd></div><div><dt className="text-slate-400">Lives remaining</dt><dd className="font-bold">{Number(user.lives_remaining)}</dd></div><div><dt className="text-slate-400">Member since</dt><dd className="font-bold">{date(user.created_at)}</dd></div><div><dt className="text-slate-400">Sign-in method</dt><dd className="font-bold">{user.is_oauth?"Google":"Email and password"}</dd></div><div><dt className="text-slate-400">Email status</dt><dd className="font-bold text-emerald-600">{user.is_verified?"Verified":"Verification pending"}</dd></div></dl></section>
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-5 lg:col-span-3"><h2 className="text-lg font-black">Badges</h2>{earned.length?<div className="mt-3 flex flex-wrap gap-3">{earned.map((badge,index)=><div key={badge.id||badge.name||index} title={badge.name||badge.badge_name} className="grid h-14 w-14 place-items-center rounded-xl bg-amber-50"><img src={assetUrl(badge.image_url||badge.icon_url)||BadgeImage} onError={(event)=>{event.currentTarget.onerror=null;event.currentTarget.src=BadgeImage;}} alt={badge.name||badge.badge_name||"Earned badge"} className="h-10 w-10 object-contain"/></div>)}</div>:<p className="mt-2 text-sm text-slate-500">Complete learning milestones to earn badges.</p>}</section>
              </div>}
              {profileTab === "history" && <section><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Play history</h2><p className="text-xs text-slate-500">Your CeduGames and CEDU-LEARN activity.</p></div><span className="text-xs font-semibold text-slate-500">{historyData.pagination.total} {historyType==="games"?"game":"learning"} attempts</span></div><div className="mt-3 flex w-full rounded-xl bg-slate-100 p-1 sm:inline-flex sm:w-auto" role="tablist" aria-label="Play history type">{[{id:"games",label:"CeduGames"},{id:"learn",label:"CEDU-LEARN"}].map(tab=><button key={tab.id} type="button" role="tab" aria-selected={historyType===tab.id} onClick={()=>{setHistoryType(tab.id);setHistoryPage(1);}} className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-bold transition sm:flex-none sm:px-4 sm:text-sm ${historyType===tab.id?"bg-white text-purple-700 shadow-sm":"text-slate-500"}`}>{tab.label}</button>)}</div>{historyLoading?<p className="p-8 text-center text-sm text-slate-500">Loading history...</p>:historyError?<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{historyError}</p>:historyData.history.length?<div className="mt-3 space-y-2">{historyData.history.map(attempt=><article key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"><div className="min-w-0"><p className="truncate font-bold">{historyType==="games"?[attempt.age_group_name,attempt.category_name].filter(Boolean).join(" - "):attempt.program_name||"CEDU-LEARN"}</p><p className="text-sm text-slate-600">{historyType==="learn"&&attempt.learning_path?`${attempt.learning_path} - `:""}{attempt.level_name}{attempt.level_number?` - Level ${attempt.level_number}`:""}</p><p className="text-xs text-slate-400">{ago(attempt.created_at)} · {attempt.correct_answers}/{attempt.total_questions} correct</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${attempt.passed?"bg-emerald-100 text-emerald-700":"bg-red-50 text-red-600"}`}>{attempt.passed?"Passed":"Keep trying"}</span><b className="text-lg text-purple-700">{attempt.score_percent}%</b></div></article>)}</div>:<p className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">No history yet. Complete a level to see it here.</p>}{historyData.pagination.totalPages>1&&<div className="mt-4 flex items-center justify-between"><button type="button" onClick={()=>setHistoryPage(page=>Math.max(1,page-1))} disabled={historyPage<=1||historyLoading} className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40">Previous</button><span className="text-xs text-slate-500">Page {historyPage} of {historyData.pagination.totalPages}</span><button type="button" onClick={()=>setHistoryPage(page=>Math.min(historyData.pagination.totalPages,page+1))} disabled={historyPage>=historyData.pagination.totalPages||historyLoading} className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40">Next</button></div>}</section>}
              {profileTab === "referrals" && !user.parent_user_id && <section><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">Invite friends</p><h2 className="text-xl font-black">Earn coins when friends play</h2><p className="text-sm text-slate-600">Your friend signs up with your code and completes their first game.</p></div>{referralData?.settings?.is_enabled&&<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Program active</span>}</div>{referralError&&<p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{referralError} <button type="button" onClick={load} className="font-bold underline">Retry</button></p>}{referralData&&<><div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]"><div className="rounded-xl border bg-slate-50 p-4"><label htmlFor="my-referral-code" className="text-xs font-bold uppercase text-slate-500">Referral code</label><div className="mt-2 flex flex-wrap gap-2"><input id="my-referral-code" readOnly value={referralData.referralCode} className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 font-black"/><button type="button" onClick={()=>copyReferral(referralData.referralCode,"Referral code copied.")} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white">Copy</button><button type="button" disabled={!referralData.settings?.is_enabled||referralBusy} onClick={shareReferral} className="rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-bold text-purple-700 disabled:opacity-50">{referralBusy?"Opening...":"Share invite"}</button><button type="button" onClick={()=>copyReferral(referralMessage,"Referral invitation copied.")} className="rounded-lg border bg-white px-4 py-2 text-sm font-bold">Copy invite</button></div>{referralNotice&&<p role="status" className="mt-2 text-xs font-semibold text-emerald-700">{referralNotice}</p>}</div><div className="grid grid-cols-2 gap-3 lg:w-64 lg:grid-cols-1"><div className="rounded-xl bg-purple-50 p-4"><p className="text-xs text-slate-500">Friends invited</p><p className="text-2xl font-black">{Number(referralData.summary?.total||0).toLocaleString()}</p></div><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-slate-500">Coins earned</p><p className="text-2xl font-black text-amber-600">{Number(referralData.summary?.coins_earned||0).toLocaleString()} coins</p></div></div></div><h3 className="mb-2 mt-5 font-black">Referral history</h3>{referralData.referrals?.length?<div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Friend</th><th className="p-3">Status</th><th className="p-3">Coins</th><th className="p-3">Joined</th></tr></thead><tbody>{referralData.referrals.map(entry=><tr key={entry.id} className="border-t"><td className="p-3 font-semibold">{entry.referred_name} <span className="text-xs font-normal text-slate-400">@{entry.referred_username}</span></td><td className="p-3">{entry.status==="qualified"?"Reward paid":"Waiting for first game"}</td><td className="p-3">{entry.status==="qualified"?Number(entry.reward_coins).toLocaleString():"—"}</td><td className="p-3">{date(entry.created_at)}</td></tr>)}</tbody></table></div>:<p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">No referrals yet. Share your code to invite a friend.</p>}{Number(referralData.pagination?.totalPages||1)>1&&<div className="mt-3 flex items-center justify-between text-sm"><span>Page {referralPage} of {referralData.pagination.totalPages}</span><div className="flex gap-2"><button type="button" disabled={referralPage<=1||referralPageBusy} onClick={()=>loadReferralPage(referralPage-1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={referralPage>=referralData.pagination.totalPages||referralPageBusy} onClick={()=>loadReferralPage(referralPage+1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>}</>}</section>}
            </div>
          </>}
        </section>
      </main>
      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-slate-900/50 p-0 sm:place-items-center sm:p-4"
          onMouseDown={() => setEditing(false)}
        >
          <form
            onSubmit={save}
            onMouseDown={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">Edit profile</h2>
                <p className="text-sm text-slate-500">
                  Update your public player details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-2xl text-slate-400"
              >
                Ã—
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/70 p-3 sm:gap-4 sm:p-4">
              <div className="grid h-14 w-14 shrink-0 overflow-hidden rounded-full bg-purple-100 text-xl font-black text-purple-700 sm:h-16 sm:w-16">
                {user.profile_image_url ? <img src={assetUrl(user.profile_image_url)} alt="" className="h-full w-full object-cover"/> : <span className="grid h-full w-full place-items-center">{user.name?.[0]?.toUpperCase() || "P"}</span>}
              </div>
              <div className="min-w-0 flex-1 text-left"><p className="font-bold text-slate-800">Profile picture</p><p className="mt-0.5 text-xs leading-5 text-slate-500">JPEG, PNG, GIF or WebP. Maximum 10 MB.</p></div>
              <label className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-white text-purple-700 shadow-sm transition hover:bg-purple-100 ${uploadingImage ? "pointer-events-none opacity-50" : ""}`} title="Change profile picture">
                <ActionIcon name="camera"/><span className="sr-only">Change profile picture</span><input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={uploadProfileImage} disabled={uploadingImage}/>
              </label>
            </div>
            <label className="mt-6 block text-sm font-bold">
              Display name
              <input
                required
                minLength="2"
                maxLength="120"
                value={form.name}
                onChange={(e) =>
                  setForm((x) => ({ ...x, name: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
              />
            </label>
            <label className="mt-4 block text-sm font-bold">
              Username
              <input
                required
                minLength="3"
                maxLength="40"
                value={form.username}
                onChange={(e) =>
                  setForm((x) => ({
                    ...x,
                    username: e.target.value.toLowerCase(),
                  }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Letters, numbers, dots, underscores and hyphens only.
              </span>
            </label>
            <label className="mt-4 block text-sm font-bold">
              Age
              <input
                required
                type="number"
                min="1"
                max="130"
                value={form.age}
                onChange={(e) =>
                  setForm((x) => ({ ...x, age: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-purple-500"
              />
            </label>
            <label className="mt-4 block text-sm font-bold text-slate-400">
              Email address
              <input
                disabled
                value={user.email}
                className="mt-1 w-full cursor-not-allowed rounded-xl border bg-slate-100 px-4 py-3"
              />
              <span className="mt-1 block text-xs font-normal">
                Email changes require verification and are not available here.
              </span>
            </label>
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border px-4 py-3 font-bold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
      {changingPassword && (
        <div className="fixed inset-0 z-[55] grid place-items-center bg-slate-900/50 p-4">
          <form
            onSubmit={changePassword}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <h2 className="text-xl font-black">Change password</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use at least 8 characters for your new password.
            </p>
            {passwordError && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {passwordError}
              </p>
            )}
            <PasswordField label="Current password" name="currentPassword" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} />
            <PasswordField label="New password" name="newPassword" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} minLength={8} />
            <PasswordField label="Confirm new password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} minLength={8} />
            <div className="mt-7 flex gap-3">
              <button type="button" onClick={() => setChangingPassword(false)} className="flex-1 rounded-xl border px-4 py-3 font-bold">Cancel</button>
              <button disabled={passwordBusy} className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-bold text-white disabled:opacity-60">{passwordBusy ? "Updating..." : "Update password"}</button>
            </div>
          </form>
        </div>
      )}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={() => setConfirmLogout(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-logout-title"
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-purple-100 text-3xl">
              ðŸ‘‹
            </div>
            <h2
              id="user-logout-title"
              className="mt-5 text-2xl font-black text-slate-900"
            >
              Leaving already?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your progress is safe. Come back soon for more games!
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
              >
                Keep playing
              </button>
              <button
                onClick={logout}
                className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
