"use client";
import Image from "next/image";
import { useState } from "react";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { loginUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { setToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      // ✅ สำคัญ: ไม่ให้ auth.js เขียน localStorage ซ้ำ
      const result = await loginUser(form, { persist: false });

      const token =
        result?.token ||
        result?.access_token ||
        result?.data?.token ||
        null;

      if (token) {
        // ✅ ให้ AuthContext จัดการ token + localStorage ให้ทั้งหมด
        setToken(token);

        // ✅ เก็บ user เฉพาะเมื่อมีจริง
        if (typeof window !== "undefined" && result?.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        router.replace("/dashboard");
        return;
      }

      setError("ไม่พบ token จากระบบ กรุณาลองใหม่");
    } catch (err) {
      const status = err?.response?.status;

      // ✅ 403 = ยังไม่ถูกอนุมัติ
      if (status === 403) {
        setError("บัญชียังไม่ถูกอนุมัติโดยผู้ดูแลระบบ กรุณารอการอนุมัติ");
      } 
      // ✅ 400/401 หรืออื่นๆ ใช้ข้อความจาก backend ก่อน
      else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "เกิดข้อผิดพลาด กรุณาลองใหม่";

        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-10 w-full max-w-sm mx-auto">
      <section className="flex flex-col items-center mt-8 px-4">
        <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 mb-4">
          <div className="p-[2px] rounded-full bg-white">
              <Image
                  src="/logo.png"
                  alt="Logo"
                  width={130}
                  height={130}
                  priority
                  className="rounded-full object-cover border border-gray-100"
              />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8 font-sans tracking-tight">
          Sign in
        </h1>
      </section>
      
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
          <Button
            type="submit"
            text={submitting ? "Signing in..." : "Sign in"}
            full
            disabled={submitting}
          />
        </div>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-200"></div>
        <div className="px-4 text-xs font-bold text-gray-400 uppercase">
          OR
        </div>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <p className="text-center text-sm text-gray-600">
        ยังไม่มีบัญชี?{" "}
        <Link
          href="/auth/register"
          className="text-[#0095F6] font-semibold hover:text-blue-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
 