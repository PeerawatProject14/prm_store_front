"use client"; // 1. ต้องเพิ่มบรรทัดนี้เพื่อให้ใช้ useEffect ได้

import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  
  // 2. เพิ่ม Logic นี้เพื่อบังคับล้าง Token ทันทีที่หน้า Login โหลดขึ้นมา
  useEffect(() => {
    // ลบ Token ใน LocalStorage
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken"); // เผื่อใช้ชื่ออื่น
    localStorage.removeItem("user");
    
    // ลบ Cookies (ถ้ามีการใช้)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log("Session cleared automatically on Login page.");
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <LoginForm />
    </div>
  );
}