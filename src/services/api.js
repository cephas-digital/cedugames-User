const API_URL = (import.meta.env.VITE_API_URL || "https://cedu-api.cephasict.com").replace(/\/+$/, "");
export const assetUrl = (value) => value?.startsWith("/") ? `${API_URL}${value}` : value;
export const TOKEN_KEY = "cedugames_user_token";
export const USER_KEY = "cedugames_user";
const SELECTIONS_KEY = "cedugames_learning_selections";
const WALLETS_KEY = "cedugames_wallet_states";
let expiryTimer;

function returnToLogin() {
  clearSession();
  if (window.location.pathname !== "/login") window.location.replace("/login");
}

function scheduleSessionExpiry(token) {
  window.clearTimeout(expiryTimer);
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const remaining = (Number(payload.exp) * 1000) - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) returnToLogin();
    else expiryTimer = window.setTimeout(returnToLogin, remaining);
  } catch {
    returnToLogin();
  }
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...(!isFormData ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  // Any unauthorized response means the bearer session is no longer usable
  // (expired, revoked, or invalid). Clear it immediately and return to login.
  if (response.status === 401 && token) returnToLogin();
  if (!response.ok) throw new Error(data.errors?.[0]?.message || data.message || "Something went wrong.");
  return data;
}
export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  scheduleSessionExpiry(token);
}
export function updateCachedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cedugames:profile-updated"));
}
export function clearSession() {
  window.clearTimeout(expiryTimer);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export const isSignedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));

scheduleSessionExpiry(localStorage.getItem(TOKEN_KEY));

function currentUserId() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null")?.id || null; }
  catch { return null; }
}

export function getLearningSelection() {
  const userId = currentUserId();
  if (!userId) return null;
  try { return JSON.parse(localStorage.getItem(SELECTIONS_KEY) || "{}")[userId] || null; }
  catch { return null; }
}

export function cacheLearningSelection(selection) {
  const userId = currentUserId();
  if (!userId || !selection?.ageGroupId || !selection?.categoryId) return null;
  let selections = {};
  try { selections = JSON.parse(localStorage.getItem(SELECTIONS_KEY) || "{}"); }
  catch { selections = {}; }
  selections[userId] = selection;
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
  return selection;
}

export function saveLearningSelection(ageGroupId, categoryId) {
  const userId = currentUserId();
  if (!userId || !ageGroupId || !categoryId) return;
  let selections = {};
  try { selections = JSON.parse(localStorage.getItem(SELECTIONS_KEY) || "{}"); }
  catch { selections = {}; }
  selections[userId] = { ageGroupId, categoryId };
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
  apiRequest("/auth/user/preferences/learning-selection", {
    method: "PUT",
    body: JSON.stringify({ ageGroupId, categoryId }),
  }).catch(() => undefined);
  return selections[userId];
}

export async function loadLearningSelection() {
  const userId = currentUserId();
  if (!userId) return null;
  const data = await apiRequest("/auth/user/preferences");
  if (!data.learningSelection) return getLearningSelection();
  return cacheLearningSelection(data.learningSelection);
}

export function getCachedWallet() {
  const userId = currentUserId();
  if (!userId) return null;
  try { return JSON.parse(localStorage.getItem(WALLETS_KEY) || "{}")[userId] || null; }
  catch { return null; }
}

export function cacheWallet(wallet) {
  const userId = currentUserId();
  if (!userId || !wallet) return;
  let wallets = {};
  try { wallets = JSON.parse(localStorage.getItem(WALLETS_KEY) || "{}"); }
  catch { wallets = {}; }
  wallets[userId] = wallet;
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
}
