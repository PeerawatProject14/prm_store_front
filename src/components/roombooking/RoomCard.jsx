"use client";

import React from "react";
import Image from "next/image";

const RoomCard = ({ room, upcomingBookings, onBookClick }) => {
    return (
        <div className="
            group 
            bg-white 
            rounded-xl 
            shadow-sm 
            border border-slate-200 
            overflow-hidden 
            flex flex-col 
            transition-all duration-300 ease-in-out 
            hover:shadow-2xl 
            hover:-translate-y-2
        ">
            {/* Image Section */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <div className="absolute top-3 left-3 z-10">
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-md shadow-sm">
                        {room.type}
                    </span>
                </div>
                {/* <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm">
                        ฿{room.pricePerHour}/hr
                    </span>
                </div> */}

                {/* Placeholder for image if not provided */}
                {room.image ? (
                    <Image
                        src={room.image}
                        alt={room.name}
                        fill
                        className="
                            object-cover 
                            transition-transform duration-500 ease-in-out 
                            group-hover:scale-110
                        "
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {room.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4">{room.floor} - {room.type} Room</p>

                {/* Details */}
                <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>Up to {room.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{room.floor}</span>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="mb-4 flex-1">
                    <h4 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1">
                        <span>📅</span> Upcoming Bookings
                    </h4>
                    <div className="space-y-2 max-h-24 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {upcomingBookings.length > 0 ? (
                            upcomingBookings.map((booking) => (
                                <div key={booking.id} className="bg-slate-50 p-2 rounded-md border border-slate-100 text-xs">
                                    <div className="flex justify-between text-slate-700 font-medium">
                                        <span>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        <span>{booking.startTime}-{booking.endTime}</span>
                                    </div>
                                    <div className="text-slate-500 truncate mt-0.5">{booking.bookedBy}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-slate-400 italic">No upcoming bookings</div>
                        )}
                    </div>
                </div>

                {/* Action */}
                <button
                    onClick={() => onBookClick(room)}
                    className="
                        w-full py-2.5 
                        bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
                        hover:opacity-90 
                        text-white text-sm font-semibold 
                        rounded-lg 
                        transition-all 
                        shadow-md 
                        flex items-center justify-center gap-2
                        active:scale-95
                    "
                >
                    <span>📅</span>
                    Book This Room
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
