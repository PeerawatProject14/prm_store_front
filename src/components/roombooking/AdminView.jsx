"use client";

import React, { useState } from "react";

const AdminView = ({ bookings, rooms, onApprove, onReject, onAddRoom, onToggleRoomStatus }) => {
    const [activeTab, setActiveTab] = useState("pending");
    const [viewMode, setViewMode] = useState("bookings"); // 'bookings' or 'rooms'
    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

    // Form State
    const [newRoom, setNewRoom] = useState({
        name: "",
        floor: "",
        capacity: "",
        type: "Meeting",
        amenities: "",
        pricePerHour: "",
        image: ""
    });

    const filteredBookings = bookings.filter(b => b.status === activeTab);

    const getRoomName = (roomId) => {
        return rooms.find(r => r.id === roomId)?.name || roomId;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const handleAddRoomSubmit = (e) => {
        e.preventDefault();
        onAddRoom({
            ...newRoom,
            capacity: parseInt(newRoom.capacity),
            pricePerHour: parseInt(newRoom.pricePerHour),
            amenities: newRoom.amenities.split(",").map(item => item.trim())
        });
        setIsAddRoomModalOpen(false);
        setNewRoom({
            name: "",
            floor: "",
            capacity: "",
            type: "Meeting",
            amenities: "",
            pricePerHour: "",
            image: ""
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("bookings")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "bookings" ? "bg-white shadow-sm text-slate-800" : "text-slate-600 hover:text-slate-800"}`}
                        >
                            Bookings
                        </button>
                        <button
                            onClick={() => setViewMode("rooms")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "rooms" ? "bg-white shadow-sm text-slate-800" : "text-slate-600 hover:text-slate-800"}`}
                        >
                            Rooms
                        </button>
                    </div>
                </div>

                {viewMode === "bookings" ? (
                    <>
                        {/* Tabs */}
                        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg mb-6 w-fit">
                            {["pending", "confirmed", "cancelled"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                        }`}
                                >
                                    {tab} ({bookings.filter(b => b.status === tab).length})
                                </button>
                            ))}
                        </div>

                        {/* Booking List */}
                        <div className="space-y-4">
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                    <p className="text-slate-400">No {activeTab} bookings found.</p>
                                </div>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4"
                                    >
                                        {/* Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">{booking.purpose}</h3>
                                                    <p className="text-sm text-slate-500">{getRoomName(booking.roomId)}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>{formatDate(booking.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>⏰</span>
                                                    <span>{booking.startTime} - {booking.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>👤</span>
                                                    <span>{booking.bookedBy} ({booking.department})</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {activeTab === "pending" && (
                                            <div className="flex items-center gap-3 pt-4 md:pt-0 md:border-l md:border-slate-100 md:pl-6">
                                                <button
                                                    onClick={() => onApprove(booking.id)}
                                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow flex items-center gap-2"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => onReject(booking.id)}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    Reject
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
                            <h2 className="text-lg font-semibold text-slate-700">Room Management</h2>
                            <button
                                onClick={() => setIsAddRoomModalOpen(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                            >
                                <span>+</span> Add Room
                            </button>
                        </div>

                        {/* Room List */}
                        <div className="grid grid-cols-1 gap-4">
                            {rooms.map((room) => (
                                <div key={room.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                                            {room.image ? (
                                                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{room.name}</h3>
                                            <div className="text-sm text-slate-500 flex gap-3">
                                                <span>{room.floor}</span>
                                                <span>•</span>
                                                <span>{room.type}</span>
                                                <span>•</span>
                                                <span>Capacity: {room.capacity}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${room.isActive ? "text-green-600" : "text-slate-400"}`}>
                                                {room.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <button
                                                onClick={() => onToggleRoomStatus(room.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${room.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${room.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Room Modal */}
            {isAddRoomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Add New Room</h3>
                            <button onClick={() => setIsAddRoomModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleAddRoomSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newRoom.name}
                                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRoom.floor}
                                        onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRoom.capacity}
                                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        value={newRoom.type}
                                        onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                                    >
                                        <option value="Meeting">Meeting</option>
                                        <option value="Canteen">Canteen</option>
                                        <option value="Lobby">Lobby</option>
                                        <option value="Middle">Middle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price / Hour</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newRoom.pricePerHour}
                                        onChange={(e) => setNewRoom({ ...newRoom, pricePerHour: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amenities (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="Wifi, TV, Whiteboard"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newRoom.amenities}
                                    onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="/images/room.jpg"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newRoom.image}
                                    onChange={(e) => setNewRoom({ ...newRoom, image: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddRoomModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    Add Room
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
