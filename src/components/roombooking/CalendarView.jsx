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
    // onBookingCancelled, // ❌ เปลี่ยนชื่อให้ตรงมาตรฐานเดียวกับหน้าอื่น
    onCancel,           // ✅ ใช้ชื่อนี้ให้เหมือน ListingView
    onViewChange,
    isAdmin             // ✅ [ADDED] รับค่า Admin
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

    const getRoom = (roomId) => {
        if (!roomId) return null;
        return rooms.find((r) => String(r.id) === String(roomId));
    };

    const handleBookRoom = (roomId) => {
        const room = getRoom(roomId);
        if (room) {
            setRoomToBook(room);
            setIsDetailModalOpen(false);
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

    // ✅ ปรับปรุง Handler ให้เรียก onCancel ตัวใหม่
    const handleCancelWrapper = (bookingId) => { // รับ bookingId หรือ object ก็ได้แล้วแต่ design ของ parent
        if (onCancel) {
            // ส่ง ID ของ booking ที่เลือกอยู่ไปลบ
            onCancel(selectedBooking?.id || selectedBooking?.booking_id);
        }
        handleCloseDetailModal();
    };

    const currentRoom = selectedBooking ? getRoom(selectedBooking.roomId) : null;

    return (
        <div
            className="flex-1 flex flex-col min-h-0 overflow-y-auto"
            style={{ background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)' }}
        >
            <div className="flex-1 min-h-100 p-4 md:p-6">
                <WeeklyCalendar
                    rooms={rooms}
                    bookings={bookings}
                    onBookingClick={handleBookingClick}
                    onViewChange={onViewChange}
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

                // ✅ ส่งค่าสำคัญไปให้ Modal
                isAdmin={isAdmin}
                onCancel={handleCancelWrapper}

                onBook={() => handleBookRoom(selectedBooking?.roomId)}
            />

            {/* Create Booking Modal */}
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