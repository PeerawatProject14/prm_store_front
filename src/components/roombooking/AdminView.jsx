"use client";

import React, { useState, useRef } from "react";
import {
    HiPlus,
    HiTrash,
    HiCheck,
    HiXMark,
    HiCalendarDays,
    HiClock,
    HiUser,
    HiBuildingOffice2,
    HiPhoto
} from "react-icons/hi2";

// ✅ 1. เพิ่ม prop: availableAmenities
const AdminView = ({
    bookings,
    rooms,
    onApprove,
    onReject,
    onAddRoom,
    onToggleRoomStatus,
    onDeleteRoom,
    availableAmenities = []
}) => {
    const [activeTab, setActiveTab] = useState("pending");
    const [viewMode, setViewMode] = useState("rooms"); // Default to rooms for admin dashboard flow
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

    const [newRoom, setNewRoom] = useState({
        name: "",
        floor: "",
        capacity: "",
        amenity_ids: [],
        image_base64: "",
        imagePreview: ""
    });

    const fileInputRef = useRef(null);

    const filteredBookings = bookings.filter(b => b.status === activeTab);
    const getRoomName = (roomId) => rooms.find(r => r.id === roomId)?.name || roomId;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric"
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setNewRoom(prev => ({
                    ...prev,
                    image_base64: reader.result,
                    imagePreview: reader.result
                }));
            };
            reader.onerror = () => {
                alert("Error reading file");
            };
        }
    };

    const handleAmenityToggle = (amenityId) => {
        setNewRoom(prev => {
            const currentIds = prev.amenity_ids;
            if (currentIds.includes(amenityId)) {
                return { ...prev, amenity_ids: currentIds.filter(id => id !== amenityId) };
            } else {
                return { ...prev, amenity_ids: [...currentIds, amenityId] };
            }
        });
    };

    const handleAddRoomSubmit = async (e) => {
        e.preventDefault();

        if (!newRoom.image_base64) {
            alert("Please upload a room image before adding.");
            return;
        }

        onAddRoom({
            ...newRoom,
            capacity: parseInt(newRoom.capacity),
            amenity_ids: newRoom.amenity_ids,
            image_base64: newRoom.image_base64
        });

        setIsAddRoomModalOpen(false);
        setNewRoom({
            name: "", floor: "", capacity: "", amenity_ids: [], image_base64: "", imagePreview: ""
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-gray-50 p-4 md:p-8 font-sans"
        style={{ background: 'linear-gradient(to bottom, #1f242b00, #2c4567)' }}>
            <div className="max-w-6xl mx-auto w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage bookings and rooms efficiently.</p>
                    </div>

                    {/* View Switcher */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        {/* <button
                            onClick={() => setViewMode("bookings")}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === "bookings" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            Bookings
                        </button> */}
                        <button
                            onClick={() => setViewMode("rooms")}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === "rooms" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            Rooms
                        </button>
                    </div>
                </div>

                {viewMode === "bookings" ? (
                    <>
                        {/* Booking Status Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <div className="flex space-x-8">
                                {["pending", "confirmed", "cancelled"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            pb-4 text-sm font-bold capitalize transition-all border-b-2 
                                            ${activeTab === tab
                                                ? "border-[#0095F6] text-[#0095F6]"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        {tab}
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                            {bookings.filter(b => b.status === tab).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Booking List */}
                        <div className="space-y-4">
                            {filteredBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <HiCalendarDays className="text-gray-300 w-8 h-8" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No {activeTab} bookings found.</p>
                                </div>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-5 items-start md:items-center group">

                                        {/* Left Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border 
                                                    ${booking.status === 'confirmed' ? 'bg-green-50 text-[#34C759] border-green-100' :
                                                        booking.status === 'pending' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                                                            'bg-red-50 text-[#ED4956] border-red-100'}`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium">ID: #{booking.id}</span>
                                            </div>

                                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-[#0095F6] transition-colors">
                                                {booking.purpose}
                                            </h3>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-3">
                                                <div className="flex items-center gap-1.5"><HiBuildingOffice2 className="w-4 h-4 text-gray-400" /> <span className="font-medium text-gray-700">{getRoomName(booking.roomId)}</span></div>
                                                <div className="flex items-center gap-1.5"><HiCalendarDays className="w-4 h-4 text-gray-400" /> {formatDate(booking.date)}</div>
                                                <div className="flex items-center gap-1.5"><HiClock className="w-4 h-4 text-gray-400" /> {booking.startTime} - {booking.endTime}</div>
                                                <div className="flex items-center gap-1.5"><HiUser className="w-4 h-4 text-gray-400" /> {booking.bookedBy} <span className="text-gray-400">({booking.department || "N/A"})</span></div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {activeTab === "pending" && (
                                            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 md:border-l md:border-gray-100 md:pl-6 shrink-0">
                                                <button onClick={() => onApprove(booking.id)} className="flex-1 md:flex-none px-4 py-2.5 bg-[#34C759] hover:bg-[#2dbb4e] text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                                                    <HiCheck className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => onReject(booking.id)} className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-[#ED4956] hover:border-red-100 text-sm font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                                    <HiXMark className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Room Management Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800">All Rooms</h2>
                            <button
                                onClick={() => setIsAddRoomModalOpen(true)}
                                className="px-5 py-2.5 bg-[#0095F6] hover:bg-[#0085DE] text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <HiPlus className="w-5 h-5" /> Add Room
                            </button>
                        </div>

                        {/* Room List */}
                        <div className="grid grid-cols-1 gap-4">
                            {rooms.map((room) => (
                                <div key={room.id} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:shadow-md transition-all gap-4">
                                    <div className="flex items-start sm:items-center gap-4 w-full">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
                                            {room.image || room.image_base64 || room.image_url ? (
                                                <img
                                                    src={room.image_base64 || room.image || room.image_url}
                                                    alt={room.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                    <HiBuildingOffice2 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{room.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><HiBuildingOffice2 className="w-3.5 h-3.5" /> {room.floor}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="flex items-center gap-1"><HiUser className="w-3.5 h-3.5" /> {room.capacity} Max</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-gray-100 sm:pl-6 pt-2 sm:pt-0">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${room.isActive ? "text-[#34C759]" : "text-gray-400"}`}>
                                                {room.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <button
                                                onClick={() => onToggleRoomStatus(room.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095F6] ${room.isActive ? 'bg-[#34C759]' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${room.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
                                                    onDeleteRoom(room.id);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-[#ED4956] hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Room"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Room Modal */}
            {isAddRoomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <HiPlus className="text-[#0095F6]" /> Add New Room
                            </h3>
                            <button onClick={() => setIsAddRoomModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full border border-gray-200 hover:bg-gray-100 transition">
                                <HiXMark size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddRoomSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Room Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Meeting Room A"
                                    value={newRoom.name}
                                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Floor <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] outline-none transition-all"
                                        placeholder="e.g. 2nd Floor"
                                        value={newRoom.floor}
                                        onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Capacity <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-[#0095F6] focus:border-[#0095F6] outline-none transition-all"
                                        placeholder="0"
                                        value={newRoom.capacity}
                                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Amenities Checkbox Grid */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Amenities</label>
                                <div className="grid grid-cols-2 gap-2 border border-gray-200 p-3 rounded-xl bg-gray-50 max-h-40 overflow-y-auto">
                                    {availableAmenities.length > 0 ? (
                                        availableAmenities.map((am) => (
                                            <label key={am.amenity_id} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    value={am.amenity_id}
                                                    checked={newRoom.amenity_ids.includes(am.amenity_id)}
                                                    onChange={() => handleAmenityToggle(am.amenity_id)}
                                                    className="rounded text-[#0095F6] focus:ring-[#0095F6] h-4 w-4 border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">{am.amenity_code}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 col-span-2 text-center py-4">No amenities available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                                    Room Image <span className="text-red-500">*</span>
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                                        w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer 
                                        transition-all duration-200
                                        ${!newRoom.image_base64
                                            ? 'border-gray-300 hover:border-[#0095F6] hover:bg-blue-50'
                                            : 'border-[#0095F6] bg-gray-50'
                                        }
                                        relative overflow-hidden group
                                    `}
                                >
                                    {newRoom.imagePreview ? (
                                        <>
                                            <img src={newRoom.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Change Image</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <HiPhoto className="w-8 h-8 text-gray-300 mb-2 group-hover:text-[#0095F6] transition-colors" />
                                            <span className="text-gray-500 text-xs font-medium">Click to upload image</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddRoomModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#0095F6] hover:bg-[#0085DE] text-white font-bold text-sm rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <HiPlus className="w-4 h-4" /> Add Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;