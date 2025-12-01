"use client";

import React, { useState } from "react";
import Navbar from "@/components/roombooking/Navbar";
import CalendarView from "@/components/roombooking/CalendarView";
import ListingView from "@/components/roombooking/ListingView";
import AdminView from "@/components/roombooking/AdminView";

// Mock Data
const initialRooms = [
    {
        id: "r1",
        name: "Master Conference Room",
        floor: "Floor 2",
        capacity: 15,
        type: "Meeting",
        amenities: ["LCD Monitor 75\"", "Video Conference", "Whiteboard", "WIFI", "Pure Water", "HDMI Cable"],
        pricePerHour: 30,
        image: "/images/master.jpg",
        isActive: true
    },
    {
        id: "r2",
        name: "Floor 5-Lobby (Meeting)",
        floor: "Floor 5",
        capacity: 10,
        type: "Meeting",
        amenities: ["LCD Monitor 55\"", "Whiteboard", "HDMI Cable", "WIFI", "Pure Water"],
        pricePerHour: 25,
        image: "/images/lobby.jpg",
        isActive: true
    },
    {
        id: "r3",
        name: "Floor 1-Canteen",
        floor: "Floor 1",
        capacity: 5,
        type: "Canteen",
        amenities: ["LCD Monitor 45\"", "HDMI Cable", "WIFI"],
        pricePerHour: 15,
        image: "/images/canteen.jpg",
        isActive: true
    },
    {
        id: "r4",
        name: "Floor 5-Middle",
        floor: "Floor 5",
        capacity: 4,
        type: "Middle",
        amenities: ["LCD Monitor 45\"", "HDMI Cable", "WIFI"],
        pricePerHour: 5,
        image: "/images/middle.jpg",
        isActive: true
    },
];

const initialBookings = [
    {
        id: "b1",
        roomId: "r4",
        title: "Floor 1-Canteen",
        startTime: "16:00",
        endTime: "17:30",
        bookedBy: "Khun Manita Thongwichian",
        department: "HR",
        purpose: "Staff Meeting",
        attendees: 25,
        cost: 0,
        status: "confirmed",
        date: "2025-11-26",
    },
    {
        id: "b2",
        roomId: "r2",
        title: "Floor 5-Middle",
        startTime: "16:30",
        endTime: "17:30",
        bookedBy: "Puii",
        department: "Finance",
        purpose: "Budget Review",
        attendees: 4,
        cost: 0,
        status: "confirmed",
        date: "2025-11-26",
    },
    {
        id: "b3",
        roomId: "r3",
        title: "Floor 1-Canteen",
        startTime: "11:00",
        endTime: "17:00",
        bookedBy: "Khun Manita Thongwichian",
        department: "HR",
        purpose: "Training",
        attendees: 30,
        cost: 500,
        status: "confirmed",
        date: "2025-11-26",
    },
    {
        id: "b4",
        roomId: "r1",
        title: "Master Conference Room",
        startTime: "13:00",
        endTime: "17:30",
        bookedBy: "Services",
        department: "IT",
        purpose: "Meeting training GPON Ruijie",
        attendees: 10,
        cost: 225,
        status: "confirmed",
        date: "2025-11-26",
    },
];

export default function RoomBookingPage() {
    const [currentView, setCurrentView] = useState("calendar");
    const [bookings, setBookings] = useState(initialBookings);
    const [rooms, setRooms] = useState(initialRooms);

    // แก้ไข: รับ Array แทน Object เดียว
    const handleBookingConfirmed = (newBookings) => {
        // สร้าง ID ให้แต่ละ Booking (ถ้ายังไม่มี) และรวมเข้า State ทีเดียว
        // Default status is 'pending' for new bookings
        const bookingsWithIds = newBookings.map(b => ({
            ...b,
            id: b.id || Math.random().toString(36).substr(2, 9),
            status: 'pending'
        }));

        setBookings(prev => [...prev, ...bookingsWithIds]);
    };

    const handleApproveBooking = (bookingId) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
    };

    const handleRejectBooking = (bookingId) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    };

    const handleAddRoom = (newRoom) => {
        setRooms(prev => [...prev, { ...newRoom, id: `r${Date.now()}`, isActive: true }]);
    };

    const handleToggleRoomStatus = (roomId) => {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isActive: !r.isActive } : r));
    };

    // Filter only confirmed bookings for public views
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

    // Filter active rooms for public views
    const activeRooms = rooms.filter(r => r.isActive);

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans h-screen">
            <Navbar currentView={currentView} onViewChange={setCurrentView} />

            <div className="flex-1 overflow-hidden flex flex-col">
                {currentView === "calendar" ? (
                    <CalendarView rooms={activeRooms} bookings={confirmedBookings} />
                ) : currentView === "listing" ? (
                    <ListingView
                        rooms={activeRooms}
                        bookings={confirmedBookings}
                        onBookingConfirmed={handleBookingConfirmed}
                    />
                ) : (
                    <AdminView
                        bookings={bookings}
                        rooms={rooms}
                        onApprove={handleApproveBooking}
                        onReject={handleRejectBooking}
                        onAddRoom={handleAddRoom}
                        onToggleRoomStatus={handleToggleRoomStatus}
                    />
                )}
            </div>
        </main>
    );
}
