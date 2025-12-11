"use client";

import React, { useState } from "react";
import RoomCard from "./RoomCard";
import CreateBookingModal from "./CreateBookingModal";

const ListingView = ({ rooms, bookings, onBookingConfirmed }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBookClick = (room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const handleConfirmBooking = (bookingDataArray) => {
        // ส่งข้อมูลกลับไปให้ Parent (index.jsx) จัดการต่อ
        onBookingConfirmed(bookingDataArray);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-800">Room Booking</h2>
                    <p className="text-slate-500 mt-2">
                        Select office spaces and check their availability status
                    </p>
                </div>

                {/* Room Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pb-10">
                    {rooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            // ❌ ลบ index={index} ออก เพราะ RoomCard ใช้ ID คำนวณสีเองแล้ว

                            upcomingBookings={bookings
                                .filter((b) => b.roomId === room.id)
                                .sort(
                                    (a, b) =>
                                        new Date(a.date).getTime() - new Date(b.date).getTime()
                                )} // เรียงตามเวลา (เก่า -> ใหม่)
                            onBookClick={handleBookClick}
                        />
                    ))}
                </div>
            </div>

            <CreateBookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={selectedRoom}
                existingBookings={bookings}
                onConfirm={handleConfirmBooking}
            />
        </div>
    );
};

export default ListingView;