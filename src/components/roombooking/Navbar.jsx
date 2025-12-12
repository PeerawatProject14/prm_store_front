"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// ✅ Import ไอคอน Minimal แบบเส้น (Outline)
import { HiOutlineCalendar, HiOutlineClipboardDocumentList, HiOutlineShieldCheck, HiArrowLeft, HiBars3, HiXMark } from "react-icons/hi2";

const Navbar = ({ currentView, onViewChange, currentUser }) => {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
            setCurrentTime(timeStr);
            const dateStr = now.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
            setCurrentDate(dateStr);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleNavClick = (view) => {
        onViewChange(view);
        setIsMenuOpen(false);
    };

    // ✅ แก้ไขจุดที่ทำให้หน้าขาว: แปลงเป็น String ก่อนเสมอ กัน Error
    const role = currentUser?.role_name || currentUser?.role;
    const isAdmin = String(role || "").toLowerCase() === 'admin';

    return (
        // ✅ ธีมขาว-ดำ Minimal (ใช้ text-slate-700 เป็นหลัก)
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm text-slate-700">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">

                {/* --- Left Section: Title Only (ลบตัว R ออก) --- */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <h1 className="text-lg md:text-xl font-bold leading-tight text-slate-800">
                            Room Booking
                        </h1>
                        <span className="text-xs md:text-sm text-slate-500">
                            Piramid Solution Co.,Ltd
                        </span>
                    </div>
                </div>

                {/* --- Right Section (Desktop) --- */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Time Widget */}
                    <div className="text-right flex flex-col items-end">
                        <div className="text-sm font-semibold flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200/50">
                            {currentTime}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{currentDate}</div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2"></div>

                    {/* Menu Buttons Group (Minimal Icons) */}
                    <div className="flex items-center gap-1 p-0.5">
                        <button
                            onClick={() => onViewChange("calendar")}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${currentView === "calendar"
                                ? "bg-slate-100 text-black"
                                : "text-slate-600 hover:bg-slate-50 hover:text-black"
                                }`}
                        >
                            {/* ✅ ไอคอน Calendar */}
                            <HiOutlineCalendar className={`h-5 w-5 ${currentView === "calendar" ? "text-black" : "text-slate-500 group-hover:text-black"}`} />
                            <span>Calendar</span>
                        </button>

                        <button
                            onClick={() => onViewChange("listing")}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${currentView === "listing"
                                ? "bg-slate-100 text-black"
                                : "text-slate-600 hover:bg-slate-50 hover:text-black"
                                }`}
                        >
                            {/* ✅ ไอคอน Booking */}
                            <HiOutlineClipboardDocumentList className={`h-5 w-5 ${currentView === "listing" ? "text-black" : "text-slate-500 group-hover:text-black"}`} />
                            <span>Booking</span>
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => onViewChange("admin")}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${currentView === "admin"
                                    ? "bg-slate-100 text-black"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-black"
                                    }`}
                            >
                                {/* ✅ ไอคอน Admin */}
                                <HiOutlineShieldCheck className={`h-5 w-5 ${currentView === "admin" ? "text-black" : "text-slate-500 group-hover:text-black"}`} />
                                <span>Admin</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => router.push("/")}
                        className="ml-2 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-black hover:shadow-sm transition-all flex items-center gap-1"
                    >
                        <HiArrowLeft className="h-4 w-4" /> Back
                    </button>
                </div>

                {/* --- Mobile Menu Button --- */}
                <div className="md:hidden flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs font-bold flex items-center justify-end gap-1 text-slate-800">
                            {currentTime}
                        </div>
                        <div className="text-[10px] text-slate-500">{currentDate}</div>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                        {isMenuOpen ? (
                            <HiXMark className="h-6 w-6" />
                        ) : (
                            <HiBars3 className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* --- Mobile Menu Dropdown --- */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-slate-50 animate-in slide-in-from-top-2 duration-200 shadow-inner">
                    <div className="flex flex-col p-2 gap-1">
                        <button
                            onClick={() => handleNavClick("calendar")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === "calendar"
                                ? "bg-white text-black shadow-sm border border-slate-200"
                                : "text-slate-600 hover:bg-white"
                                }`}
                        >
                            <HiOutlineCalendar className="h-5 w-5" /> Calendar
                        </button>

                        <button
                            onClick={() => handleNavClick("listing")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === "listing"
                                ? "bg-white text-black shadow-sm border border-slate-200"
                                : "text-slate-600 hover:bg-white"
                                }`}
                        >
                            <HiOutlineClipboardDocumentList className="h-5 w-5" /> Booking
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => handleNavClick("admin")}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === "admin"
                                    ? "bg-white text-black shadow-sm border border-slate-200"
                                    : "text-slate-600 hover:bg-white"
                                    }`}
                            >
                                <HiOutlineShieldCheck className="h-5 w-5" /> Admin
                            </button>
                        )}

                        <div className="h-px bg-slate-200 my-1"></div>

                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-black transition-all"
                        >
                            <HiArrowLeft className="h-5 w-5" /> Back to Home
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;