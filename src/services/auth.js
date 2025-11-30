import api from "./api";

export const loginUser = async (data) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (err) {
    // ส่งข้อความจาก backend ออกไปให้ Form handle ได้
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
