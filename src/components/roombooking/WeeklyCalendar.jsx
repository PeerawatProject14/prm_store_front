"use client";

import React, { useState, useEffect, useMemo } from "react";

// --- 2. Constants & Helpers ---
const HOUR_HEIGHT = 120;

const ROOM_COLORS = [
    { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', dot: 'bg-pink-500', badge: 'bg-pink-100' },
    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', dot: 'bg-purple-500', badge: 'bg-purple-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-500', badge: 'bg-indigo-100' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', dot: 'bg-cyan-500', badge: 'bg-cyan-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500', badge: 'bg-emerald-100' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500', badge: 'bg-amber-100' },
    { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', dot: 'bg-orange-500', badge: 'bg-orange-100' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', dot: 'bg-rose-500', badge: 'bg-rose-100' },
];

const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

// --- 3. Main Component ---
const WeeklyCalendar = ({
    rooms,
    bookings,
    onBookingClick,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedRoomId, setSelectedRoomId] = useState("all");
    const [currentTime, setCurrentTime] = useState(new Date());

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

    const timeSlots = [];
    for (let i = 8; i <= 18; i++) {
        timeSlots.push(i);
    }

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            if (selectedRoomId !== "all" && b.roomId !== selectedRoomId) return false;
            return true;
        });
    }, [bookings, selectedRoomId]);

    // --- Layout Calculation ---
    const getProcessedBookingsForDay = (dayStr) => {
        const dayBookings = filteredBookings.filter(b => b.date === dayStr);

        const sorted = [...dayBookings].sort((a, b) => {
            const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
            if (startDiff !== 0) return startDiff;
            const durationA = timeToMinutes(a.endTime) - timeToMinutes(a.startTime);
            const durationB = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
            return durationB - durationA;
        });

        const processed = sorted.map((current, index) => {
            const currentStart = timeToMinutes(current.startTime);

            let overlapsBefore = 0;
            let sameStartCount = 0;

            for (let i = 0; i < index; i++) {
                const prev = sorted[i];
                const prevStart = timeToMinutes(prev.startTime);
                const prevEnd = timeToMinutes(prev.endTime);

                if (currentStart < prevEnd) {
                    overlapsBefore++;
                }
                if (currentStart === prevStart) {
                    sameStartCount++;
                }
            }
            return { ...current, indent: overlapsBefore, stackIndex: sameStartCount };
        });

        return processed;
    };

    // --- Style Calculation ---
    const getBookingStyle = (booking) => {
        const startMinutesVal = timeToMinutes(booking.startTime);
        const endMinutesVal = timeToMinutes(booking.endTime);

        const startOffset = startMinutesVal - (8 * 60);
        const duration = endMinutesVal - startMinutesVal;

        const stackOffset = (booking.stackIndex || 0) * 5;

        const top = (startOffset / 60) * HOUR_HEIGHT + stackOffset;
        const height = (duration / 60) * HOUR_HEIGHT;

        const indentLevel = booking.indent || 0;
        const indentPixels = indentLevel * 8;
        const widthStyle = `calc(100% - ${indentPixels + 4}px)`;

        return {
            top: `${top}px`,
            height: `${height}px`,
            minHeight: '34px',
            left: `${indentPixels}px`,
            width: widthStyle,
            zIndex: 10 + indentLevel + (booking.stackIndex || 0),
        };
    };

    const getCurrentTimeStyle = () => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        if (h < 8 || h > 18) return null;
        const minutes = (h - 8) * 60 + m;
        const top = (minutes / 60) * HOUR_HEIGHT;
        return { top: `${top}px` };
    };

    const currentTimeStyle = getCurrentTimeStyle();

    const getRoomColor = (roomId) => {
        const index = rooms.findIndex(r => r.id === roomId);
        return ROOM_COLORS[index % ROOM_COLORS.length] || ROOM_COLORS[0];
    };

    // --- Render ---
    return (
        // [MODIFIED] Root Div: Added desktop constraints (lg:max-w-7xl, lg:mx-auto, lg:my-8)
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 w-full lg:max-w-7xl lg:mx-auto lg:my-8">

            {/* Header (Responsive Layout) */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
                <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Weekly Calendar</h2>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {weekDays[4].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </div>

                {/* Controls: Stack on mobile, Row on Desktop */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center gap-3">
                    <select
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white w-full sm:w-auto"
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                    >
                        <option value="all">All Rooms</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <div className="flex items-center bg-white rounded-lg border border-slate-300 shadow-sm w-full sm:w-auto">
                        <button onClick={handleToday} className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-300">Today</button>
                        <button onClick={handlePrevWeek} className="flex-1 sm:flex-none px-4 py-2 text-slate-600 hover:bg-slate-50 border-r border-slate-300">‹ Prev</button>
                        <button onClick={handleNextWeek} className="flex-1 sm:flex-none px-4 py-2 text-slate-600 hover:bg-slate-50">Next ›</button>
                    </div>
                </div>
            </div>

            {/* Grid Container - Scrollable Area */}
            <div className="relative overflow-x-auto w-full">

                {/* Min-width for mobile scrolling */}
                <div className="min-w-[900px]">

                    {/* Days Header */}
                    <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-200 sticky top-0 bg-white z-40 shadow-sm">

                        {/* Sticky Time Corner */}
                        <div className="p-3 text-xs font-semibold text-slate-500 text-center border-r border-slate-100 bg-slate-50 sticky left-0 z-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Time
                        </div>

                        {weekDays.map((day) => {
                            const isToday = day.toDateString() === new Date().toDateString();
                            return (
                                <div key={day.toISOString()} className={`p-3 text-center border-r border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}>
                                    <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                                    <div className={`text-xl font-bold ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>{day.getDate()}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr]">

                        {/* Left Time Column - STICKY LEFT */}
                        <div className="border-r border-slate-100 bg-slate-50 select-none sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {timeSlots.map((hour) => (
                                <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="border-b border-slate-100 text-xs text-slate-400 flex items-start justify-center pt-1 relative bg-slate-50">

                                    {/* Background Stripes inside sticky column */}
                                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white -z-10"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-50 -z-10"></div>

                                    {/* XX:00 */}
                                    <span className="-mt-2.5 bg-transparent px-1 z-10">{hour.toString().padStart(2, '0')}:00</span>

                                    {/* XX:30 */}
                                    <span className="absolute top-1/2 -mt-2.5 bg-transparent px-1 z-10 text-[10px] text-slate-400">
                                        {hour.toString().padStart(2, '0')}:30
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Week Days Columns */}
                        {weekDays.map((day) => {
                            const offset = day.getTimezoneOffset();
                            const localDate = new Date(day.getTime() - (offset * 60 * 1000));
                            const dayStr = localDate.toISOString().split('T')[0];
                            const isToday = day.toDateString() === new Date().toDateString();
                            const dayBookingsWithLayout = getProcessedBookingsForDay(dayStr);

                            return (
                                <div key={day.toISOString()} className="relative border-r border-slate-100 min-h-[660px] group/col">

                                    {/* Grid Rows with Alternating Background */}
                                    {timeSlots.map((hour) => (
                                        <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="relative border-b border-slate-100">
                                            {/* Top Half White */}
                                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white"></div>
                                            {/* Bottom Half Gray */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-50"></div>
                                            {/* 30 Min Line */}
                                            <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-slate-200"></div>
                                        </div>
                                    ))}

                                    {/* Current Time Line */}
                                    {isToday && currentTimeStyle && (
                                        <div className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none" style={currentTimeStyle}>
                                            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                                        </div>
                                    )}

                                    {/* Booking Cards */}
                                    {dayBookingsWithLayout.map((booking) => {
                                        const colors = getRoomColor(booking.roomId);
                                        const style = getBookingStyle(booking);
                                        const roomName = rooms.find(r => r.id === booking.roomId)?.name;

                                        // Condition: <= 30 mins -> Compact View
                                        const duration = timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime);
                                        const isCompact = duration <= 30;

                                        return (
                                            <div
                                                key={booking.id}
                                                className={`group absolute rounded-md text-xs border shadow-sm transition-all duration-200 
                          cursor-pointer flex flex-col
                          ${colors.bg} ${colors.border} ${colors.text}
                          hover:!z-[100] hover:left-1 hover:w-[98%] hover:shadow-lg
                        `}
                                                style={style}
                                                onClick={() => onBookingClick && onBookingClick(booking)}
                                                title={`${booking.purpose} โดย ${booking.bookedBy} (${booking.startTime}-${booking.endTime})`}
                                            >

                                                {/* Side Handle (Right Top) */}
                                                <div className={`
                            absolute 
                            -right-2.5 top-2 h-6 w-3 
                            rounded-r-md border-r border-y border-l-0
                            flex items-center justify-center
                            transition-all duration-200
                            z-20
                            ${colors.bg} ${colors.border}
                            group-hover:w-4 group-hover:-right-3.5 group-hover:brightness-95
                        `}>
                                                    <div className="flex flex-col gap-0.5 opacity-40 scale-75">
                                                        <div className={`w-0.5 h-0.5 rounded-full ${colors.text}`}></div>
                                                        <div className={`w-0.5 h-0.5 rounded-full ${colors.text}`}></div>
                                                        <div className={`w-0.5 h-0.5 rounded-full ${colors.text}`}></div>
                                                    </div>
                                                </div>

                                                {/* White Border */}
                                                <div className="absolute inset-0 border border-white/50 rounded-md pointer-events-none"></div>

                                                {/* Content Container */}
                                                <div className={`p-1.5 h-full overflow-hidden relative z-10 flex ${isCompact ? 'flex-row items-center justify-between gap-1' : 'flex-col'}`}>

                                                    {/* Case 1: COMPACT VIEW (<= 30 mins) */}
                                                    {isCompact && (
                                                        <>
                                                            <span className="text-[9px] font-mono font-semibold opacity-90 whitespace-nowrap bg-white/40 px-1 rounded shrink-0">
                                                                {booking.startTime}-{booking.endTime}
                                                            </span>
                                                            <span className={`text-[9px] px-1 rounded-sm font-bold uppercase tracking-tight shrink-0 truncate ml-auto ${colors.badge}`}>
                                                                {roomName}
                                                            </span>
                                                        </>
                                                    )}

                                                    {/* Case 2: FULL VIEW (> 30 mins) */}
                                                    {!isCompact && (
                                                        <>
                                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                                <span className="text-[9px] font-mono font-semibold opacity-90 whitespace-nowrap bg-white/40 px-1 rounded shrink-0">
                                                                    {booking.startTime}-{booking.endTime}
                                                                </span>
                                                                <span className={`text-[9px] px-1 rounded-sm font-bold uppercase tracking-tight shrink-0 ${colors.badge}`}>
                                                                    {roomName}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-end justify-between gap-2 w-full">
                                                                <div className="font-bold text-[11px] leading-tight truncate min-w-0 flex-1">
                                                                    {booking.purpose}
                                                                </div>
                                                                <div className="text-[10px] opacity-80 whitespace-nowrap shrink-0 flex items-center gap-0.5">
                                                                    <span className="text-[8px]">👤</span>
                                                                    <span className="font-medium">{booking.bookedBy}</span>
                                                                </div>
                                                            </div>

                                                            {booking.department && (
                                                                <div className="text-[9px] opacity-60 text-right truncate mt-0.5">
                                                                    {booking.department}
                                                                </div>
                                                            )}

                                                            <div className="mt-auto pt-1 opacity-40">
                                                                <div className={`h-0.5 w-full rounded-full ${colors.dot}`}></div>
                                                            </div>
                                                        </>
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

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500 relative"><div className="absolute -left-0.5 -top-1 w-2.5 h-2.5 bg-red-500 rounded-full scale-50"></div></div>
                    <span>Current Time</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    {rooms.map(room => {
                        const color = getRoomColor(room.id);
                        return (
                            <div key={room.id} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color.dot}`}></div>
                                <span>{room.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
