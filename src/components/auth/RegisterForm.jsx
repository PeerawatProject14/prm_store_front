"use client";

import { useState, useMemo } from "react";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { registerUser } from "@/services/auth";
import Link from "next/link";

const DEPARTMENTS = [
  "Account & Finance",
  "Human Resource Management",
  "BMS",
  "Business Development",
  "Smart City",
  "Consult and Design",
  "Pre Operation & QC",
  "Management",
  "Marketing",
  "Pre-Sales",
  "Project Management BKK",
  "Project Management CBI",
  "Project Management PKT",
  "Project Management SMI",
  "Sales",
  "Technical & Service",
];

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((name, idx) => ({
  id: idx + 1,
  name,
}));

export default function RegisterForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",

    department_id: "",
    job_title: "",
    phone_number: "",

    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const phoneIsValid = useMemo(() => {
    if (!form.phone_number) return true;
    return /^[0-9]+$/.test(String(form.phone_number));
  }, [form.phone_number]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSuccessMsg("");

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const email = form.email.trim();

    if (!firstName || !lastName || !email || !form.password) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }

    if (!form.department_id) {
      setError("กรุณาเลือกแผนก (Department)");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("รหัสผ่านทั้งสองช่องต้องตรงกัน");
      return;
    }

    if (!phoneIsValid) {
      setError("เบอร์โทรต้องเป็นตัวเลขเท่านั้น");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password: form.password,

      department_id: Number(form.department_id),
      job_title: form.job_title.trim() || null,
      phone_number: form.phone_number.trim() || null,
    };

    setSubmitting(true);

    try {
      await registerUser(payload);

      // ✅ ยังต้องรอ admin approve
      setSuccessMsg("สมัครสำเร็จ! กรุณารอผู้ดูแลระบบอนุมัติก่อนเข้าใช้งาน");

      // หน่วงน้อยๆ ให้ user เห็นข้อความ
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-10 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-500 mb-4">
        Create an account
      </h1>

      {!!error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-100 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {!!successMsg && (
        <div className="mb-4 p-3 rounded bg-green-50 border border-green-100 text-green-700 text-sm text-center">
          {successMsg}
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          label="First name"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
        />

        <Input
          label="Last name"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Mobile Number or Email"
        />

        {/* ✅ Department Dropdown (บังคับเลือก) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Department
          </label>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
          >
            <option value="">เลือกแผนก</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Job Title optional */}
        <Input
          label="Job Title (optional)"
          name="job_title"
          value={form.job_title}
          onChange={handleChange}
          placeholder="Job Title"
        />

        {/* ✅ Phone optional (digits only) */}
        <Input
          label="Phone Number (optional)"
          name="phone_number"
          value={form.phone_number}
          onChange={(e) => {
            const v = e.target.value ?? "";
            if (v === "" || /^[0-9]+$/.test(v)) {
              setForm((prev) => ({ ...prev, phone_number: v }));
            } else {
              setForm((prev) => ({
                ...prev,
                phone_number: v.replace(/\D/g, ""),
              }));
            }
          }}
          placeholder="Phone Number"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />

        <Input
          label="Confirm Password"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={handleChange}
          placeholder="Confirm Password"
        />

        <div className="pt-2">
          <Button
            type="submit"
            text={submitting ? "Registering..." : "Register"}
            full
            disabled={submitting}
          />
        </div>
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        เคยมีบัญชีแล้ว?{" "}
        <Link
          href="/auth/login"
          className="text-[#0095F6] font-semibold hover:text-blue-700"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
