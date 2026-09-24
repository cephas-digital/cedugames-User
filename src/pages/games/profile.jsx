import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../../assets/profileIcon.png";
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
      className={`flex min-w-0 items-center gap-2 rounded-2xl p-3 sm:gap-3 sm:p-4 ${color}`}
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
    [form, setForm] = useState({ name: "", username: "", age: "" });
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/auth/user/profile");
      setData(response);
      const u = response.user;
      setForm({ name: u.name, username: u.username, age: u.age });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
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
      <main className="mx-auto w-full max-w-7xl p-3 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl">
          <div className="px-3 pt-5 sm:px-8 sm:pt-8">
            <img
              src={ProfileHeader}
              alt="Profile"
              className="mx-auto w-full max-w-4xl"
            />
          </div>
          {loading ? (
            <Spinner label="Loading your profile..." />
          ) : error && !data ? (
            <div className="p-6 text-center">
              <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
              <button
                onClick={load}
                className="mt-4 rounded-xl bg-purple-600 px-5 py-2.5 font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="px-4 pb-8 sm:px-8 lg:px-12">
              {error && (
                <div
                  role="alert"
                  className="mx-auto mb-5 max-w-3xl rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                <div className="grid h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-purple-100 text-5xl font-black text-purple-700 shadow-[0_0_0_4px_#c084fc] sm:h-36 sm:w-36">
                  {user.profile_image_url ? (
                    <img
                      src={assetUrl(user.profile_image_url)}
                      alt={`${user.name}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center">
                      {user.name?.[0]?.toUpperCase() || "P"}
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => setEditing(true)} aria-label="Edit profile" title="Edit profile" className="absolute bottom-0 right-0 grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-purple-600 text-white shadow-lg transition hover:scale-105 hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200 sm:h-11 sm:w-11"><ActionIcon name="pencil" size={17}/></button>
                </div>
                <h1 className="mt-5 text-xl font-black text-slate-900 sm:text-2xl">
                  {user.name}
                </h1>
                <p className="text-sm text-slate-500">
                  @{user.username} · {user.email}
                </p>
                <div className="mt-5 grid w-full max-w-md grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                  <button
                    onClick={() => {
                      setPasswordError("");
                      setChangingPassword(true);
                    }}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-100"
                  >
                    <ActionIcon name="shield"/>Change password
                  </button>
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-100"
                  >
                    <ActionIcon name="logout"/>Log out
                  </button>
                </div>
              </div>
              <div className="mx-auto mt-7 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  image={Trophy}
                  label="Total XP"
                  value={Number(user.total_xp).toLocaleString()}
                  color="bg-purple-100"
                />
                <Stat
                  image={Coin}
                  label="Coin balance"
                  value={Number(user.coins_count).toLocaleString()}
                  color="bg-yellow-100"
                />
                <Stat
                  image={BadgeImage}
                  label="Badges earned"
                  value={earned.length.toLocaleString()}
                  color="bg-blue-100"
                />
                <Stat
                  image={Trophy}
                  label="Levels completed"
                  value={Number(performance.completed_levels).toLocaleString()}
                  color="bg-emerald-100"
                />
              </div>
              <div className="mt-9 grid gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-6 lg:col-span-2">
                  <h2 className="text-lg font-black text-slate-900">
                    Learning progress
                  </h2>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-400">Attempts</p>
                      <p className="text-2xl font-black">
                        {Number(performance.attempts)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Pass rate</p>
                      <p className="text-2xl font-black">{passRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Average</p>
                      <p className="text-2xl font-black">
                        {Number(performance.average_score)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Best score</p>
                      <p className="text-2xl font-black">
                        {Number(performance.best_score)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Progress
                      label="Correct answers"
                      value={Number(performance.correct_answers)}
                      total={Number(performance.questions_answered)}
                    />
                  </div>
                  <p className="mt-5 text-xs text-slate-400">
                    Last played: {ago(performance.last_played)}
                  </p>
                </section>
                <section className="rounded-2xl border border-slate-200 p-4 sm:p-6">
                  <h2 className="text-lg font-black">Account</h2>
                  <dl className="mt-4 space-y-4 text-sm">
                    <div>
                      <dt className="text-slate-400">Age</dt>
                      <dd className="font-bold">{user.age}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Lives remaining</dt>
                      <dd className="font-bold">
                        {Number(user.lives_remaining)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Member since</dt>
                      <dd className="font-bold">{date(user.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Sign-in method</dt>
                      <dd className="font-bold">
                        {user.is_oauth ? "Google" : "Email and password"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Email status</dt>
                      <dd className="font-bold text-emerald-600">
                        {user.is_verified ? "Verified" : "Verification pending"}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
              <section className="mt-9">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">Badge collection</h2>
                    <p className="text-sm text-slate-500">
                      Keep learning to unlock every badge.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    {earned.length}/{data.badges.length}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {data.badges.map((badge) => (
                    <article
                      key={badge.id}
                      className={`rounded-2xl border p-3 text-center sm:p-4 ${badge.earned ? "border-purple-200 bg-purple-50" : "border-slate-200 bg-slate-50 opacity-60"}`}
                    >
                      <img
                        src={BadgeImage}
                        alt=""
                        className={`mx-auto h-12 w-12 ${badge.earned ? "" : "grayscale"}`}
                      />
                      <h3 className="mt-2 text-sm font-black">{badge.name}</h3>
                      <span
                        className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold capitalize ${tierColor[badge.tier]}`}
                      >
                        {badge.tier}
                      </span>
                      <p className="mt-2 text-xs text-slate-500">
                        {badge.earned
                          ? `Earned ${date(badge.earned_at)}`
                          : `Requires ${Number(badge.criteria_value).toLocaleString()} ${criteriaLabel[badge.criteria_type]}`}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
              <section className="mt-9">
                <h2 className="text-lg font-black">Recent learning activity</h2>
                {data.recentAttempts.length ? (
                  <div className="mt-4 space-y-3">
                    {data.recentAttempts.map((attempt) => (
                      <article
                        key={attempt.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {attempt.category_name} · Level{" "}
                            {attempt.level_number}
                          </p>
                          <p className="text-xs text-slate-500">
                            {attempt.level_name} · {ago(attempt.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${attempt.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600"}`}
                          >
                            {attempt.passed ? "Passed" : "Keep trying"}
                          </span>
                          <span className="text-lg font-black text-purple-700">
                            {attempt.score_percent}%
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border-2 border-dashed p-10 text-center text-sm text-slate-400">
                    Play your first level to start building your activity.
                  </div>
                )}
              </section>
            </div>
          )}
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
                ×
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
              Use at least 10 characters for your new password.
            </p>
            {passwordError && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {passwordError}
              </p>
            )}
            <PasswordField label="Current password" name="currentPassword" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} />
            <PasswordField label="New password" name="newPassword" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} minLength={10} />
            <PasswordField label="Confirm new password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} minLength={10} />
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
              👋
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
