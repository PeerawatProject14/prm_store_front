"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiCog6Tooth, HiArrowRightOnRectangle } from "react-icons/hi2"; // แนะนำให้ใช้ Icon จาก library เพื่อความสวยงาม (ถ้ามี) หรือใช้ Emoji เดิมก็ได้

export default function HeaderControls() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const userRole = user.role ? user.role.toLowerCase() : null; 

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
            
            {/* Admin Button: สไตล์ปุ่ม Secondary (พื้นเทา ตัวหนังสือดำ) */}
            {isAdmin && (
                <Link
                    href="/admin/dashboard" 
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#EFEFEF] text-gray-900 hover:bg-gray-200 transition duration-200 ease-in-out"
                >
                    <span className="text-lg">⚙️</span>
                    <span>จัดการระบบ</span>
                </Link>
            )}

            {/* Logout Button: สไตล์ปุ่ม Destructive (พื้นเทา ตัวหนังสือแดง IG) */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#EFEFEF] text-[#ED4956] hover:bg-gray-200 transition duration-200 ease-in-out"
            >
                <span className="text-lg">↩</span>
                <span>ออกจากระบบ</span>
            </button>

        </header>
    );
}