"use client";

import React from "react";

const BookingModal = ({
    isOpen,
    onClose,
    booking,
    roomName,
    roomImage,
}) => {
    if (!isOpen || !booking) return null;

    // Format date for display (e.g., Wednesday, November 26, 2025)
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full mx-4 md:mx-0 md:max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                {/* Room Image */}
                {roomImage && (
                    <div className="w-full h-48 relative">
                        <img
                            src={roomImage}
                            alt={roomName || "Room"}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-6 text-white">
                            <h3 className="text-xl font-bold shadow-sm">{roomName}</h3>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                    {/* Space */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Space
                        </label>
                        <div className="text-sm text-slate-600">
                            {roomName || booking.roomId}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Date
                        </label>
                        <div className="text-sm text-slate-600">
                            {formatDate(booking.date)}
                        </div>
                    </div>

                    {/* Time Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-900 mb-1">
                                Start Time
                            </label>
                            <div className="text-sm text-slate-600">{booking.startTime}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-900 mb-1">
                                End Time
                            </label>
                            <div className="text-sm text-slate-600">{booking.endTime}</div>
                        </div>
                    </div>

                    {/* Booked By */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Booked By
                        </label>
                        <div className="text-sm text-slate-600">{booking.bookedBy}</div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Purpose
                        </label>
                        <div className="text-sm text-slate-600">{booking.purpose}</div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-900 mb-1">
                            Status
                        </label>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${booking.status === "confirmed"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                        >
                            {booking.status}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={() => {
                            // Handle delete logic here or pass callback
                            console.log("Delete booking", booking.id);
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Delete Booking
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
