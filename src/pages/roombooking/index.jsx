"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // หรือ "next/navigation" สำหรับ App Router
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
    deleteRoom // ✅ 1. เพิ่ม Import deleteRoom
} from "@/services/api";

// สมมติข้อมูลเริ่มต้น
const initialBookings = [];
const initialRooms = [];

export default function RoomBookingPage() {
    const router = useRouter();

    // --- 1. State Definitions ---
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState("calendar");
    const [bookings, setBookings] = useState(initialBookings);
    const [rooms, setRooms] = useState(initialRooms);

    const fetchData = async () => {
        try {
            const [roomsData, bookingsData] = await Promise.all([
                getRooms(),
                getAllBookings()
            ]);

            // Transform rooms data
            const transformedRooms = roomsData.map(r => ({
                id: r.room_id,
                name: r.room_name,
                floor: "Floor ?",
                capacity: r.capacity,
                type: r.room_type,
                amenities: [], // ต้องดึงจาก API แยก หรือแก้ API getRooms ให้ส่งมาด้วย
                image: r.image_url || "/images/meeting.jpg",
                isActive: r.room_status === 'AVAILABLE'
            }));

            // Transform bookings data
            const transformedBookings = bookingsData.map(b => ({
                id: b.booking_id,
                roomId: b.room_id,
                title: b.room_name,
                startTime: b.start_time?.substring(0, 5),
                endTime: b.end_time?.substring(0, 5),
                bookedBy: `${b.first_name} ${b.last_name}`,
                department: "Unknown",
                purpose: b.purpose,
                attendees: b.attendees || 0,
                cost: 0,
                status: b.status,
                date: b.booking_date?.substring(0, 10),
            }));

            setRooms(transformedRooms);
            setBookings(transformedBookings);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. useEffect Check Token ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/");
        } else {
            fetchData();
        }
    }, [router]);

    // --- 3. Handlers ---

    const handleBookingConfirmed = async (newBookings) => {
        try {
            for (const booking of newBookings) {
                await createBooking({
                    room_id: booking.roomId,
                    booking_date: booking.date,
                    start_time: booking.startTime,
                    end_time: booking.endTime,
                    purpose: booking.purpose,
                    attendees: booking.attendees
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

    // ✅ 2. ปรับปรุง handleAddRoom ให้รองรับการ Upload รูปภาพ
    const handleAddRoom = async (newRoomData) => {
        try {
            let finalImageUrl = newRoomData.image || "/images/meeting.jpg"; // Default image

            // ถ้ามีการแนบไฟล์รูปภาพมา ให้ Upload ก่อน
            if (newRoomData.imageFile) {
                const formData = new FormData();
                formData.append("file", newRoomData.imageFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const uploadResult = await uploadRes.json();

                if (uploadResult.success) {
                    finalImageUrl = uploadResult.filepath; // ได้ path เช่น /uploads/room-xxx.webp
                } else {
                    console.warn("Image upload failed, using default image.");
                }
            }

            // ส่งข้อมูลไปสร้างห้องใน Database
            await createRoom({
                room_name: newRoomData.name,
                capacity: newRoomData.capacity,
                amenity_ids: [], // ถ้ามี amenity_ids ต้องจัดการ mapping ตรงนี้
                image_url: finalImageUrl,
                room_status_code: 'AVAILABLE'
            });

            await fetchData(); // โหลดข้อมูลใหม่เพื่อให้เห็นห้องล่าสุด
            alert("Room created successfully!");
        } catch (error) {
            console.error("Add room failed:", error);
            alert("Failed to add room. Please check logs.");
        }
    };

    // ✅ 3. เพิ่มฟังก์ชัน Delete Room
    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);

            // อัปเดต state ทันทีเพื่อความรวดเร็ว (Optimistic Update)
            setRooms(prev => prev.filter(r => r.id !== roomId));

            // หรือจะเรียก fetchData() อีกครั้งเพื่อความชัวร์ก็ได้
            // await fetchData(); 

            alert("Room deleted successfully");
        } catch (error) {
            console.error("Delete room failed:", error);
            alert("Failed to delete room.");
        }
    };

    const handleToggleRoomStatus = async (roomId) => {
        try {
            const room = rooms.find(r => r.id === roomId);
            // สลับสถานะ (ถ้า Active อยู่ ให้เป็น MAINTENANCE, ถ้าไม่ ก็ AVAILABLE)
            const newStatus = room.isActive ? 'MAINTENANCE' : 'AVAILABLE';

            await updateRoomStatus(roomId, newStatus);

            // Update UI
            setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isActive: !r.isActive } : r));
        } catch (error) {
            console.error("Toggle room status failed:", error);
            alert("Failed to update room status.");
        }
    };

    // --- 4. Render Preparation ---
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const activeRooms = rooms.filter(r => r.isActive);

    // --- 5. Render ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-[#0095F6] rounded-full"></div>
                <span className="text-gray-500 font-medium animate-pulse">Checking Permission...</span>
            </div>
        );
    }

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
                        onDeleteRoom={handleDeleteRoom} // ✅ ส่ง prop ลงไป
                    />
                )}
            </div>
        </main>
    );
}