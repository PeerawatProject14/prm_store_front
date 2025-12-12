"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // หรือ "next/navigation" ถ้าใช้ App Router รุ่นใหม่
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

    // ✅ State สำหรับเก็บสถานะ Admin
    const [isAdminUser, setIsAdminUser] = useState(false);

    const [currentView, setCurrentView] = useState("calendar");
    const [bookings, setBookings] = useState(initialBookings);
    const [rooms, setRooms] = useState(initialRooms);
    const [currentUser, setCurrentUser] = useState(null);
    const [amenitiesList, setAmenitiesList] = useState([]);

    // --- Check Access & Permissions First ---
    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Fetch all necessary access info in parallel
                const [moduleEnabled, userData, myPermissions] = await Promise.all([
                    isModuleEnabled("ROOM_BOOKING").catch(() => false),
                    fetchUserProfile().catch(() => null),
                    fetchMyPermissions().catch(() => [])
                ]);

                // 1. Debug: ดูค่าที่ได้จาก API
                console.log("DEBUG: User Data:", userData);

                // 2. Check Global Module Switch
                if (!moduleEnabled) {
                    alert("ฟีเจอร์ Room Booking ถูกปิดการใช้งานโดยผู้ดูแลระบบ");
                    router.replace("/dashboard");
                    return;
                }

                // 3. Check User Authentication & Permissions
                if (userData) {
                    // --- 🛠️ Logic เช็ค Admin (รองรับ Object) ---
                    let targetRoleName = "";

                    if (userData.role && typeof userData.role === 'object') {
                        // กรณี role เป็น object { role_id: 1, role_name: 'admin' }
                        targetRoleName = userData.role.role_name || "";
                    } else if (userData.role_name) {
                        targetRoleName = userData.role_name;
                    } else if (userData.role) {
                        targetRoleName = userData.role;
                    }

                    // แปลงเป็นตัวเล็กและตัดช่องว่าง
                    const roleCheck = String(targetRoleName).toLowerCase().trim();
                    console.log("DEBUG FIXED: Role String =", roleCheck);

                    // เช็คสิทธิ์ Admin
                    const isAdmin = ['admin', 'administrator', 'superadmin', 'super admin'].includes(roleCheck);
                    console.log("DEBUG: Is Admin Final Result =", isAdmin);

                    // เช็คสิทธิ์ Permission ทั่วไป
                    const hasAccess = (myPermissions || []).includes('ROOM_BOOKING');

                    // ถ้าไม่ใช่ Admin และไม่มีสิทธิ์ -> Redirect
                    if (!isAdmin && !hasAccess) {
                        alert("⚠️ คุณไม่มีสิทธิ์เข้าใช้งานระบบจองห้องประชุม");
                        router.replace("/dashboard");
                        return;
                    }

                    // Access Granted
                    setCurrentUser(userData);
                    setIsAdminUser(isAdmin); // ✅ บันทึกค่า Admin ลง State
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

    // --- Fetch Data (Only after access is granted) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsData, bookingsData, amenitiesData] = await Promise.all([
                getRooms(),
                getAllBookings(),
                fetchAmenities().catch(() => []),
            ]);

            setAmenitiesList(amenitiesData || []);

            // --- Transform Rooms ---
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

            // --- Transform Bookings ---
            const transformedBookings = bookingsData.map(b => ({
                id: b.booking_id,
                roomId: b.room_id,
                title: b.room_name,
                startTime: b.start_time?.substring(0, 5),
                endTime: b.end_time?.substring(0, 5),
                bookedBy: b.first_name ? `${b.first_name} ${b.last_name}` : "Unknown User",

                // ✅ ต้องมี userId เพื่อเอาไปเช็คว่าเป็นเจ้าของ Booking หรือไม่
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

    // --- Handlers ---

    const handleViewChange = (view) => {
        if (view === "admin") {
            // ✅ ใช้ State isAdminUser ที่เช็คมาแล้ว
            if (!isAdminUser) {
                alert("Access Denied: เฉพาะ Admin เท่านั้น");
                return;
            }
        }
        setCurrentView(view);
    };

    // ✅ ฟังก์ชันสำหรับยกเลิกการจอง (ใช้ได้ทั้ง User เจ้าของห้อง และ Admin)
    const handleCancelBooking = async (bookingId) => {
        if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return;

        try {
            // เรียก API เปลี่ยนสถานะเป็น cancelled
            await updateBookingStatus(bookingId, 'cancelled');

            // อัปเดตหน้าจอทันที
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: 'cancelled' } : b
            ));
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

    // Admin: Approve
    const handleApproveBooking = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'confirmed');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
        } catch (error) {
            console.error("Approve booking failed:", error);
            alert("อนุมัติไม่สำเร็จ");
        }
    };

    // Admin: Reject
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

    // --- Render ---

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
                // ✅ ส่งสถานะ Admin ไปให้ Navbar (เพื่อโชว์/ซ่อนปุ่ม Admin)
                isAdmin={isAdminUser}
            />

            <div className="flex-1 overflow-hidden flex flex-col relative">
                {currentView === "calendar" ? (
                    <CalendarView
                        rooms={rooms}
                        bookings={confirmedBookings}
                        onViewChange={handleViewChange}
                        currentUser={currentUser} // ✅ อย่าลืมส่ง currentUser

                        // ✅ [ADDED] เพิ่ม 2 บรรทัดนี้ครับ
                        isAdmin={isAdminUser}
                        onCancel={handleCancelBooking}
                    />
                ) : currentView === "listing" ? (
                    <ListingView
                        rooms={activeRooms}
                        bookings={confirmedBookings}
                        onBookingConfirmed={handleBookingConfirmed}
                        currentUser={currentUser}

                        // ✅ ส่ง Props สำหรับฟีเจอร์ยกเลิก
                        isAdmin={isAdminUser}             // Admin ยกเลิกได้ทุกคน
                        onCancel={handleCancelBooking}    // ฟังก์ชันยกเลิก
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