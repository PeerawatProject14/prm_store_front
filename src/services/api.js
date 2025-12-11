import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "FATAL ERROR: NEXT_PUBLIC_API_URL is not defined. Please check your .env file."
  );
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// AUTH GUARD (GLOBAL-ISH) USING SESSION LOCK
// ==========================================

const REDIRECT_LOCK_KEY = "__auth_redirect_lock__";

// หน้า login ที่ไม่ควร redirect ซ้ำ
const LOGIN_PATHS = ["/auth/login", "/login"];

// ✅ public endpoint ที่ต้องยิงได้แม้ไม่มี token
// (เพิ่มแบบไม่ใส่ / เผื่อ axios ส่งมาแบบนั้น)
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "auth/login",
  "auth/register",
];

// ------------------------------------------
// helpers
// ------------------------------------------

const getRedirectLock = () => {
  try {
    return sessionStorage.getItem(REDIRECT_LOCK_KEY);
  } catch (_) {
    return null;
  }
};

const setRedirectLock = (reason) => {
  try {
    sessionStorage.setItem(
      REDIRECT_LOCK_KEY,
      JSON.stringify({ reason, at: Date.now() })
    );
  } catch (_) { }
};

const clearRedirectLock = () => {
  try {
    sessionStorage.removeItem(REDIRECT_LOCK_KEY);
  } catch (_) { }
};

const isOnLoginPage = () => {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname || "";
  return LOGIN_PATHS.some((lp) => p.includes(lp));
};

// ดึง pathname จาก config.url ให้ robust
const extractPath = (rawUrl = "") => {
  const u = String(rawUrl || "");

  // ถ้าเป็น absolute URL
  if (u.startsWith("http://") || u.startsWith("https://")) {
    try {
      return new URL(u).pathname || u;
    } catch (_) {
      return u;
    }
  }

  // ถ้าเป็น relative
  return u;
};

// normalize ให้เทียบง่าย
const normalizePath = (p = "") => {
  let s = String(p || "");
  // ตัด query
  const qIndex = s.indexOf("?");
  if (qIndex >= 0) s = s.slice(0, qIndex);

  // กันไม่มี /
  if (!s.startsWith("/")) s = "/" + s;

  // ตัดของซ้ำ / ท้าย
  s = s.replace(/\/+$/, "");

  return s;
};

const isPublicRequestByUrl = (rawUrl = "") => {
  const path = normalizePath(extractPath(rawUrl));

  // เช็คแบบ strict ก่อน
  if (path === "/auth/login" || path === "/auth/register") return true;

  // เผื่อมี prefix แปลก ๆ
  const loose = String(rawUrl || "");
  return PUBLIC_PATHS.some((p) => loose.includes(p));
};

const redirectToLoginOnce = (reason) => {
  if (typeof window === "undefined") return;

  if (isOnLoginPage()) return;

  const lockRaw = getRedirectLock();
  if (lockRaw) {
    try {
      const lock = JSON.parse(lockRaw);
      // กันซ้ำในช่วงสั้นๆ
      if (Date.now() - (lock?.at || 0) < 3000) return;
    } catch (_) { }
  }

  setRedirectLock(reason);
  window.location.replace(`/auth/login?reason=${reason}`);
};

// ==========================================
// 1. REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") return config;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("accessToken");

    const url = config?.url || "";
    const isPublicRequest = isPublicRequestByUrl(url);

    // ✅ ถ้าเป็น public path (login/register) ให้ผ่านเสมอ
    if (isPublicRequest) return config;

    // ✅ มี token ก็แนบให้
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // ✅ ไม่มี token และไม่ใช่ public -> redirect ครั้งเดียว
    redirectToLoginOnce("missing_token");

    const err = new Error("NO_TOKEN");
    err.code = "NO_TOKEN";
    return Promise.reject(err);
  },
  (error) => Promise.reject(error)
);

// ==========================================
// 2. RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => {
    // ถ้ามี response ปกติ แปลว่า session ใช้ได้
    if (typeof window !== "undefined") {
      clearRedirectLock();
    }
    return response;
  },
  (error) => {
    if (error?.code === "NO_TOKEN") {
      return Promise.reject(error);
    }

    const isCanceled =
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError" ||
      error?.name === "AbortError";

    if (isCanceled) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      redirectToLoginOnce("expired");
    }

    return Promise.reject(error);
  }
);

export default api;

// ==========================================
// User / Auth Related
// ==========================================

export const fetchUserProfile = async () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    }
  }

  const res = await api.get("/auth/me");
  return res.data;
};

// ==========================================
// Case / Hot Issue Related
// ==========================================

export const getHotIssueStats = async () => {
  const res = await api.get("/case/stats");
  return res.data;
};

export const getHotIssueDetailStats = async () => {
  const res = await api.get("/case/stats-detail");
  return res.data;
};

export const getHotIssueCases = async () => {
  const res = await api.get("/case");
  return res.data;
};

export const createNewCase = async (data) => {
  const res = await api.post("/case", data);
  return res.data;
};

export const deleteCase = async (id) => {
  const res = await api.delete(`/case/${id}`);
  return res.data;
};

export const getCaseHistory = async (id) => {
  const res = await api.get(`/case/${id}/history`);
  return res.data;
};

export const updateCase = async (id, data) => {
  const res = await api.put(`/case/${id}`, data);
  return res.data;
};

// ==========================================
// Admin Management Related
// ==========================================

const ADMIN_USER_PATH = "/admin/users";
const ADMIN_ROLE_PATH = "/admin/roles";

export const fetchAllUsers = async () => {
  const response = await api.get(ADMIN_USER_PATH);
  return response.data;
};

export const fetchAllRoles = async () => {
  const response = await api.get(ADMIN_ROLE_PATH);
  return response.data;
};

export const approveUserApi = async (userId) => {
  const response = await api.patch(`${ADMIN_USER_PATH}/${userId}/approve`);
  return response.data;
};

export const updateStatusApi = async (userId, statusCode) => {
  const response = await api.patch(`${ADMIN_USER_PATH}/${userId}/status`, {
    status_code: statusCode,
  });
  return response.data;
};

export const updateRoleApi = async (userId, roleId) => {
  const response = await api.patch(`${ADMIN_USER_PATH}/${userId}/role`, {
    role_id: roleId,
  });
  return response.data;
};

export const deleteUserApi = async (userId) => {
  const response = await api.delete(`${ADMIN_USER_PATH}/${userId}`);
  return response.data;
};

// ==========================================
// Module Management Related
// ==========================================

const MODULES_PATH = "/admin/modules";

export const fetchModules = async () => {
  const res = await api.get(MODULES_PATH);
  return res.data;
};

export const updateModuleStatusApi = async (code, isEnabled) => {
  const res = await api.patch(`${MODULES_PATH}/${code}/status`, {
    is_enabled: isEnabled,
  });
  return res.data;
};

export const isModuleEnabled = async (code) => {
  const modules = await fetchModules();
  const mod = modules.find((m) => m.code === code);
  return !!mod && !!mod.is_enabled;
};

// ==========================================
// Room Booking APIs
// ==========================================

export const getRooms = async () => {
  const res = await api.get("/room");
  return res.data;
};

export const getAllBookings = async () => {
  const res = await api.get("/booking");
  return res.data;
};

export const createBooking = async (data) => {
  const res = await api.post("/booking", data);
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await api.patch(`/booking/${id}/status`, { status });
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.patch(`/booking/${id}/cancel`);
  return res.data;
};

export const createRoom = async (data) => {
  const res = await api.post("/room", data);
  return res.data;
};

export const updateRoomStatus = async (id, status) => {
  const res = await api.patch(`/room/${id}/status`, {
    room_status_code: status,
  });
  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/room/${id}`);
  return res.data;
};

// ==========================================
// Upload (Client -> Node Backend Directly)
// ==========================================

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // ใช้ instance 'api' ที่มี interceptor จัดการ token ให้แล้ว
  // ยิงไปที่ /upload ของ Backend (ตามที่เราตั้งใน server.js)
  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // คาดหวัง { success: true, filepath: '/uploads/...' }
};

export const fetchAmenities = async () => {
  const res = await api.get("/amenities");
  return res.data;
};
