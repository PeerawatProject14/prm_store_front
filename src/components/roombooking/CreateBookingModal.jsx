"use client";

import React, { useState, useEffect } from "react";
import {
    HiXMark,
    HiCalendarDays,
    HiClock,
    HiUser,
    HiUsers,
    HiMapPin,
    HiInformationCircle,
    HiExclamationTriangle,
    HiCheck,
    HiLockClosed
} from "react-icons/hi2";

const CreateBookingModal = ({
    isOpen,
    onClose,
    room,
    existingBookings,
    onConfirm,
    currentUser = { name: "Admin Test", role: "Admin" } // ✅ รับ Prop ข้อมูล user (Mock ไว้ก่อน)
}) => {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [attendees, setAttendees] = useState("");
    // const [name, setName] = useState(""); // ❌ ไม่ต้องใช้ State เปลี่ยนชื่อแล้ว
    const [purpose, setPurpose] = useState("");
    const [error, setError] = useState("");
    const [bookingChunks, setBookingChunks] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setStartTime("");
            setEndTime("");
            setAttendees("");
            // setName(""); // ❌ ไม่ต้อง Reset ชื่อ
            setPurpose("");
            setError("");
            setBookingChunks([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (date && startTime && endTime) {
            const chunks = calculateBookingChunks(startTime, endTime);
            setBookingChunks(chunks);
        } else {
            setBookingChunks([]);
        }
    }, [date, startTime, endTime]);

    if (!isOpen || !room) return null;

    // --- Helpers (Time Slots & Logic) ---
    const generateTimeSlots = () => {
        const slots = [];
        let h = 8;
        let m = 30;
        while (h <= 17 || (h === 17 && m === 0)) {
            slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
            m += 30;
            if (m >= 60) { h++; m = 0; }
        }
        return slots;
    };
    const timeSlots = generateTimeSlots();

    const todayBookings = existingBookings
        .filter((b) => b.roomId === room.id && b.date === date && b.status !== "cancelled")
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const isPast = (time) => {
        if (!date) return false;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        if (date < todayStr) return true;
        if (date === todayStr) {
            const [h, m] = time.split(":").map(Number);
            const currentH = now.getHours();
            const currentM = now.getMinutes();
            if (h < currentH || (h === currentH && m < currentM)) return true;
        }
        return false;
    };

    const isSlotBooked = (time) => {
        return todayBookings.some((b) => time >= b.startTime && time < b.endTime);
    };

    const calculateBookingChunks = (start, end) => {
        const chunks = [];
        const timeToNum = (t) => parseInt(t.split(':')[0]) + parseInt(t.split(':')[1]) / 60;
        const numToTime = (n) => {
            const h = Math.floor(n);
            const m = Math.round((n - h) * 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        let cursor = timeToNum(start);
        const targetEnd = timeToNum(end);
        let segmentStart = -1;

        while (cursor < targetEnd) {
            const currentTimeStr = numToTime(cursor);
            const isBlocked = isSlotBooked(currentTimeStr);

            if (!isBlocked) {
                if (segmentStart === -1) segmentStart = cursor;
            } else {
                if (segmentStart !== -1) {
                    chunks.push({ start: numToTime(segmentStart), end: currentTimeStr });
                    segmentStart = -1;
                }
            }
            cursor += 0.5;
        }
        if (segmentStart !== -1) {
            chunks.push({ start: numToTime(segmentStart), end: end });
        }
        return chunks;
    };

    const validateBooking = () => {
        setError("");

        if (!date || !startTime || !endTime || !purpose.trim() || !attendees) {
            setError("Please fill in all required fields.");
            return false;
        }

        const numAttendees = parseInt(attendees, 10);
        if (isNaN(numAttendees) || numAttendees <= 0) {
            setError("Please enter a valid number of attendees.");
            return false;
        }

        if (numAttendees > room.capacity) {
            setError(`Number of attendees cannot exceed room capacity (${room.capacity}).`);
            return false;
        }

        if (bookingChunks.length === 0) {
            setError("Selected time is fully booked.");
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateBooking()) {
            const newBookings = bookingChunks.map(chunk => {
                return {
                    roomId: room.id,
                    date,
                    startTime: chunk.start,
                    endTime: chunk.end,
                    attendees: parseInt(attendees),
                    bookedBy: currentUser?.name || "Unknown", // ✅ ใช้ชื่อจาก currentUser
                    purpose: bookingChunks.length > 1 ? `${purpose} (Part)` : purpose,
                    status: "confirmed",
                    cost: 0,
                };
            });

            onConfirm(newBookings);
            onClose();
        }
    };

    const availableEndTimes = timeSlots.filter(t => t > startTime);

    // --- Shared Scrollbar Styles ---
    const scrollbarStyles = `
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
    `;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* ✅ Wrapper Layout Fix */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden border border-gray-100">

                {/* --- Left Side (Room Info & Schedule) --- */}
                {/* ✅ Added scrollbarStyles to parent container */}
                <div className={`w-full md:w-[35%] bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col shrink-0 md:overflow-y-auto ${scrollbarStyles}`}>

                    {/* Header Mobile Only */}
                    <div className="md:hidden flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <HiCalendarDays className="text-[#0095F6]" />
                            New Booking
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full border border-gray-200">
                            <HiXMark size={20} />
                        </button>
                    </div>

                    {/* Desktop Header Title */}
                    <h3 className="hidden md:flex text-lg font-bold text-gray-800 mb-4 items-center gap-2">
                        <HiCalendarDays className="text-[#0095F6]" />
                        New Booking
                    </h3>

                    {/* Room Image Card */}
                    <div className="relative w-full aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-sm mb-5 shrink-0 group">
                        {room.image ? (
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                            <div>
                                <h4 className="text-white font-bold text-lg leading-none">{room.name}</h4>
                                <div className="flex items-center gap-2 text-white/90 text-xs mt-1">
                                    <span className="flex items-center gap-1"><HiMapPin /> {room.floor || "-"}</span>
                                    <span className="flex items-center gap-1"><HiUsers /> {room.capacity}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {room.amenities && room.amenities.length > 0 ? (
                                room.amenities.map((a, index) => (
                                    <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-medium text-gray-600 shadow-sm">
                                        {a}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 italic">No amenities listed</span>
                            )}
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="flex flex-col md:flex-1 md:min-h-0">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today's Schedule</h4>
                            {date && <span className="text-[10px] text-gray-400 font-mono">{date}</span>}
                        </div>

                        {date && (
                            // ✅ Scrollbar Applied Here specifically for the list
                            <div className={`
                                max-h-[125px] md:max-h-none md:flex-1 
                                overflow-y-auto 
                                pr-1 
                                space-y-2 
                                ${scrollbarStyles}
                            `}>
                                {todayBookings.length > 0 ? todayBookings.map(b => (
                                    <div key={b.id} className="relative pl-3 border-l-2 border-red-200 py-1">
                                        <div className="text-xs font-bold text-gray-700">{b.startTime} - {b.endTime}</div>
                                        <div className="text-[11px] text-gray-500 truncate">{b.purpose}</div>
                                        <div className="text-[10px] text-gray-400">by {b.bookedBy}</div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 bg-white border border-dashed border-gray-200 rounded-lg">
                                        <p className="text-xs text-gray-400">No bookings yet.</p>
                                        <p className="text-[10px] text-[#0095F6] mt-1">Be the first to book!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right Side (Form) --- */}
                {/* ✅ Added scrollbarStyles to parent container */}
                <div className={`w-full md:w-[65%] p-6 md:p-8 flex flex-col h-full bg-white md:overflow-y-auto ${scrollbarStyles}`}>

                    {/* Desktop Close Button */}
                    <div className="hidden md:flex justify-between items-start mb-6 shrink-0">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                            <p className="text-sm text-gray-500">Please fill in the information below.</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                            <HiXMark size={24} />
                        </button>
                    </div>

                    {/* Mobile Title */}
                    <div className="md:hidden mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                        <p className="text-xs text-gray-500">Please fill in the information below.</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <HiExclamationTriangle className="text-red-500 shrink-0" size={20} />
                            <span className="text-sm text-red-600 font-medium">{error}</span>
                        </div>
                    )}

                    {/* Chunking Alert */}
                    {bookingChunks.length > 1 && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <HiInformationCircle className="text-[#0095F6]" size={20} />
                                <span className="text-sm font-bold text-blue-900">Split Booking Detected</span>
                            </div>
                            <p className="text-xs text-blue-700 mb-3 leading-relaxed">
                                The selected time range overlaps with existing bookings. We will split your booking into <strong>{bookingChunks.length} separate slots</strong>:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {bookingChunks.map((chunk, idx) => (
                                    <span key={idx} className="bg-white border border-blue-200 px-2.5 py-1 rounded text-xs font-bold text-[#0095F6] shadow-sm flex items-center gap-1">
                                        <HiClock size={12} /> {chunk.start} - {chunk.end}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-5">
                        {/* Row 1: Date & Name (Locked) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                    Select Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] outline-none transition-all"
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => { setDate(e.target.value); setStartTime(""); setEndTime(""); }}
                                    />
                                    <HiCalendarDays className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Locked Name Input */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                    Booked By <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={currentUser?.name || "Unknown"}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none"
                                    />
                                    <HiUser className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" size={16} />
                                    <HiLockClosed className="absolute right-3 top-3 text-gray-400" size={14} />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <HiInformationCircle /> Using account name
                                </p>
                            </div>
                        </div>

                        {/* Row 2: Time Slots */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Start Time <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] outline-none appearance-none cursor-pointer"
                                        value={startTime}
                                        onChange={(e) => { setStartTime(e.target.value); setEndTime(""); setError(""); }}
                                        disabled={!date}
                                    >
                                        <option value="">Select Start</option>
                                        {timeSlots.map(time => {
                                            const booked = isSlotBooked(time);
                                            const past = isPast(time);
                                            return (
                                                <option key={time} value={time} disabled={booked || past} className={booked || past ? "text-gray-300 bg-gray-50" : ""}>
                                                    {time} {booked ? "(Booked)" : past ? "(Past)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <HiClock className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" size={16} />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">End Time <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] outline-none appearance-none cursor-pointer"
                                        value={endTime}
                                        onChange={(e) => { setEndTime(e.target.value); setError(""); }}
                                        disabled={!startTime}
                                    >
                                        <option value="">Select End</option>
                                        {availableEndTimes.map(time => {
                                            const isInsideBooking = todayBookings.some(b => time > b.startTime && time <= b.endTime);
                                            return (
                                                <option key={time} value={time} disabled={isInsideBooking} className={isInsideBooking ? "text-gray-300 bg-gray-50" : ""}>
                                                    {time} {isInsideBooking ? "(Overlap)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <HiClock className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" size={16} />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Attendees & Purpose */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                    Attendees <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg text-sm text-gray-700 outline-none transition-all
                                            ${parseInt(attendees) > room.capacity ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:bg-white focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6]'}
                                        `}
                                        value={attendees}
                                        onChange={(e) => setAttendees(e.target.value)}
                                        min="1"
                                        max={room.capacity}
                                        placeholder="0"
                                    />
                                    <HiUsers className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                {parseInt(attendees) > room.capacity && (
                                    <p className="text-[10px] text-red-500 mt-1 font-medium">Max capacity: {room.capacity}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Purpose <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:border-[#0095F6] focus:ring-1 focus:ring-[#0095F6] outline-none transition-all placeholder:text-gray-400"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    placeholder="e.g. Weekly Team Sync"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer / Submit */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={bookingChunks.length === 0}
                            className={`px-6 py-2.5 text-white font-bold text-sm rounded-lg shadow-sm flex items-center gap-2 transition-all
                                ${bookingChunks.length === 0
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-[#0095F6] hover:bg-[#0085DE] hover:shadow-md active:scale-95'
                                }
                            `}
                        >
                            <HiCheck size={18} />
                            {bookingChunks.length > 1 ? `Confirm ${bookingChunks.length} Slots` : "Confirm Booking"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBookingModal;