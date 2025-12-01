"use client";

import React from "react";

const Timeline = ({ rooms, bookings, onBookingClick }) => {
    // Time configuration
    const startHour = 8;
    const endHour = 19; // Go until 19:00 to show 18:00-19:00 block
    const totalHours = endHour - startHour;
    const slotWidth = 100; // Width of a 30-min slot in pixels
    const hourWidth = slotWidth * 2;
    const totalWidth = totalHours * hourWidth;

    // Generate time slots (30 min intervals)
    const timeSlots = [];
    for (let h = startHour; h < endHour; h++) {
        timeSlots.push({ time: `${h.toString().padStart(2, "0")}:00`, label: `${h.toString().padStart(2, "0")}:00` });
        timeSlots.push({ time: `${h.toString().padStart(2, "0")}:30`, label: "" }); // 30 min marker
    }

    // Helper to calculate position and width
    const getBookingStyle = (booking) => {
        const [startH, startM] = booking.startTime.split(":").map(Number);
        const [endH, endM] = booking.endTime.split(":").map(Number);

        const startMinutes = (startH - startHour) * 60 + startM;
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

        const left = (startMinutes / 60) * hourWidth;
        const width = (durationMinutes / 60) * hourWidth;

        return {
            left: `${left}px`,
            width: `${width}px`,
        };
    };

    return (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header (Time) */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                {/* Corner */}
                <div className="w-48 flex-shrink-0 border-r border-slate-200 p-4 font-semibold text-slate-700 bg-slate-100 z-10 sticky left-0">
                    Rooms
                </div>

                {/* Time Track */}
                <div className="flex-1 overflow-x-auto hide-scrollbar" style={{ overflowX: 'auto' }}>
                    <div className="flex" style={{ width: `${totalWidth}px` }}>
                        {timeSlots.map((slot, index) => (
                            <div
                                key={index}
                                className={`flex-shrink-0 h-10 flex items-center justify-start pl-1 text-xs text-slate-500 border-r border-slate-100 ${index % 2 === 0 ? "bg-slate-50 font-medium" : "bg-slate-50/50"
                                    }`}
                                style={{ width: `${slotWidth}px` }}
                            >
                                {slot.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body (Rooms & Bookings) */}
            <div className="flex-1 overflow-y-auto overflow-x-auto relative">
                <div style={{ width: `calc(12rem + ${totalWidth}px)` }}> {/* Total width = sidebar + time track */}
                    {rooms.map((room) => (
                        <div key={room.id} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            {/* Room Name (Sticky Left) */}
                            <div className="w-48 flex-shrink-0 border-r border-slate-200 p-4 flex flex-col justify-center bg-white sticky left-0 z-10">
                                <div className="text-sm font-semibold text-blue-600">{room.name}</div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <span>👥 {room.capacity}</span>
                                    <span>• {room.floor}</span>
                                </div>
                            </div>

                            {/* Booking Track */}
                            <div className="relative h-24 bg-white" style={{ width: `${totalWidth}px` }}>
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {timeSlots.map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 h-full border-r border-slate-100 border-dashed"
                                            style={{ width: `${slotWidth}px` }}
                                        />
                                    ))}
                                </div>

                                {/* Bookings */}
                                {bookings
                                    .filter((b) => b.roomId === room.id)
                                    .map((booking) => (
                                        <div
                                            key={booking.id}
                                            onClick={() => onBookingClick(booking)}
                                            className="absolute top-2 bottom-2 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all shadow-sm hover:shadow-md overflow-hidden group"
                                            style={getBookingStyle(booking)}
                                        >
                                            <div className="h-full w-1 bg-blue-500 absolute left-0 top-0 bottom-0"></div>
                                            <div className="p-2 pl-3 h-full flex flex-col justify-center">
                                                <div className="text-xs font-bold text-blue-700 truncate">{booking.title}</div>
                                                <div className="text-[10px] text-blue-600 truncate flex items-center gap-1">
                                                    <span>🕒 {booking.startTime}-{booking.endTime}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                                    👤 {booking.bookedBy}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
