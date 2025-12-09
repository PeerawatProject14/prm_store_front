"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

    const role = currentUser?.role_name || currentUser?.role || "";
    const isAdmin = role.toLowerCase() === 'admin';

    return (
        <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-2xl border-b border-white/20 px-4 py-3 transition-all shadow-sm supports-[backdrop-filter]:bg-white/30">
            <div className="flex items-center justify-between">
                {/* --- Left Section --- */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        R
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">
                            Room Booking
                        </h1>
                        <span className="text-sm text-slate-600">
                            Piramid Solution Co.,Ltd
                        </span>
                    </div>
                </div>

                {/* --- Right Section (Desktop) --- */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm font-medium text-slate-700 flex items-center justify-end gap-1">
                            <span className="text-slate-500">🕒</span> {currentTime}
                        </div>
                        <div className="text-xs text-slate-500">{currentDate}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onViewChange("calendar")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${currentView === "calendar"
                                ? "bg-blue-50/80 text-blue-600 border-blue-200 shadow-sm"
                                : "bg-transparent text-slate-600 border-transparent hover:bg-white/60 hover:text-blue-600"
                                }`}
                        >
                            <span>📅</span>
                            <span>Calendar</span>
                        </button>

                        <button
                            onClick={() => onViewChange("listing")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${currentView === "listing"
                                ? "bg-emerald-50/80 text-emerald-600 border-emerald-200 shadow-sm"
                                : "bg-transparent text-slate-600 border-transparent hover:bg-white/60 hover:text-emerald-600"
                                }`}
                        >
                            <span>📖</span>
                            <span>Room Booking</span>
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => onViewChange("admin")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border ${currentView === "admin"
                                    ? "bg-purple-50/80 text-purple-600 border-purple-200 shadow-sm"
                                    : "bg-transparent text-slate-600 border-transparent hover:bg-white/60 hover:text-purple-600"
                                    }`}
                            >
                                <span>🛡️</span>
                                <span>Admin</span>
                            </button>
                        )}

                        {/* <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-600 border border-transparent hover:bg-white/60 hover:text-orange-600 transition-all">
                            <span>📊</span>
                            <span>Reports</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-600 border border-transparent hover:bg-white/60 hover:text-amber-600 transition-all">
                            <span>👑</span>
                            <span>Master</span>
                        </button> */}

                        <button
                            onClick={() => router.push("/")}
                            className="ml-2 px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 bg-white/50 text-slate-600 hover:bg-white hover:shadow-md transition-all flex items-center gap-1"
                        >
                            <span>←</span> กลับหน้าหลัก
                        </button>
                    </div>
                </div>

                {/* --- Mobile Menu Button --- */}
                <div className="md:hidden flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs font-medium text-slate-700 flex items-center justify-end gap-1">
                            {currentTime}
                        </div>
                        <div className="text-[10px] text-slate-500">{currentDate}</div>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* --- Mobile Menu Dropdown --- */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => handleNavClick("calendar")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === "calendar"
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <span>📅</span>
                        <span>Calendar</span>
                    </button>

                    <button
                        onClick={() => handleNavClick("listing")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === "listing"
                            ? "bg-emerald-50 text-emerald-600"
                            : "text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <span>📖</span>
                        <span>Room Booking</span>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => handleNavClick("admin")}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentView === "admin"
                                ? "bg-purple-50 text-purple-600"
                                : "text-slate-600 hover:bg-white/50"
                                }`}
                        >
                            <span>🛡️</span>
                            <span>Admin</span>
                        </button>
                    )}

                    {/* <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/50 transition-all">
                        <span>📊</span>
                        <span>Reports</span>
                    </button>

                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/50 transition-all">
                        <span>👑</span>
                        <span>Master</span>
                    </button> */}

                    <div className="h-px bg-slate-200/50 my-1"></div>

                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/50 transition-all"
                    >
                        <span>←</span> กลับหน้าหลัก
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
