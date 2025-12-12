"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { getRoomColor } from "@/utils/roomColors";
import {
    HiChevronLeft,
    HiChevronRight,
    HiOutlineClipboardDocumentList,
    HiMapPin,
    HiUser,
    HiClock // ✅ เพิ่มไอคอนนาฬิกา
} from "react-icons/hi2";

// --- Constants ---
const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_WIDTH = 140;
const TOTAL_WIDTH = (END_HOUR - START_HOUR + 1) * HOUR_WIDTH;

const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

// --- Minimal Logo ---
const BrandLogo = () => (
    <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            M
        </div>
        <div className="flex flex-col">
            <span className="text-gray-900 font-bold text-sm tracking-tight leading-none">MEETING</span>
            <span className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">Desktop View</span>
        </div>
    </div>
);

const TimelineCalendar = ({
    rooms,
    bookings,
    onBookingClick,
    onViewChange,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const scrollContainerRef = useRef(null);

    // Update Current Time
    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Scroll to current time on load
    useEffect(() => {
        if (scrollContainerRef.current) {
            const now = new Date();
            const currentHour = now.getHours();
            if (currentHour >= START_HOUR && currentHour <= END_HOUR) {
                const scrollPos = (currentHour - START_HOUR) * HOUR_WIDTH;
                scrollContainerRef.current.scrollLeft = scrollPos - 100;
            }
        }
    }, []);

    // --- Handlers ---
    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => setCurrentDate(new Date());

    // --- Processing ---
    const dateStr = currentDate.toLocaleDateString('en-CA');
    const dailyBookings = useMemo(() => bookings.filter(b => b.date === dateStr), [bookings, dateStr]);

    const timeSlots = [];
    for (let i = START_HOUR; i <= END_HOUR; i++) timeSlots.push(i);

    const getBookingStyle = (booking) => {
        const startMin = timeToMinutes(booking.startTime);
        const endMin = timeToMinutes(booking.endTime);
        const dayStartMin = START_HOUR * 60;
        const left = ((startMin - dayStartMin) / 60) * HOUR_WIDTH;
        const width = ((endMin - startMin) / 60) * HOUR_WIDTH;
        return { left: `${left}px`, width: `${width}px` };
    };

    const getCurrentTimePosition = () => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        if (h < START_HOUR || h > END_HOUR) return -1;
        return ((h - START_HOUR) * 60 + m) / 60 * HOUR_WIDTH;
    };

    const currentTimePos = getCurrentTimePosition();
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
        <div className="flex flex-col bg-white w-full h-full overflow-hidden font-sans border-t border-gray-200">

            {/* --- Header Control --- */}
            <div className="px-6 py-3 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between gap-4 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <BrandLogo />
                    <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {currentDate.toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={handlePrevDay} className="p-1.5 text-gray-600 hover:bg-white rounded shadow-none hover:shadow-sm transition">
                            <HiChevronLeft size={18} />
                        </button>
                        <button onClick={handleToday} className="px-4 py-1 text-xs font-bold text-gray-700 hover:text-[#0095F6] transition uppercase border-x border-gray-200 mx-1">
                            Today
                        </button>
                        <button onClick={handleNextDay} className="p-1.5 text-gray-600 hover:bg-white rounded shadow-none hover:shadow-sm transition">
                            <HiChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Timeline Body --- */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* 1. Sticky Sidebar (Rooms) */}
                <div className="w-64 shrink-0 bg-white border-r border-gray-200 z-10 overflow-hidden flex flex-col shadow-[4px_0_10px_rgba(0,0,0,0.03)]">
                    <div className="h-10 border-b border-gray-200 bg-gray-50 flex items-center px-4 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                        Rooms List
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {rooms.map((room) => {
                            const color = getRoomColor(room.id);
                            return (
                                <div key={room.id} className="h-24 border-b border-gray-100 flex items-center px-4 hover:bg-gray-50 transition group cursor-pointer relative">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color.badge.replace('text-', 'bg-')}`}></div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800 group-hover:text-[#0095F6] transition">{room.name}</div>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded"><HiMapPin className="w-3 h-3" /> {room.floor || "-"}</span>
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded"><HiUser className="w-3 h-3" /> {room.capacity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="flex-1 bg-gray-50/30 min-h-0"></div>
                    </div>
                </div>

                {/* 2. Scrollable Timeline Area */}
                <div className="flex-1 overflow-auto bg-slate-50 relative" ref={scrollContainerRef}>
                    <div style={{ width: `${TOTAL_WIDTH}px`, minHeight: '100%' }} className="relative flex flex-col">

                        {/* Time Header */}
                        <div className="h-10 border-b border-gray-200 bg-white sticky top-0 z-20 flex shadow-sm">
                            {timeSlots.map((hour) => (
                                <div key={hour} style={{ width: `${HOUR_WIDTH}px` }} className="flex-shrink-0 border-r border-gray-100 text-xs font-semibold text-gray-500 flex items-center justify-start pl-3 bg-white">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        {/* Current Time Indicator */}
                        {isToday && currentTimePos >= 0 && (
                            <div
                                className="absolute top-10 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
                                style={{ left: `${currentTimePos}px` }}
                            >
                                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm ring-2 ring-white"></div>
                            </div>
                        )}

                        {/* Grid & Bookings */}
                        <div className="flex-1 relative">
                            {/* Background Grid */}
                            <div className="absolute inset-0 z-0 flex pointer-events-none">
                                {timeSlots.map((hour, idx) => (
                                    <div
                                        key={idx}
                                        style={{ width: `${HOUR_WIDTH}px` }}
                                        className="h-full border-r border-dashed border-gray-200"
                                    ></div>
                                ))}
                            </div>

                            {/* Rooms Rows */}
                            {rooms.map((room) => {
                                const roomBookings = dailyBookings.filter(b => String(b.roomId) === String(room.id));
                                return (
                                    <div key={room.id} className="h-24 border-b border-gray-100 relative bg-transparent hover:bg-white/50 transition z-10">
                                        {roomBookings.map((booking) => {
                                            const style = getBookingStyle(booking);
                                            const colors = getRoomColor(booking.roomId);

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className={`absolute top-3 bottom-3 rounded-md shadow-sm border text-xs cursor-pointer hover:shadow-md hover:z-20 transition-all flex flex-col justify-center px-3 overflow-hidden ${colors.bg} ${colors.border} ${colors.text}`}
                                                    style={{ ...style }}
                                                    onClick={() => onBookingClick && onBookingClick(booking)}
                                                >
                                                    {/* ✅ 1. หัวข้อใหญ่เป็น Purpose */}
                                                    <div className="font-bold truncate text-sm leading-tight mb-1">
                                                        {booking.purpose || "No Title"}
                                                    </div>

                                                    {/* ✅ 2. แสดงช่วงเวลา และ ผู้จอง */}
                                                    <div className="flex items-center gap-2 text-[10px] opacity-90 truncate">
                                                        {/* Time Badge */}
                                                        <div className="flex items-center gap-1 bg-black/5 px-1.5 py-0.5 rounded font-medium">
                                                            <HiClock className="w-3 h-3" />
                                                            {booking.startTime} - {booking.endTime}
                                                        </div>

                                                        {/* User */}
                                                        <div className="flex items-center gap-1 opacity-75">
                                                            <HiUser className="w-3 h-3" />
                                                            {booking.bookedBy.split(' ')[0]} {/* ตัดนามสกุลออกเพื่อประหยัดที่ */}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                            <div className="flex-1 bg-transparent z-0"></div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    if (typeof onViewChange === 'function') {
                        onViewChange("listing");
                    } else {
                        console.warn("onViewChange prop is missing!");
                    }
                }}
                className="absolute bottom-8 right-8 z-50 bg-[#0095F6] text-white p-4 rounded-full shadow-xl hover:bg-[#0085DE] hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            >
                <HiOutlineClipboardDocumentList size={26} />
            </button>
        </div>
    );
};

export default TimelineCalendar;