"use client";

import React, { useState } from "react";
import RoomCard from "./RoomCard";
import CreateBookingModal from "./CreateBookingModal";
import BookingModal from "./BookingModal"; // [NEW] Import Modal ที่เราเพิ่งแก้ไป

const ListingView = ({
    rooms,
    bookings,
    onBookingConfirmed,
    onBookingCancelled, // [NEW] รับฟังก์ชันลบ Booking จาก Parent
    currentUser         // [NEW] รับข้อมูล User ปัจจุบันเพื่อเช็คสิทธิ์ Cancel
}) => {
    // State สำหรับการจองใหม่ (Create)
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // [NEW] State สำหรับดู/ยกเลิกการจองเดิม (View/Cancel)
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

    // --- [NEW] View/Cancel Handler ---
    const handleBookingClick = (booking, roomId) => {
        // หาข้อมูลห้องเพื่อนำไปแสดงใน Modal สวยๆ
        const room = rooms.find(r => r.id === roomId);

        // เซ็ตข้อมูล Booking ที่จะดู พร้อมแนบข้อมูลห้องไปด้วย
        setViewingBooking({
            ...booking,
            roomName: room?.name,
            roomImage: room?.image,
            roomFloor: room?.floor
        });
    };

    const handleCancelBooking = (booking) => {
        // ส่งต่อไปยัง Parent เพื่อลบข้อมูลจริง
        if (onBookingCancelled) {
            onBookingCancelled(booking);
        }
        setViewingBooking(null); // ปิด Modal
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

                            // ส่งรายการจองของห้องนี้
                            upcomingBookings={bookings
                                .filter((b) => b.roomId === room.id)
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            }

                            // Handler สำหรับการจองห้องใหม่
                            onBookClick={handleBookClick}

                            // [NEW] Handler เมื่อคลิกที่รายการจองเล็กๆ ในการ์ด (เพื่อดูรายละเอียด/ลบ)
                            // ** คุณต้องไปแก้ RoomCard ให้ส่ง event นี้ออกมาด้วยนะครับ **
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

            {/* Modal 2: [NEW] สำหรับดูรายละเอียดและยกเลิก */}
            <BookingModal
                isOpen={!!viewingBooking}
                onClose={() => setViewingBooking(null)}
                booking={viewingBooking}
                roomName={viewingBooking?.roomName}
                roomImage={viewingBooking?.roomImage}
                roomFloor={viewingBooking?.roomFloor}
                currentUser={currentUser}       // ส่ง User ไปเช็คสิทธิ์
                onCancel={handleCancelBooking}  // ส่งฟังก์ชัน Cancel
            />
        </div>
    );
};

export default ListingView;