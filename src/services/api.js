const API_URL = import.meta.env.VITE_API_URL || "https://cedugames-backend.onrender.com";
export const assetUrl = (value) => value?.startsWith("/") ? `${API_URL}${value}` : value;
export const TOKEN_KEY = "cedugames_user_token";
export const USER_KEY = "cedugames_user";
const SELECTIONS_KEY = "cedugames_learning_selections";
const WALLETS_KEY = "cedugames_wallet_states";
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.errors?.[0]?.message || data.message || "Something went wrong.");
  return data;
}
export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function updateCachedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cedugames:profile-updated"));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export const isSignedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));

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

export function saveLearningSelection(ageGroupId, categoryId) {
  const userId = currentUserId();
  if (!userId || !ageGroupId || !categoryId) return;
  let selections = {};
  try { selections = JSON.parse(localStorage.getItem(SELECTIONS_KEY) || "{}"); }
  catch { selections = {}; }
  selections[userId] = { ageGroupId, categoryId };
  localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
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
