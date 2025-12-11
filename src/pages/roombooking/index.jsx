"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/roombooking/Navbar";
import CalendarView from "@/components/roombooking/CalendarView";
import ListingView from "@/components/roombooking/ListingView";
import AdminView from "@/components/roombooking/AdminView";
import {
    getRooms,
    getAllBookings,
    createBooking,
    updateBookingStatus,
    createRoom,
    updateRoomStatus,
    deleteRoom,
    fetchUserProfile,
    fetchAmenities
} from "@/services/api";

const initialBookings = [];
const initialRooms = [];

export default function RoomBookingPage() {
    const router = useRouter();

    // --- State Definitions ---
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState("calendar");
    const [bookings, setBookings] = useState(initialBookings);
    const [rooms, setRooms] = useState(initialRooms);
    const [currentUser, setCurrentUser] = useState(null);
    const [amenitiesList, setAmenitiesList] = useState([]);

    // --- Fetch Data ---
    const fetchData = async () => {
        try {
            const [userData, roomsData, bookingsData, amenitiesData] = await Promise.all([
                fetchUserProfile().catch(() => null),
                getRooms(),
                getAllBookings(),
                fetchAmenities()
            ]);

            if (userData) {
                setCurrentUser(userData);
            }

            setAmenitiesList(amenitiesData || []);

            // 1. Transform Rooms
            const transformedRooms = roomsData.map(r => ({
                id: r.room_id,
                name: r.room_name,
                floor: r.floor ? `Floor ${r.floor}` : "-",
                capacity: r.capacity,
                type: r.room_type,
                amenities: r.amenities || [],
                // รองรับทั้งรูป Base64 (ที่เพิ่งอัปโหลด) และ URL เดิม
                image: r.image_base64 || r.image_url || null,
                image_base64: r.image_base64,
                image_url: r.image_url,
                // เช็คสถานะ Active
                isActive: ['active', 'AVAILABLE'].includes(r.room_status) || ['active', 'AVAILABLE'].includes(r.room_status_code)
            }));

            // 2. Transform Bookings
            const transformedBookings = bookingsData.map(b => ({
                id: b.booking_id,
                roomId: b.room_id,
                title: b.room_name,
                startTime: b.start_time?.substring(0, 5),
                endTime: b.end_time?.substring(0, 5),
                bookedBy: b.first_name ? `${b.first_name} ${b.last_name}` : "Unknown User",
                department: "", // Not used
                purpose: b.purpose,
                attendees: b.attendees || 0,
                cost: 0,
                status: b.status,
                date: new Date(b.booking_date).toLocaleDateString('en-CA'),
            }));

            setRooms(transformedRooms);
            setBookings(transformedBookings);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- useEffect Check Token ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/");
        } else {
            fetchData();
        }
    }, [router]);

    // --- Handlers ---

    const handleViewChange = (view) => {
        if (view === "admin") {
            const roleName = currentUser?.role_name || currentUser?.role || "";
            const isAdmin = roleName.toLowerCase() === "admin";

            if (!isAdmin) {
                alert("Access Denied: You do not have permission to access the Admin view.");
                return;
            }
        }
        setCurrentView(view);
    };

    const handleBookingConfirmed = async (newBookings) => {
        try {
            for (const booking of newBookings) {
                await createBooking({
                    room_id: booking.roomId,
                    booking_date: booking.date,
                    start_time: booking.startTime,
                    end_time: booking.endTime,
                    purpose: booking.purpose,
                    attendees: booking.attendees || 1,
                });
            }
            await fetchData();
            alert("Booking created successfully!");
        } catch (error) {
            console.error("Create booking failed:", error);
            alert("Failed to create booking. Please try again.");
        }
    };

    const handleApproveBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'confirmed');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
        } catch (error) {
            console.error("Approve booking failed:", error);
            alert("Failed to approve booking.");
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'cancelled');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        } catch (error) {
            console.error("Reject booking failed:", error);
            alert("Failed to reject booking.");
        }
    };

    const handleAddRoom = async (newRoomData) => {
        try {
            await createRoom({
                room_name: newRoomData.name,
                capacity: parseInt(newRoomData.capacity),
                floor: newRoomData.floor || "",
                amenity_ids: newRoomData.amenity_ids || [],
                image_base64: newRoomData.image_base64,
                room_status_code: 'active'
            });

            await fetchData();
            alert("Room created successfully!");
        } catch (error) {
            console.error("Add room failed:", error);
            alert("Failed to add room: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);
            setRooms(prev => prev.filter(r => r.id !== roomId));
            alert("Room deleted successfully");
        } catch (error) {
            console.error("Delete room failed:", error);
            alert("Failed to delete room.");
        }
    };

    const handleToggleRoomStatus = async (roomId) => {
        try {
            const room = rooms.find(r => r.id === roomId);
            const newStatus = room.isActive ? 'inactive' : 'active';

            await updateRoomStatus(roomId, newStatus);
            setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isActive: !r.isActive } : r));
        } catch (error) {
            console.error("Toggle room status failed:", error);
            alert("Failed to update room status.");
        }
    };

    // --- Render Preparation ---
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const activeRooms = rooms.filter(r => r.isActive);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-[#0095F6] rounded-full"></div>
                <span className="text-gray-400 text-xs font-bold animate-pulse tracking-widest uppercase">Loading Workspace...</span>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans h-screen overflow-hidden">
            <Navbar
                currentView={currentView}
                onViewChange={handleViewChange}
                currentUser={currentUser}
            />

            <div className="flex-1 overflow-hidden flex flex-col relative">
                {currentView === "calendar" ? (
                    // Calendar View
                    <CalendarView
                        rooms={rooms}
                        bookings={confirmedBookings}
                    />
                ) : currentView === "listing" ? (
                    // Listing View (Booking Flow)
                    <ListingView
                        rooms={activeRooms}
                        bookings={confirmedBookings}
                        onBookingConfirmed={handleBookingConfirmed}
                        currentUser={currentUser} // ✅ ส่ง currentUser ไปใช้ล็อกชื่อใน Modal
                    />
                ) : (
                    // Admin View
                    <AdminView
                        bookings={bookings}
                        rooms={rooms}
                        onApprove={handleApproveBooking}
                        onReject={handleRejectBooking}
                        onAddRoom={handleAddRoom}
                        onToggleRoomStatus={handleToggleRoomStatus}
                        onDeleteRoom={handleDeleteRoom}
                        availableAmenities={amenitiesList}
                    />
                )}
            </div>
        </main>
    );
}