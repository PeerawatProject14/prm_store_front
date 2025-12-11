"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getRoomColor } from "@/utils/roomColors";
import {
    HiChevronLeft,
    HiChevronRight,
    HiCalendar,
    HiClock,
    HiMapPin,
    HiUser,
    HiListBullet
} from "react-icons/hi2";

// --- Constants & Helpers ---
const HOUR_HEIGHT = 180;

const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

// --- Minimal Logo Component ---
const BrandLogo = () => (
    <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            M
        </div>
        <div className="flex flex-col">
            <span className="text-gray-900 font-bold text-sm tracking-tight leading-none">MEETING</span>
            <span className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">Room Booking</span>
        </div>
    </div>
);

// --- Main Component ---
const WeeklyCalendar = ({
    rooms,
    bookings,
    onBookingClick,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRoomId, setSelectedRoomId] = useState("all");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLegendOpen, setIsLegendOpen] = useState(false);

    const scrollContainerRef = useRef(null);
    const currentTimeIndicatorRef = useRef(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- Date Logic ---
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(currentDate);

    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }, [startOfWeek]);

    // --- Handlers ---
    const handlePrevWeek = () => {
        const newDate = new Date(startOfWeek);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(startOfWeek);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleJumpToNow = () => {
        const now = new Date();
        setCurrentDate(now);
        setTimeout(() => {
            if (currentTimeIndicatorRef.current) {
                currentTimeIndicatorRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
        }, 100);
    };

    const timeSlots = [];
    for (let i = 8; i <= 18; i++) {
        timeSlots.push(i);
    }

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (selectedRoomId === "all") return true;
            return String(b.roomId) === String(selectedRoomId);
        });
    }, [bookings, selectedRoomId]);

    // --- Layout Calculation ---
    const getProcessedBookingsForDay = (dayStr) => {
        const dayBookings = filteredBookings.filter(b => b.date === dayStr);
        const sorted = [...dayBookings].sort((a, b) => {
            const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
            if (startDiff !== 0) return startDiff;
            return (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)) - (timeToMinutes(a.endTime) - timeToMinutes(a.startTime));
        });

        return sorted.map((current, index) => {
            const currentStart = timeToMinutes(current.startTime);
            let overlapsBefore = 0;
            let sameStartCount = 0;
            for (let i = 0; i < index; i++) {
                const prev = sorted[i];
                const prevStart = timeToMinutes(prev.startTime);
                const prevEnd = timeToMinutes(prev.endTime);
                if (currentStart < prevEnd) overlapsBefore++;
                if (currentStart === prevStart) sameStartCount++;
            }
            return { ...current, indent: overlapsBefore, stackIndex: sameStartCount };
        });
    };

    // --- Styles ---
    const getBookingStyle = (booking) => {
        const startMinutesVal = timeToMinutes(booking.startTime);
        const endMinutesVal = timeToMinutes(booking.endTime);
        const top = ((startMinutesVal - (8 * 60)) / 60) * HOUR_HEIGHT + (booking.stackIndex || 0) * 5;
        const height = ((endMinutesVal - startMinutesVal) / 60) * HOUR_HEIGHT;
        const indentPixels = (booking.indent || 0) * 8;
        return {
            top: `${top}px`, height: `${height}px`, minHeight: '34px',
            left: `${indentPixels}px`, width: `calc(100% - ${indentPixels + 4}px)`,
            zIndex: 10 + (booking.indent || 0) + (booking.stackIndex || 0),
        };
    };

    const getCurrentTimeStyle = () => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        if (h < 8 || h > 18) return null;
        return { top: `${((h - 8) * 60 + m) / 60 * HOUR_HEIGHT}px` };
    };

    const currentTimeStyle = getCurrentTimeStyle();

    // --- Render ---
    return (
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 w-full lg:max-w-7xl lg:mx-auto lg:mt-6 lg:mb-14 overflow-hidden relative font-sans">

            {/* Left Sidebar (Room Legend & Logo) - Desktop Only */}
            <div className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white shrink-0">
                <div className="p-6 border-b border-gray-100">
                    {/* Logo Minimal Style */}
                    <BrandLogo />

                    <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-3 mt-6">All Rooms</h3>
                    <div className="space-y-1">
                        {rooms.map(room => {
                            const color = getRoomColor(room.id);
                            return (
                                <div key={room.id} className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group ${!room.isActive ? 'opacity-50 grayscale' : ''}`}>
                                    <div className={`w-3 h-3 rounded-full ${color.dot} ring-2 ring-white shadow-sm`}></div>
                                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{room.name}</div>
                                    {!room.isActive && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold ml-auto">Closed</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 mt-auto">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-blue-800 text-xs font-semibold mb-1">Need Help?</p>
                        <p className="text-blue-600 text-[11px] leading-relaxed">
                            Contact Admin for special room requests or issues.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content (Right Side) */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Header - Minimal & Clean */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0 z-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">
                            <HiCalendar className="w-4 h-4" />
                            <span>Weekly Schedule</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {weekDays[0].toLocaleDateString("en-US", { month: "long" })} {weekDays[0].getDate()} - {weekDays[4].getDate()}, {weekDays[4].getFullYear()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0095F6] focus:border-transparent cursor-pointer hover:bg-gray-100 transition"
                                value={selectedRoomId}
                                onChange={(e) => setSelectedRoomId(e.target.value)}
                            >
                                <option value="all">View All Rooms</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                            <button onClick={handlePrevWeek} className="p-1.5 text-gray-500 hover:text-[#0095F6] hover:bg-white rounded-md transition shadow-sm hover:shadow">
                                <HiChevronLeft size={18} />
                            </button>
                            <button onClick={handleToday} className="px-3 py-1 text-xs font-bold text-gray-600 hover:text-[#0095F6] transition uppercase">
                                Today
                            </button>
                            <button onClick={handleNextWeek} className="p-1.5 text-gray-500 hover:text-[#0095F6] hover:bg-white rounded-md transition shadow-sm hover:shadow">
                                <HiChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div ref={scrollContainerRef} className="flex-1 overflow-auto relative bg-white">
                    <div className="min-w-[900px]">

                        {/* Days Header */}
                        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200 sticky top-0 bg-white z-40">
                            <div className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center border-r border-gray-100 bg-gray-50 sticky left-0 z-50 flex items-end justify-center pb-2">
                                GMT+7
                            </div>
                            {weekDays.map((day) => {
                                const isToday = day.toDateString() === new Date().toDateString();
                                return (
                                    <div key={day.toISOString()} className={`py-3 px-2 text-center border-r border-gray-100 ${isToday ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-[#0095F6]' : 'text-gray-400'}`}>
                                            {day.toLocaleDateString("en-US", { weekday: "short" })}
                                        </div>
                                        <div className={`text-xl font-bold ${isToday ? 'text-[#0095F6]' : 'text-gray-900'}`}>
                                            {day.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Slots */}
                        <div className="relative grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr]">
                            {/* Time Column */}
                            <div className="border-r border-gray-100 bg-white sticky left-0 z-40">
                                {timeSlots.map((hour) => (
                                    <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-gray-100 text-xs font-medium text-gray-400 flex justify-center pt-2 relative">
                                        <span className="-mt-3 bg-white px-1 z-10">{hour.toString().padStart(2, '0')}:00</span>
                                    </div>
                                ))}
                            </div>

                            {/* Bookings Columns */}
                            {weekDays.map((day) => {
                                const dayStr = day.toISOString().split('T')[0];
                                const offset = day.getTimezoneOffset();
                                const localDate = new Date(day.getTime() - (offset * 60 * 1000));
                                const localDayStr = localDate.toISOString().split('T')[0];

                                const isToday = day.toDateString() === new Date().toDateString();
                                // 🔹 แก้ไข: กำหนดตัวแปร dayBookings ไว้ตรงนี้ เพื่อให้ scope ครอบคลุมการใช้งาน
                                const dayBookings = getProcessedBookingsForDay(localDayStr);

                                return (
                                    <div key={day.toISOString()} className={`relative border-r border-gray-100 min-h-[660px] ${isToday ? 'bg-blue-50/10' : ''}`}>
                                        {/* Grid Lines */}
                                        {timeSlots.map((hour) => (
                                            <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-gray-100 relative group/line">
                                                <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-gray-100 opacity-50"></div>
                                            </div>
                                        ))}

                                        {/* Current Time Line */}
                                        {isToday && currentTimeStyle && (
                                            <div ref={currentTimeIndicatorRef} className="absolute left-0 right-0 border-t-2 border-[#ED4956] z-30 pointer-events-none shadow-sm" style={currentTimeStyle}>
                                                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-[#ED4956] rounded-full ring-2 ring-white"></div>
                                            </div>
                                        )}

                                        {/* Booking Cards */}
                                        {dayBookings.map((booking) => {
                                            const colors = getRoomColor(booking.roomId);
                                            const style = getBookingStyle(booking);
                                            const room = rooms.find(r => r.id === booking.roomId);
                                            const duration = timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime);
                                            const isCompact = duration < 45;

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className={`group absolute rounded-lg border shadow-sm transition-all duration-200 cursor-pointer overflow-hidden
                            ${colors.bg} ${colors.border} ${colors.text} 
                            hover:z-50 hover:shadow-md hover:ring-1 hover:ring-opacity-50 ring-inset`}
                                                    style={style}
                                                    onClick={() => onBookingClick && onBookingClick(booking)}
                                                >
                                                    {/* Left Accent Bar */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.badge.replace('text-', 'bg-').replace('bg-', 'bg-opacity-100 ')}`}></div>

                                                    <div className={`h-full relative z-10 flex ${isCompact ? 'px-2 items-center' : 'p-2 flex-col'}`}>

                                                        {!isCompact ? (
                                                            /* --- Full View (แบบเต็ม) --- */
                                                            <>
                                                                {/* แถวบน: เวลา (เล็ก) */}
                                                                <div className="flex justify-between items-start gap-1 mb-0.5">
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                                                        {booking.startTime} - {booking.endTime}
                                                                    </span>
                                                                </div>

                                                                {/* Hero: ชื่อห้องเด่นสุด (ใหญ่ + หนา) */}
                                                                <div className="font-bold text-sm md:text-base leading-tight mb-0.5 text-gray-900">
                                                                    {room?.name}
                                                                </div>

                                                                {/* ชื่อเรื่องประชุม (เล็กกว่า) */}
                                                                <div className="text-xs font-medium opacity-80 line-clamp-2 mb-1 leading-snug">
                                                                    {booking.purpose}
                                                                </div>

                                                                {/* Footer: ผู้จอง */}
                                                                <div className="mt-auto pt-1.5 flex items-center justify-between text-[10px] font-medium opacity-70 border-t border-black/5">
                                                                    <span className="flex items-center gap-1"><HiUser className="w-3 h-3" /> {booking.bookedBy}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            /* --- Compact View (แบบเล็ก) --- */
                                                            <div className="flex items-center w-full gap-2">
                                                                {/* จุดสีช่วยบอกว่าเป็นห้องไหน */}
                                                                <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot} ring-1 ring-black/10`}></div>

                                                                {/* ชื่อห้องเด่นสุด (ตัวหนา) */}
                                                                <span className="text-xs font-bold text-gray-900 truncate leading-none">
                                                                    {room?.name || "Room"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Legend Toggle Button */}
            <div className="lg:hidden fixed bottom-6 left-6 z-[100] flex flex-col gap-3">
                {isLegendOpen && (
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 mb-2 w-64 animate-in slide-in-from-bottom-5 duration-200">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-700 text-sm">Rooms</h3>
                            <button onClick={() => setIsLegendOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {rooms.map(room => {
                                const color = getRoomColor(room.id);
                                return (
                                    <div key={room.id} className={`flex items-center gap-2 text-xs ${!room.isActive ? 'opacity-50' : ''}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`}></div>
                                        <span className="truncate flex-1 text-gray-700 font-medium">{room.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsLegendOpen(!isLegendOpen)}
                    className="bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center w-12 h-12 text-[#0095F6]"
                >
                    <HiListBullet size={24} />
                </button>
            </div>

            {/* Jump to Now Button */}
            <button
                onClick={handleJumpToNow}
                className="fixed bottom-6 right-6 z-[100] bg-[#0095F6] text-white p-3 rounded-full shadow-lg hover:bg-[#0085DE] active:scale-95 transition-all flex items-center gap-2"
                title="Jump to Now"
            >
                <HiClock size={24} />
            </button>

        </div>
    );
};

export default WeeklyCalendar;