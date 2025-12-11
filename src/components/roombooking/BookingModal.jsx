"use client";

import React from "react";
import {
    HiXMark,
    HiCalendarDays,
    HiClock,
    HiUser,
    HiUsers,
    HiMapPin,
    HiBuildingOffice2,
    HiCheckCircle,
    HiExclamationCircle,
    HiXCircle
} from "react-icons/hi2";

const BookingModal = ({
    isOpen,
    onClose,
    booking,
    roomName,
    roomImage,
    roomFloor
}) => {
    if (!isOpen || !booking) return null;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    // Helper สำหรับเลือกสี Status Badge ให้ตรงกับธีมหลัก
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return { bg: 'bg-green-50', text: 'text-[#34C759]', border: 'border-green-100', icon: <HiCheckCircle className="w-4 h-4" /> };
            case 'pending':
                return { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100', icon: <HiExclamationCircle className="w-4 h-4" /> };
            case 'cancelled':
                return { bg: 'bg-red-50', text: 'text-[#ED4956]', border: 'border-red-100', icon: <HiXCircle className="w-4 h-4" /> };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', icon: <HiCheckCircle className="w-4 h-4" /> };
        }
    };

    const statusStyle = getStatusStyle(booking.status);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full mx-4 md:mx-0 md:max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

                {/* --- 1. Header Image Section --- */}
                <div className="w-full h-48 relative shrink-0 bg-gray-100 group">
                    {roomImage ? (
                        <>
                            <img
                                src={roomImage}
                                alt={roomName || "Room"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                            <HiBuildingOffice2 size={48} />
                            <span className="text-xs font-medium mt-2 uppercase tracking-widest">No Room Image</span>
                        </div>
                    )}

                    {/* Room Info Overlay */}
                    <div className="absolute bottom-5 left-6 right-6 text-white">
                        <div className="flex flex-col items-start gap-1.5">
                            <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm leading-none">
                                {roomName || "Meeting Room"}
                            </h3>
                            {roomFloor && (
                                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/30 text-xs font-semibold shadow-sm">
                                    <HiMapPin className="w-3.5 h-3.5" />
                                    <span>{roomFloor}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Close Button (Floating) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2 transition-all shadow-sm border border-white/20"
                    >
                        <HiXMark size={20} />
                    </button>
                </div>

                {/* --- 2. Content Body --- */}
                <div className="p-6 overflow-y-auto custom-scrollbar pb-8"> {/* เพิ่ม padding-bottom หน่อยเพื่อให้ดูสวยงามเมื่อไม่มี footer */}

                    {/* Purpose Section */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Meeting Purpose
                        </label>
                        <div className="text-lg font-bold text-gray-900 leading-snug">
                            {booking.purpose}
                        </div>
                    </div>

                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">

                        {/* Booked By */}
                        <div className="col-span-2">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0095F6] mt-0.5">
                                    <HiUser size={16} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Booked By</label>
                                    <div className="text-sm font-semibold text-gray-800">{booking.bookedBy}</div>
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 mt-0.5">
                                    <HiCalendarDays size={16} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date</label>
                                    <div className="text-sm font-medium text-gray-700">{formatDate(booking.date)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 mt-0.5">
                                    <HiClock size={16} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Time</label>
                                    <div className="text-sm font-medium text-gray-700 font-mono tracking-tight">
                                        {booking.startTime} - {booking.endTime}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendees & Status Row */}
                        <div className="col-span-2 flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <HiUsers className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{booking.attendees || "0"} Attendees</span>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                {statusStyle.icon}
                                <span className="capitalize">{booking.status}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;