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

          if (
            window.location.pathname !== "/" &&
            window.location.pathname !== "/login"
          ) {
            alert("Session expired. Please login again.");
            window.location.href = "/";
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