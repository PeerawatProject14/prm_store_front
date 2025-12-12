"use client";

import React, { useState } from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import BookingModal from "./BookingModal";
import CreateBookingModal from "./CreateBookingModal";

const CalendarView = ({
    rooms,
    bookings,
    onBookingConfirmed,
    currentUser,
    onBookingCancelled,
    onViewChange // ✅ 1. รับฟังก์ชันเปลี่ยนหน้าเข้ามา
}) => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [roomToBook, setRoomToBook] = useState(null);

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
    };

    // Helper: Find room by ID (Robust String Comparison)
    const getRoom = (roomId) => {
        if (!roomId) return null;
        return rooms.find((r) => String(r.id) === String(roomId));
    };

    // Handler: Click "Book This Room" from Detail Modal
    const handleBookRoom = (roomId) => {
        const room = getRoom(roomId);

        if (room) {
            setRoomToBook(room);
            setIsDetailModalOpen(false);

            // Small delay to ensure state updates smoothly
            setTimeout(() => {
                setIsCreateModalOpen(true);
            }, 100);
        } else {
            console.error("Room NOT found for ID:", roomId);
            alert("Error: Could not find room details.");
        }
    };

    const handleConfirmBooking = (newBookings) => {
        if (onBookingConfirmed) {
            onBookingConfirmed(newBookings);
        }
        setIsCreateModalOpen(false);
    };

    // Handler Wrapper สำหรับการยกเลิกการจอง
    const handleCancelWrapper = (booking) => {
        if (onBookingCancelled) {
            onBookingCancelled(booking);
        }
        handleCloseDetailModal();
    };

    const currentRoom = selectedBooking ? getRoom(selectedBooking.roomId) : null;

    return (
        <div
            className="flex-1 flex flex-col min-h-0 overflow-y-auto"
            style={{ background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)' }} // ปรับสีพื้นหลังให้อ่อนลงเล็กน้อยเพื่อให้เข้ากับธีม Clean
        >
            {/* Timeline Container */}
            <div className="flex-1 min-h-100 p-4 md:p-6">

                <WeeklyCalendar
                    rooms={rooms}
                    bookings={bookings}
                    onBookingClick={handleBookingClick}
                    onViewChange={onViewChange} // ✅ 2. ส่งต่อไปยัง WeeklyCalendar เพื่อให้ปุ่มทำงาน
                />
            </div>

            {/* View Detail Modal */}
            <BookingModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                booking={selectedBooking}
                roomName={currentRoom?.name}
                roomImage={currentRoom?.image || currentRoom?.image_base64 || currentRoom?.image_url}
                roomFloor={currentRoom?.floor}
                currentUser={currentUser}
                onCancel={handleCancelWrapper}
                onBook={() => handleBookRoom(selectedBooking?.roomId)}
            />

            {/* Create Booking Modal (Highest Z-Index) */}
            {isCreateModalOpen && (
                <div className="relative z-[9999]">
                    <CreateBookingModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        room={roomToBook}
                        existingBookings={bookings}
                        onConfirm={handleConfirmBooking}
                    />
                </div>
            )}
        </div>
    );
};

export default CalendarView;