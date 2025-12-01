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

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⭐ ส่วนที่แก้ (Fixed Loop Issue)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("[API Error] 401 Unauthorized: Session expired.");
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");

          const currentPath = window.location.pathname;

          // เช็คว่าไม่ได้อยู่หน้า Login
          if (
            currentPath !== "/" &&
            currentPath !== "/login" &&
            currentPath !== "/auth/login"
          ) {
            alert("Session expired. Please login again.");
            window.location.href = "/auth/login";
            
            // ⭐⭐⭐ เพิ่มบรรทัดนี้: ส่ง Promise ค้างไว้ เพื่อไม่ให้ Error เด้งขึ้นหน้าจอ
            // ตัว Browser จะ Redirect หนีไปก่อนที่ Promise นี้จะจบ
            return new Promise(() => {}); 
          }
        }
      } else if (status === 403) {
        console.warn("[API Error] 403 Forbidden: No permission.");
      }
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

  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    console.warn("Cannot fetch user profile from API", error);
    throw error;
  }
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

// Room Booking APIs
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
  const res = await api.patch(`/room/${id}/status`, { room_status_code: status });
  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/room/${id}`);
  return res.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Client-side upload failed');
  }

  return response.json();
};