// 1. เพิ่ม useEffect เข้ามา
import { useState, useEffect } from "react"; 
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { loginUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginForm() {
  const { setToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // ⭐ แก้ Loop: สั่งลบ Token ทันทีที่ Component นี้เริ่มทำงาน
  useEffect(() => {
    // ลบ Token และ User เก่าที่อาจจะค้างอยู่และหมดอายุแล้ว
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken"); // เผื่อมี key นี้
    
    // ลบ Cookies ด้วย (เพื่อความชัวร์)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log("Cleanup: Old session data cleared.");
  }, []); // [] หมายถึงทำแค่ครั้งเดียวตอนโหลดหน้า

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginUser(form);

      if (result?.token) {
        // บันทึก Token ใหม่
        setToken(result.token);
        localStorage.setItem("token", result.token); // บันทึก token ลง storage ด้วยถ้า context ไม่ได้ทำให้

        // บันทึกข้อมูล user
        if (result.user) {
           localStorage.setItem("user", JSON.stringify(result.user));
        }

        // Redirect ไปหน้า Dashboard
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-10 w-full max-w-sm mx-auto">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8 font-sans tracking-tight">
        Sign in
      </h1>

      {error && (
        <div className="mb-5 p-3 rounded bg-red-50 border border-red-100 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Phone number, username, or email"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />

        <div className="pt-2">
            <Button type="submit" text="Log in" full />
        </div>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-200"></div>
        <div className="px-4 text-xs font-bold text-gray-400 uppercase">OR</div>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <p className="text-center text-sm text-gray-600">
        ยังไม่มีบัญชี?{" "}
        <Link href="/auth/register" className="text-[#0095F6] font-semibold hover:text-blue-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}