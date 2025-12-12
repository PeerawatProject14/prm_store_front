"use client";

import React, { useState } from "react";
import RoomCard from "./RoomCard";
import CreateBookingModal from "./CreateBookingModal";
import BookingModal from "./BookingModal";

const ListingView = ({
    rooms,
    bookings,
    onBookingConfirmed,
    onCancel,      // ✅ [UPDATE] เปลี่ยนชื่อให้ตรงกับ page.js
    isAdmin,       // ✅ [UPDATE] รับค่า isAdmin มาจาก page.js
    currentUser
}) => {
    // State สำหรับการจองใหม่ (Create)
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // State สำหรับดู/ยกเลิกการจองเดิม (View/Cancel)
    const [viewingBooking, setViewingBooking] = useState(null);

    // --- Create Handler ---
    const handleBookClick = (room) => {
        setSelectedRoom(room);
        setIsCreateModalOpen(true);
    };

    const handleConfirmBooking = (bookingDataArray) => {
        onBookingConfirmed(bookingDataArray);
        setIsCreateModalOpen(false);
    };

    // --- View/Cancel Handler ---
    const handleBookingClick = (booking, roomId) => {
        const room = rooms.find(r => r.id === roomId);
        setViewingBooking({
            ...booking,
            roomName: room?.name,
            roomImage: room?.image,
            roomFloor: room?.floor
        });
    };

    const handleCancelBooking = (bookingId) => {
        // ✅ เรียกใช้ onCancel ที่ส่งมาจาก page.js
        if (onCancel) {
            onCancel(bookingId);
        }
        setViewingBooking(null);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-800">Room Booking</h2>
                    <p className="text-slate-500 mt-2">
                        เลือกห้องประชุมที่ต้องการเพื่อทำการจอง หรือดูตารางเวลา
                    </p>
                </div>

                {/* Room Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pb-10">
                    {rooms.map((room) => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            // ส่งรายการจองของห้องนี้
                            upcomingBookings={bookings
                                .filter((b) => b.roomId === room.id && b.status !== 'cancelled') // กรอง cancelled ออก
                                .sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime))
                            }
                            // Handler สำหรับการจองห้องใหม่
                            onBookClick={handleBookClick}
                            // Handler เมื่อคลิกที่รายการจองเล็กๆ (เพื่อดู/ลบ)
                            onBookingItemClick={(booking) => handleBookingClick(booking, room.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Modal 1: สำหรับสร้างการจองใหม่ */}
            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                room={selectedRoom}
                existingBookings={bookings}
                onConfirm={handleConfirmBooking}
            />

            {/* Modal 2: สำหรับดูรายละเอียดและยกเลิก */}
            <BookingModal
                isOpen={!!viewingBooking}
                onClose={() => setViewingBooking(null)}
                booking={viewingBooking}

                // ✅ [FIX] ต้องส่งข้อมูลห้องแยกเข้าไปด้วยครับ ภาพถึงจะมา
                roomName={viewingBooking?.roomName}
                roomImage={viewingBooking?.roomImage}
                roomFloor={viewingBooking?.roomFloor}

                currentUser={currentUser}
                isAdmin={isAdmin}
                onCancel={() => handleCancelBooking(viewingBooking.id)}
            />
        </div>
    );
};

export default ListingView;