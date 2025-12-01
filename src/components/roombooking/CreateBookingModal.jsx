"use client";

import React, { useState, useEffect } from "react";

const CreateBookingModal = ({
    isOpen,
    onClose,
    room,
    existingBookings,
    onConfirm,
}) => {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [attendees, setAttendees] = useState("");
    const [name, setName] = useState("");
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
            setName("");
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

    // --- Helpers ---
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
        const selectedDate = new Date(date);
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
        if (!date || !startTime || !endTime || !name) {
            setError("Please fill in all required fields.");
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
                const startH = parseInt(chunk.start.split(':')[0]) + parseInt(chunk.start.split(':')[1]) / 60;
                const endH = parseInt(chunk.end.split(':')[0]) + parseInt(chunk.end.split(':')[1]) / 60;
                const duration = endH - startH;

                return {
                    roomId: room.id,
                    date,
                    startTime: chunk.start,
                    endTime: chunk.end,
                    attendees: parseInt(attendees) || 0,
                    bookedBy: name,
                    purpose: bookingChunks.length > 1 ? `${purpose} (Part)` : purpose,
                    status: "confirmed",
                    cost: Math.round(room.pricePerHour * duration),
                };
            });

            onConfirm(newBookings);
            onClose();
        }
    };

    const availableEndTimes = timeSlots.filter(t => t > startTime);

    // CSS Class สำหรับ Scrollbar โค้งมน (Reusable)
    const scrollbarStyles = "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden ${scrollbarStyles}`}>

                {/* Left Side (Room Info) */}
                <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Book {room.name}</h3>
                    <div className="relative w-full aspect-video bg-slate-200 rounded-lg mb-4 overflow-hidden shadow-sm shrink-0">
                        {room.image ? <img src={room.image} alt={room.name} className="w-full h-full object-cover" /> : null}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-6 shrink-0">
                        <div className="flex items-center gap-2"><span className="text-slate-400">👥</span> <span>Capacity: {room.capacity} people</span></div>
                    </div>

                    <div className="mb-6 shrink-0">
                        <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Amenities</h4>
                        <div className="flex flex-wrap gap-2">{room.amenities.map(a => (<span key={a} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600 shadow-sm">{a}</span>))}</div>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col">
                        <h4 className="text-sm font-bold text-red-500 mb-3 shrink-0">Today booked</h4>
                        {date && (
                            <div className={`space-y-2 pr-2 overflow-y-auto max-h-[160px] ${scrollbarStyles}`}>
                                {todayBookings.length > 0 ? todayBookings.map(b => (
                                    <div key={b.id} className="bg-red-50 border border-red-100 p-3 rounded-md shrink-0">
                                        <div className="flex justify-between text-red-700 font-semibold text-xs mb-1">
                                            <span>{b.startTime} - {b.endTime}</span>
                                            <span>{b.bookedBy}</span>
                                        </div>
                                        <div className="text-[10px] text-red-500 truncate">{b.purpose}</div>
                                    </div>
                                )) : <div className="text-xs text-slate-400 italic">No bookings for this date yet.</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className={`w-full md:w-2/3 p-8 md:overflow-y-auto ${scrollbarStyles}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Booking Details</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2 animate-pulse">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {bookingChunks.length > 1 && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm shadow-sm">
                            <div className="font-bold flex items-center gap-2 mb-2">
                                <span>ℹ️</span> Split Booking Detected
                            </div>
                            <p className="mb-2 text-xs opacity-80">This range overlaps with existing bookings. We will split it into {bookingChunks.length} slots:</p>
                            <div className="flex flex-wrap gap-2">
                                {bookingChunks.map((chunk, idx) => (
                                    <span key={idx} className="bg-white border border-blue-200 px-2 py-1 rounded text-xs font-semibold text-blue-600">
                                        {chunk.start} - {chunk.end}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => { setDate(e.target.value); setStartTime(""); setEndTime(""); }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white appearance-none"
                                        value={startTime}
                                        onChange={(e) => { setStartTime(e.target.value); setEndTime(""); setError(""); }}
                                        disabled={!date}
                                    >
                                        <option value="">Start</option>
                                        {timeSlots.map(time => {
                                            const booked = isSlotBooked(time);
                                            const past = isPast(time);
                                            return (
                                                <option key={time} value={time} disabled={booked || past} className={booked || past ? "text-red-400 bg-red-50" : ""}>
                                                    {time} {booked ? "(Booked)" : past ? "(Past)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white appearance-none"
                                        value={endTime}
                                        onChange={(e) => { setEndTime(e.target.value); setError(""); }}
                                        disabled={!startTime}
                                    >
                                        <option value="">End</option>
                                        {availableEndTimes.map(time => {
                                            const isInsideBooking = todayBookings.some(b => time > b.startTime && time <= b.endTime);
                                            return (
                                                <option key={time} value={time} disabled={isInsideBooking} className={isInsideBooking ? "text-red-400 bg-red-50" : ""}>
                                                    {time} {isInsideBooking ? "(Booked)" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Attendees</label>
                            <input type="number" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                                value={attendees} onChange={(e) => setAttendees(e.target.value)} max={room.capacity} placeholder={`Max ${room.capacity}`} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                            <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                                value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose</label>
                            <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none"
                                value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Meeting purpose" />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={handleSubmit}
                            disabled={bookingChunks.length === 0}
                            className={`w-full py-3 text-white font-bold rounded-lg transition-all shadow-md 
                                ${bookingChunks.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5'}
                            `}
                        >
                            {bookingChunks.length > 1 ? `Confirm ${bookingChunks.length} Bookings` : "Confirm Booking"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBookingModal;
