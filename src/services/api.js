const API_URL = (import.meta.env.VITE_API_URL || "https://cedu-api.cephasict.com").replace(/\/+$/, "");
export const assetUrl = (value) => value?.startsWith("/") ? `${API_URL}${value}` : value;
export const TOKEN_KEY = "cedugames_user_token";
export const USER_KEY = "cedugames_user";
export const ACCOUNT_KEY = "cedugames_household_account";
export const ACTIVE_PROFILE_KEY = "cedugames_active_profile_id";
const SELECTIONS_KEY = "cedugames_learning_selections";
const WALLETS_KEY = "cedugames_wallet_states";
let expiryTimer;

function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function getSessionStorage() {
  return localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
}

function currentAccountId() {
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null")?.id || null; }
  catch { return null; }
}

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
  const token = getSessionToken();
  const { accountContext = false, ...requestOptions } = options;
  const isFormData = options.body instanceof FormData;
  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 30000);
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });

  try {
    const activeProfileId = accountContext ? currentAccountId() : sessionStorage.getItem(ACTIVE_PROFILE_KEY) || localStorage.getItem(ACTIVE_PROFILE_KEY);
    const response = await fetch(`${API_URL}${path}`, { ...requestOptions, signal: controller.signal, headers: { ...(!isFormData ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(token && activeProfileId ? { "X-Player-Profile-Id": activeProfileId } : {}), ...options.headers } });
    const data = await response.json().catch(() => ({}));
    // Any unauthorized response means the bearer session is no longer usable
    // (expired, revoked, or invalid). Clear it immediately and return to login.
    if (response.status === 401 && token) returnToLogin();
    if (!response.ok) throw new Error(data.errors?.[0]?.message || data.message || "Something went wrong.");
    return data;
  } catch (error) {
    if (timedOut) throw new Error("The server took too long to respond. Please try again.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}
export function saveSession(token, user, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);
  otherStorage.removeItem(ACTIVE_PROFILE_KEY);
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(user));
  storage.setItem(ACTIVE_PROFILE_KEY, user.id);
  scheduleSessionExpiry(token);
}
export function selectPlayerProfile(profile) {
  const storage = getSessionStorage();
  const otherStorage = storage === localStorage ? sessionStorage : localStorage;
  storage.setItem(ACTIVE_PROFILE_KEY, profile.id);
  storage.setItem(USER_KEY, JSON.stringify(profile));
  otherStorage.removeItem(USER_KEY);
  otherStorage.removeItem(ACTIVE_PROFILE_KEY);
  window.dispatchEvent(new Event("cedugames:profile-updated"));
  window.dispatchEvent(new Event("cedugames:wallet-updated"));
}
export const getActiveProfileId = () => sessionStorage.getItem(ACTIVE_PROFILE_KEY) || localStorage.getItem(ACTIVE_PROFILE_KEY);
export function getCachedUser() {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY) || "null"); }
  catch { return null; }
}
export function updateCachedUser(user) {
  const storage = getSessionStorage();
  const otherStorage = storage === localStorage ? sessionStorage : localStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
  otherStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("cedugames:profile-updated"));
}
export function clearSession() {
  window.clearTimeout(expiryTimer);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem(ACTIVE_PROFILE_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACTIVE_PROFILE_KEY);
  localStorage.removeItem(SELECTIONS_KEY);
  localStorage.removeItem(WALLETS_KEY);
}
export const isSignedIn = () => Boolean(getSessionToken());

scheduleSessionExpiry(getSessionToken());

function currentUserId() {
  return getCachedUser()?.id || null;
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
