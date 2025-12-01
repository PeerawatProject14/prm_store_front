"use client";

import React, { useState } from "react";
import WeeklyCalendar from "./WeeklyCalendar";
import BookingModal from "./BookingModal";

const CalendarView = ({ rooms, bookings }) => {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const getRoomName = (roomId) => {
        return rooms.find((r) => r.id === roomId)?.name || roomId;
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

            {/* Timeline Container */}
            <div className="flex-1 min-h-0 bg-slate-50 p-4">
                <WeeklyCalendar
                    rooms={rooms}
                    bookings={bookings}
                    onBookingClick={handleBookingClick}
                />
            </div>

            {/* Modal */}
            <BookingModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                booking={selectedBooking}
                roomName={selectedBooking ? getRoomName(selectedBooking.roomId) : undefined}
                roomImage={selectedBooking ? rooms.find(r => r.id === selectedBooking.roomId)?.image : undefined}
            />
        </div>
    );
};

export default CalendarView;
