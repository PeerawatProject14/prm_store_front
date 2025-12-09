"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลด token จาก localStorage ตอนเปิดเว็บ
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("token") || localStorage.getItem("auth_token");

      if (stored) {
        setTokenState(stored);
      }
    }
    setLoading(false);
  }, []);

  // ✅ ตัว setToken ใหม่: จัดการ state + localStorage ให้ครบในที่เดียว
  const setToken = useCallback((nextToken) => {
    const value = nextToken || null;
    setTokenState(value);

    if (typeof window === "undefined") return;

    if (value) {
      // รองรับทั้งสอง key กันชนโค้ดเก่า
      localStorage.setItem("token", value);
      localStorage.setItem("auth_token", value);

      // ถ้ามี redirect lock จาก guard รุ่นก่อน ให้ล้าง
      try {
        sessionStorage.removeItem("__auth_redirect_lock__");
      } catch (_) {}
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_token");
      // จะลบ user ด้วยก็ได้ ป้องกันค้าง
      // localStorage.removeItem("user");
    }
  }, []);

  // ยังใช้แนวเดิม: กันลูกเรนเดอร์ก่อนตอนกำลังโหลด token
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
