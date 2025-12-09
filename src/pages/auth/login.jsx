"use client";

import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ ล้าง session แค่จุดเดียวพอ
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    // ✅ ถ้ามี redirect lock จาก guard ให้ล้างด้วย
    sessionStorage.removeItem("__auth_redirect_lock__");

    // ❗ แนะนำ: ไม่ต้องล้าง cookies แบบกวาดโดเมนทั้งหมด
    // เพราะเสี่ยงชนระบบ auth อื่นๆ/Next internals
    // ถ้าคุณจำเป็นต้องล้างจริงๆ ค่อยล้างเฉพาะ cookie ที่เกี่ยวกับระบบคุณ

    console.log("Session cleared on Login page.");
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <LoginForm />
    </div>
  );
}
