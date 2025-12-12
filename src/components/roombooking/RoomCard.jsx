"use client";

import React from "react";
import Image from "next/image";
import { getRoomColor } from "@/utils/roomColors";
import {
    HiCalendarDays,
    HiMapPin,
    HiUsers,
    HiArrowRight,
    HiClock,
    HiUser
} from "react-icons/hi2";

const RoomCard = ({ room, upcomingBookings, onBookClick }) => {

    const color = getRoomColor(room.id);

    // ✅ เพิ่ม Logic กรองเฉพาะรายการที่ยังไม่หมดเวลา (Future & Ongoing)
    const filteredUpcomingBookings = upcomingBookings
        .filter((booking) => {
            if (!booking.date || !booking.endTime) return false;

            // สร้าง Date Object ของเวลาจบการจอง
            // หมายเหตุ: ต้องมั่นใจว่า format date เป็น "YYYY-MM-DD" และ endTime เป็น "HH:mm"
            const bookingEndDateTime = new Date(`${booking.date}T${booking.endTime}`);
            const now = new Date();

            // คืนค่า true เฉพาะถ้ายัังไม่ถึงเวลาจบ (endTime > now)
            return bookingEndDateTime > now;
        })
        .sort((a, b) => {
            // เรียงลำดับจาก ใกล้ที่สุด -> ไกลที่สุด
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
        });

    return (
        <div className={`
            group 
            bg-white 
            rounded-2xl 
            border border-gray-100 
            overflow-hidden 
            flex flex-col 
            transition-all duration-300 ease-in-out 
            hover:shadow-xl hover:shadow-gray-100
            hover:-translate-y-1
            relative
        `}>
            {/* Image Section */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                    <span className={`px-2.5 py-1 ${color.badge} ${color.text} text-[11px] font-bold uppercase tracking-wider rounded-md shadow-sm border border-white/20 backdrop-blur-sm`}>
                        {room.name}
                    </span>
                </div>

                {room.image || room.image_base64 || room.image_url ? (
                    <Image
                        src={room.image || room.image_base64 || room.image_url}
                        alt={room.name}
                        fill
                        className="
                            object-cover 
                            transition-transform duration-700 ease-out
                            group-hover:scale-105
                        "
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <span className="text-4xl mb-2">🏢</span>
                        <span className="text-xs uppercase font-bold tracking-widest">No Image</span>
                    </div>
                )}

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0095F6] transition-colors line-clamp-1">
                        {room.name}
                    </h3>
                </div>

                {/* Details Badges */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                        <HiUsers className="text-gray-400 w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold text-gray-600">Max {room.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                        <HiMapPin className="text-gray-400 w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold text-gray-600">{room.floor || "-"}</span>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="mb-5 flex-1 flex flex-col min-h-0">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 shrink-0">
                        <HiCalendarDays className="w-3.5 h-3.5" />
                        Upcoming Bookings
                    </h4>

                    {/* ✅ Scrollable List Container */}
                    <div className="
                        space-y-2 
                        max-h-[110px] 
                        overflow-y-auto 
                        pr-1 
                        /* Custom Scrollbar Styles */
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-gray-200
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    ">
                        {/* ✅ ใช้ filteredUpcomingBookings แทน upcomingBookings เดิม */}
                        {filteredUpcomingBookings.length > 0 ? (
                            filteredUpcomingBookings.map((booking) => (
                                <div key={booking.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group/booking">
                                    {/* Date Box */}
                                    <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-md w-10 h-10 shrink-0 group-hover/booking:bg-white group-hover/booking:shadow-sm transition-all">
                                        <span className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">
                                            {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800 leading-none">
                                            {new Date(booking.date).getDate()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-0.5">
                                            <HiClock className="text-[#0095F6] w-3 h-3" />
                                            <span>{booking.startTime} - {booking.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                                            <HiUser className="w-3 h-3" />
                                            <span>{booking.bookedBy}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-20 text-center border border-dashed border-gray-100 rounded-lg bg-gray-50/50">
                                <span className="text-xs text-gray-400 font-medium">No upcoming bookings</span>
                                <span className="text-[10px] text-[#0095F6] font-semibold mt-1">Available for booking</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onBookClick(room)}
                    className="
                        w-full py-2.5 
                        bg-[#0095F6] hover:bg-[#0085DE] 
                        text-white text-sm font-bold 
                        rounded-xl 
                        transition-all duration-200
                        shadow-sm hover:shadow-md hover:shadow-blue-200
                        flex items-center justify-center gap-2
                        group/btn
                        mt-auto
                        shrink-0
                    "
                >
                    Book This Room
                    <HiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default RoomCard;