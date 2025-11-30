import { useState } from "react";
import Input from "@/components/auth/Input";
import Button from "@/components/auth/Button";
import { registerUser } from "@/services/auth";
import Link from "next/link";

export default function RegisterForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerUser(form);
    window.location.href = "/auth/login";
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-10 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-500 mb-4">
        Create an account
      </h1>
     

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
        <Input 
            label="Password" 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Password"
        />

        <div className="pt-2">
            <Button type="submit" text="Register" full />
        </div>
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        เคยมีบัญชีแล้ว?{" "}
        <Link href="/auth/login" className="text-[#0095F6] font-semibold hover:text-blue-700">
          Log in
        </Link>
      </p>
    </div>
  );
}