const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const TOKEN_KEY = "cedugames_user_token";
export const USER_KEY = "cedugames_user";
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.errors?.[0]?.message || data.message || "Something went wrong.");
  return data;
}
export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export const isSignedIn = () => Boolean(localStorage.getItem(TOKEN_KEY));
