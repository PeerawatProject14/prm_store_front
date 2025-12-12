"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiCog6Tooth, HiArrowRightOnRectangle, HiUserCircle } from "react-icons/hi2";

export default function HeaderControls() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    // const [userId, setUserId] = useState(null); // ❌ ไม่จำเป็นต้องใช้ userId ใน Link แล้ว

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const userRole = user.role ? user.role.toLowerCase() : null; 
                
                // if (user.id || user.user_id) { setUserId(user.id || user.user_id); } // ❌ ไม่ต้องใช้

                if (userRole === 'admin') { 
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (e) {
                console.error("Error parsing user data", e);
                setIsAdmin(false);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
        router.push("/auth/login");
    };

    return (
        <header className="flex justify-end items-center gap-3 pt-6 px-6">
            
            {/* 1. ปุ่ม Admin */}
            {isAdmin && (
                <Link
                    href="/admin/dashboard" 
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#EFEFEF] text-gray-900 hover:bg-gray-200 transition duration-200 ease-in-out"
                >
                    <HiCog6Tooth className="text-lg" />
                    <span>จัดการระบบ</span>
                </Link>
            )}

            {/* ✅ 2. ปุ่มแก้ไขข้อมูลส่วนตัว */}
            <Link
                href="/profile/profile"  // ✅ แก้เป็น /profile อย่างเดียว เพื่อวิ่งไปหาไฟล์ profile.jsx หรือ profile/index.jsx
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#EFEFEF] text-gray-900 hover:bg-gray-200 transition duration-200 ease-in-out"
            >
                <HiUserCircle className="text-lg" />
                <span>ข้อมูลส่วนตัว</span>
            </Link>

            {/* 3. ปุ่ม Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#EFEFEF] text-[#ED4956] hover:bg-gray-200 transition duration-200 ease-in-out"
            >
                <HiArrowRightOnRectangle className="text-lg" />
                <span>ออกจากระบบ</span>
            </button>

        </header>
    );
}