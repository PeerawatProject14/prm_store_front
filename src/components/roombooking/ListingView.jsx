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
        const newBookings = bookingDataArray.map((data, index) => ({
            id: `b-${Date.now()}-${index}`,
            title: rooms.find((r) => r.id === data.roomId)?.name || "Booking",
            department: "N/A",
            ...data,
        }));

        onBookingConfirmed(newBookings);
        alert("Booking Confirmed!");
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Hero / Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 py-8 md:py-12 px-4 md:px-6 text-center text-white flex-shrink-0">
                <h1 className="text-xl md:text-3xl font-bold mb-2">
                    Piramid Solutions Perfect Office Space
                </h1>
                <p className="text-blue-100 text-sm md:text-lg">Office Space</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-800">Room Booking</h2>
                    <p className="text-slate-500 mt-2">
                        Select from our premium office spaces and check their availability status
                    </p>
                </div>

                {/* Room Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pb-10">
                    {rooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            // -----------------------------------------------------------
                            // จุดที่แก้ไข: ลบเงื่อนไขเช็ควันที่ >= ปัจจุบันออก เพื่อให้แสดงประวัติด้วย
                            // -----------------------------------------------------------
                            upcomingBookings={bookings
                                .filter((b) => b.roomId === room.id) // เอาเฉพาะของห้องนี้ (ทั้งอดีตและอนาคต)
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
