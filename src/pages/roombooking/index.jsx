"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // ⚠️ ถ้าใช้ App Router ให้เปลี่ยนเป็น "next/navigation"
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
    fetchAmenities,
    fetchMyPermissions,
    isModuleEnabled,
} from "@/services/api";

const initialBookings = [];
const initialRooms = [];

export default function RoomBookingPage() {
    const router = useRouter();

    // --- State Definitions ---
    const [loading, setLoading] = useState(true);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const [accessGranted, setAccessGranted] = useState(false);

    // ✅ State สำหรับเก็บสถานะ Admin (เอาไว้โชว์ปุ่มเฉยๆ แต่ไม่ได้ใช้เป็นใบผ่านทางแล้ว)
    const [isAdminUser, setIsAdminUser] = useState(false);

    const [currentView, setCurrentView] = useState("listing");
    const [bookings, setBookings] = useState(initialBookings);
    const [rooms, setRooms] = useState(initialRooms);
    const [currentUser, setCurrentUser] = useState(null);
    const [amenitiesList, setAmenitiesList] = useState([]);

    // =======================================================
    // 🛡️ 1. Check Access & Permissions First (Strict Mode)
    // =======================================================
    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Fetch all necessary access info in parallel
                const [moduleEnabled, userData, myPermissions] = await Promise.all([
                    isModuleEnabled("ROOM_BOOKING").catch(() => false),
                    fetchUserProfile().catch(() => null),
                    fetchMyPermissions().catch(() => [])
                ]);

                // 1. Check Global Module Switch
                if (!moduleEnabled) {
                    alert("ฟีเจอร์ Room Booking ถูกปิดการใช้งานโดยผู้ดูแลระบบ");
                    router.replace("/dashboard");
                    return;
                }

                // 2. Check User Authentication & Permissions
                if (userData) {
                    // --- 🛠️ Logic เช็ค Admin (เพื่อใช้เปิดฟีเจอร์ Admin View เท่านั้น) ---
                    let targetRoleName = "";
                    if (userData.role && typeof userData.role === 'object') {
                        targetRoleName = userData.role.role_name || "";
                    } else if (userData.role_name) {
                        targetRoleName = userData.role_name;
                    } else if (userData.role) {
                        targetRoleName = userData.role;
                    }
                    const roleCheck = String(targetRoleName).toLowerCase().trim();
                    const isAdmin = ['admin', 'administrator', 'superadmin', 'super admin'].includes(roleCheck);

                    // --- 🔐 Strict Permission Check ---
                    // ต้องมี Permission 'ROOM_BOOKING' เท่านั้นถึงจะเข้าได้
                    const hasAccess = (myPermissions || []).includes('ROOM_BOOKING');

                    // 🚨 กฎเหล็ก: ถ้าไม่มีสิทธิ์ -> ดีดออกทันที (ไม่สนว่าเป็น Admin หรือไม่)
                    if (!hasAccess) {
                        alert("⚠️ คุณไม่มีสิทธิ์เข้าใช้งานระบบจองห้องประชุม (Access Denied)");
                        router.replace("/dashboard");
                        return;
                    }

                    // ✅ Access Granted: ถ้าผ่านด่าน Permission มาได้
                    setCurrentUser(userData);

                    // ยังคง set สถานะ Admin ไว้ เพื่อให้เขามองเห็นปุ่ม "Admin View" ข้างใน (ถ้าเขาเข้ามาได้แล้ว)
                    setIsAdminUser(isAdmin);

                    setAccessGranted(true);
                } else {
                    router.replace("/");
                    return;
                }
            } catch (error) {
                console.error("Access check failed:", error);
                router.replace("/dashboard");
            } finally {
                setCheckingAccess(false);
            }
        };

        checkAccess();
    }, [router]);

    // =======================================================
    // 📥 2. Fetch Data
    // =======================================================
    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsData, bookingsData, amenitiesData] = await Promise.all([
                getRooms(),
                getAllBookings(),
                fetchAmenities().catch(() => []),
            ]);

            setAmenitiesList(amenitiesData || []);

            const transformedRooms = roomsData.map(r => ({
                id: r.room_id,
                name: r.room_name,
                floor: r.floor ? `Floor ${r.floor}` : "-",
                capacity: r.capacity,
                type: r.room_type,
                amenities: r.amenities || [],
                image: r.image_base64 || r.image_url || null,
                isActive: ['active', 'AVAILABLE'].includes(r.room_status) || ['active', 'AVAILABLE'].includes(r.room_status_code)
            }));

            const transformedBookings = bookingsData.map(b => ({
                id: b.booking_id,
                roomId: b.room_id,
                title: b.room_name,
                startTime: b.start_time?.substring(0, 5),
                endTime: b.end_time?.substring(0, 5),
                bookedBy: b.first_name ? `${b.first_name} ${b.last_name}` : "Unknown User",
                userId: b.user_id,
                purpose: b.purpose,
                attendees: b.attendees || 0,
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

    useEffect(() => {
        if (accessGranted) {
            fetchData();
        }
    }, [accessGranted]);

    // =======================================================
    // 🎮 3. Handlers
    // =======================================================

    const handleViewChange = (view) => {
        if (view === "admin") {
            // ยังคงต้องเช็คว่าเป็น Admin จริงไหม ก่อนให้กดเข้าหน้า Admin View
            if (!isAdminUser) {
                alert("Access Denied: เฉพาะ Admin เท่านั้น");
                return;
            }
        }
        setCurrentView(view);
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return;
        try {
            await updateBookingStatus(bookingId, 'cancelled');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
            alert("ยกเลิกการจองเรียบร้อยแล้ว");
        } catch (error) {
            console.error("Cancel booking failed:", error);
            alert("ยกเลิกไม่สำเร็จ กรุณาลองใหม่");
        }
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
            alert("จองห้องสำเร็จ!");
        } catch (error) {
            console.error("Create booking failed:", error);
            alert("จองไม่สำเร็จ กรุณาลองใหม่");
        }
    };

    // --- Admin Actions ---
    const handleApproveBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'confirmed');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
        } catch (error) {
            console.error("Approve booking failed:", error);
            alert("อนุมัติไม่สำเร็จ");
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'cancelled');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        } catch (error) {
            console.error("Reject booking failed:", error);
            alert("ปฏิเสธไม่สำเร็จ");
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
            alert("เพิ่มห้องสำเร็จ!");
        } catch (error) {
            console.error("Add room failed:", error);
            alert("เพิ่มห้องไม่สำเร็จ");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!confirm("ยืนยันการลบห้องประชุม?")) return;
        try {
            await deleteRoom(roomId);
            setRooms(prev => prev.filter(r => r.id !== roomId));
            alert("ลบห้องสำเร็จ");
        } catch (error) {
            console.error("Delete room failed:", error);
            alert("ลบห้องไม่สำเร็จ");
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
            alert("อัปเดตสถานะห้องไม่สำเร็จ");
        }
    };

    // =======================================================
    // 🎨 4. Render
    // =======================================================

    if (checkingAccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-[#0095F6] rounded-full"></div>
                <span className="text-gray-400 text-xs font-bold animate-pulse tracking-widest uppercase">Checking Access...</span>
            </div>
        );
    }

    if (!accessGranted) return null;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
                <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-[#0095F6] rounded-full"></div>
                <span className="text-gray-400 text-xs font-bold animate-pulse tracking-widest uppercase">Loading Data...</span>
            </div>
        );
    }

    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const activeRooms = rooms.filter(r => r.isActive);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans h-screen overflow-hidden">
            <Navbar
                currentView={currentView}
                onViewChange={handleViewChange}
                currentUser={currentUser}
                isAdmin={isAdminUser}
            />

            <div className="flex-1 overflow-hidden flex flex-col relative">
                {currentView === "calendar" ? (
                    <CalendarView
                        rooms={rooms}
                        bookings={confirmedBookings}
                        onViewChange={handleViewChange}
                        currentUser={currentUser}
                        isAdmin={isAdminUser}
                        onCancel={handleCancelBooking}
                    />
                ) : currentView === "listing" ? (
                    <ListingView
                        rooms={activeRooms}
                        bookings={confirmedBookings}
                        onBookingConfirmed={handleBookingConfirmed}
                        currentUser={currentUser}
                        isAdmin={isAdminUser}
                        onCancel={handleCancelBooking}
                    />
                ) : (
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