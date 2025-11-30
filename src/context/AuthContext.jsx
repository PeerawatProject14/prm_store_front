import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  // 1. เพิ่ม State สำหรับรอโหลดข้อมูล
  const [loading, setLoading] = useState(true); 

  // โหลด token จาก localStorage ตอนเปิดเว็บ
  useEffect(() => {
    // เช็คว่ารันในฝั่ง Client หรือไม่ (กัน Error ใน Next.js)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (stored) {
        setToken(stored);
      }
    }
    // 2. เมื่อเช็คเสร็จแล้ว (ไม่ว่าจะเจอหรือไม่เจอ) ให้ปิดสถานะ Loading
    setLoading(false);
  }, []);

  // เมื่อ token เปลี่ยน → อัปเดต localStorage
  useEffect(() => {
    // 3. สำคัญมาก! ถ้ายังโหลดของเก่าไม่เสร็จ ห้ามไปยุ่งกับ localStorage 
    // ไม่งั้นมันจะเอาค่า null ไปทับของเก่าหายหมด
    if (loading) return; 

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token, loading]); // เพิ่ม loading เข้าไปใน dependency

  // 4. ถ้ากำลังโหลดอยู่ ให้หยุดไว้ตรงนี้ก่อน อย่าเพิ่งไปเรนเดอร์ลูกๆ (children)
  // ไม่งั้นหน้า Dashboard จะทำงานก่อน แล้วเห็นว่าไม่มี Token เลยเตะกลับหน้า Login
  if (loading) {
    return null; // หรือจะใส่ Loading Spinner สวยๆ ตรงนี้ก็ได้ครับ
  }

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}