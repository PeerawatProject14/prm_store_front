import api, { fetchUserProfile } from "./api";

// ===============================
// Local Storage Helpers
// ===============================

const REDIRECT_LOCK_KEY = "__auth_redirect_lock__";

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("accessToken") ||
    null
  );
};

export const setStoredToken = (token) => {
  if (typeof window === "undefined") return;
  if (!token) return;

  localStorage.setItem("token", token);
  localStorage.setItem("auth_token", token);
  localStorage.setItem("accessToken", token);

  try {
    sessionStorage.removeItem(REDIRECT_LOCK_KEY);
  } catch (_) {}
};

export const setStoredUser = (user) => {
  if (typeof window === "undefined") return;
  if (!user) return;
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  try {
    sessionStorage.removeItem(REDIRECT_LOCK_KEY);
  } catch (_) {}
};

// ===============================
// Auth API
// ===============================

export const login = async (payload, options = {}) => {
  const { persist = true, fetchMeIfMissing = true } = options;

  const res = await api.post("/auth/login", payload);

  const token =
    res?.data?.token ||
    res?.data?.access_token ||
    res?.data?.data?.token ||
    null;

  const user =
    res?.data?.user ||
    res?.data?.profile ||
    res?.data?.data?.user ||
    null;

  if (persist && token) setStoredToken(token);
  if (persist && user) setStoredUser(user);

  if (fetchMeIfMissing && !user && token) {
    try {
      const me = await fetchUserProfile();
      if (persist && me) setStoredUser(me);
      return { token, user: me || null, raw: res.data };
    } catch (_) {}
  }

  return { token, user, raw: res.data };
};

// ✅ REGISTER: ต้องรอ admin approve
// ไม่เก็บ token/user โดย default
export const register = async (payload, options = {}) => {
  const { persist = false, fetchMeIfMissing = false } = options;

  const res = await api.post("/auth/register", payload);

  const token =
    res?.data?.token ||
    res?.data?.access_token ||
    res?.data?.data?.token ||
    null;

  const user =
    res?.data?.user ||
    res?.data?.profile ||
    res?.data?.data?.user ||
    null;

  if (persist && token) setStoredToken(token);
  if (persist && user) setStoredUser(user);

  if (fetchMeIfMissing && !user && token) {
    try {
      const me = await fetchUserProfile();
      if (persist && me) setStoredUser(me);
      return { token, user: me || null, raw: res.data };
    } catch (_) {}
  }

  return { token, user, raw: res.data };
};

// ===============================
// Logout
// ===============================

export const logout = async (options = {}) => {
  const { redirect = true } = options;

  clearAuthStorage();

  if (typeof window !== "undefined" && redirect) {
    const path = window.location.pathname || "";
    if (!path.includes("/auth/login") && !path.includes("/login")) {
      window.location.replace("/auth/login?reason=logout");
    }
  }
};

// ===============================
// Session Utilities
// ===============================

export const isLoggedIn = () => !!getStoredToken();

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (_) {
    return null;
  }
};

export const refreshMyProfile = async (options = {}) => {
  const { persist = true } = options;

  const me = await fetchUserProfile();
  if (persist && me) setStoredUser(me);
  return me;
};

// ===============================
// Aliases
// ===============================

export const loginUser = (payload, options = {}) =>
  login(payload, options);

export const registerUser = (payload, options = {}) =>
  register(payload, { persist: false, fetchMeIfMissing: false, ...options });
