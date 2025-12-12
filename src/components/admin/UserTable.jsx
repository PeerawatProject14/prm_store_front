import { useState, useMemo } from "react";
import { HiMagnifyingGlass, HiFunnel, HiChevronDown, HiKey, HiXMark, HiShieldCheck } from "react-icons/hi2";

export default function UserTable({
  users,
  roles,
  currentUserId,
  availableFeatures = [], // ✅ รับ list ฟีเจอร์เข้ามา
  onRoleChange,
  onToggleStatus,
  onApprove, // This function likely handles the status update to ACTIVE
  onDeleteUser = () => {},
  onChangePassword = (userId, newPassword) => {},
  onUpdatePermissions = (userId, selectedFeatures) => {} // ✅ รับฟังก์ชันบันทึกสิทธิ์
}) {
  // --- Filter State ---
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [approveFilter, setApproveFilter] = useState("ALL");

  // --- Modal States ---
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserForPwd, setSelectedUserForPwd] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [permModalOpen, setPermModalOpen] = useState(false); // ✅ Permission Modal
  const [selectedUserForPerm, setSelectedUserForPerm] = useState(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);

  // --- Filter Logic ---
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
      const matchesRole = roleFilter === "ALL" || String(u.roleId) === String(roleFilter);
      const matchesStatus = statusFilter === "ALL" || u.statusCode === statusFilter;
      let matchesApprove = true;
      if (approveFilter === "PENDING") matchesApprove = u.statusCode === "PENDING";
      else if (approveFilter === "APPROVED") matchesApprove = u.statusCode !== "PENDING";
      return matchesSearch && matchesRole && matchesStatus && matchesApprove;
    });
  }, [users, search, roleFilter, statusFilter, approveFilter]);

  // --- Handlers ---
  const handleOpenPasswordModal = (user) => {
    setSelectedUserForPwd(user);
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const handleSavePassword = () => {
    if (selectedUserForPwd && newPassword.trim() !== "") {
      onChangePassword(selectedUserForPwd.id, newPassword);
      setPasswordModalOpen(false);
      setSelectedUserForPwd(null);
      setNewPassword("");
    } else {
      alert("กรุณากรอกรหัสผ่านใหม่");
    }
  };

  // ✅ Permission Handlers
  const handleOpenPermModal = (user) => {
    setSelectedUserForPerm(user);
    const userPerms = (user.permissions || []).map(Number); // แปลงเป็น int กันเหนียว
    setSelectedFeatureIds(userPerms);
    setPermModalOpen(true);
  };

  const handleToggleFeature = (id) => {
    const featureId = Number(id);
    setSelectedFeatureIds((prev) => 
      prev.includes(featureId) ? prev.filter((fid) => fid !== featureId) : [...prev, featureId]
    );
  };

  const handleSavePermissions = () => {
    if (selectedUserForPerm) {
      onUpdatePermissions(selectedUserForPerm.id, selectedFeatureIds);
      setPermModalOpen(false);
      setSelectedUserForPerm(null);
    }
  };

  // ✅ New Handler for Approval with Automatic Permission
  const handleApproveUser = async (user) => {
    try {
        // 1. Approve the user first
        await onApprove(user.id);

        // 2. Find the feature ID for "ROOM_BOOKING"
        // This assumes 'availableFeatures' has a structure like { feature_id: 1, feature_name: 'ROOM_BOOKING', ... }
        // You might need to adjust the string matching based on your exact data (e.g., 'Room Booking', 'room_booking')
        const roomBookingFeature = availableFeatures.find(
            f => f.feature_name === "Room Booking" || f.feature_name === "ROOM_BOOKING" || f.code === "ROOM_BOOKING" // Adjust key/value as needed
        );

        if (roomBookingFeature) {
            // Get existing permissions or start with empty array
            const currentPerms = (user.permissions || []).map(Number);
            
            // Add ROOM_BOOKING id if not already present
            if (!currentPerms.includes(roomBookingFeature.feature_id)) {
                const newPerms = [...currentPerms, roomBookingFeature.feature_id];
                await onUpdatePermissions(user.id, newPerms);
            }
        }
    } catch (error) {
        console.error("Error approving user or setting default permissions:", error);
        // Optional: Alert user if permission setting fails
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative z-0">
        {/* Search & Filter Bar */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex-1 w-full md:w-auto relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อ หรือ Email..." className="w-full bg-[#EFEFEF] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 transition" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
            <div className="relative">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:border-[#0095F6]">
                <option value="ALL">Role : ทั้งหมด</option>
                {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
              </select>
              <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:border-[#0095F6]">
                <option value="ALL">Status : ทั้งหมด</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="PENDING">PENDING</option>
              </select>
              <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            </div>
            <button type="button" onClick={() => setApproveFilter(prev => prev === "ALL" ? "PENDING" : prev === "PENDING" ? "APPROVED" : "ALL")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition border ${approveFilter === "ALL" ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-[#0095F6] border-transparent text-white"}`}>
              <HiFunnel className={approveFilter === "ALL" ? "text-gray-500" : "text-white"} />
              <span>Approve : {approveFilter === "ALL" ? "ทั้งหมด" : approveFilter === "PENDING" ? "รออนุมัติ" : "อนุมัติแล้ว"}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">User Info</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900">Approve</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isMe = currentUserId && String(user.id) === String(currentUserId);
                return (
                  <tr key={user.id} className={`transition ${isMe ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-700 font-bold text-xs border border-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name} {isMe && <span className="text-xs text-[#0095F6] ml-1">(คุณ)</span>}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="relative w-fit">
                        <select disabled={isMe} value={user.roleId || ""} onChange={(e) => onRoleChange(user.id, Number(e.target.value))} className={`appearance-none bg-transparent font-medium text-gray-700 pr-6 py-1 focus:outline-none ${isMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:text-[#0095F6]"}`}>
                          {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                        </select>
                        {!isMe && <HiChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <div className="flex flex-col items-center">
                        <button disabled={isMe} onClick={() => onToggleStatus(user.id, user.statusCode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out border border-transparent ${isMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${user.statusCode === "ACTIVE" ? "bg-[#34C759]" : "bg-[#E9E9EA]"}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.statusCode === "ACTIVE" ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                        <span className={`text-[10px] mt-1 font-medium ${user.statusCode === "ACTIVE" ? "text-green-500" : "text-gray-400"}`}>{user.statusCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      {user.statusCode === "PENDING" ? (
                        <button 
                            onClick={() => handleApproveUser(user)} // ✅ Updated Handler
                            className="bg-[#0095F6] hover:bg-[#1877F2] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                        >
                            อนุมัติ
                        </button>
                      ) : (
                        <span className={`text-xs flex justify-center items-center gap-1 font-medium px-3 py-1 rounded-lg w-fit mx-auto ${user.statusCode === "INACTIVE" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>{user.statusCode}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      {!isMe && (
                        <div className="flex items-center justify-center gap-2">
                          {/* ✅ ปุ่ม Permission */}
                          <button onClick={() => handleOpenPermModal(user)} className="bg-gray-100 hover:bg-blue-100 text-[#0095F6] p-2 rounded-lg transition" title="สิทธิ์การใช้งาน">
                            <HiShieldCheck className="text-lg" />
                          </button>
                          <button onClick={() => handleOpenPasswordModal(user)} className="bg-gray-100 hover:bg-yellow-100 text-yellow-600 p-2 rounded-lg transition" title="เปลี่ยนรหัสผ่าน">
                            <HiKey className="text-lg" />
                          </button>
                          <button onClick={() => onDeleteUser(user.id)} className="bg-gray-100 hover:bg-red-100 text-[#ED4956] p-2 rounded-lg transition" title="ลบผู้ใช้งาน">
                            <HiXMark className="text-lg" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">ไม่พบผู้ใช้</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h3>
              <button onClick={() => setPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiXMark className="text-xl"/></button>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 mb-4">เปลี่ยนรหัสให้: <span className="font-bold text-[#0095F6]">{selectedUserForPwd?.name}</span></div>
              <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="รหัสผ่านใหม่..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#0095F6] focus:ring-2 focus:ring-[#0095F6]/20 transition" />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setPasswordModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200">ยกเลิก</button>
              <button onClick={handleSavePassword} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#0095F6] hover:bg-[#1877F2]">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Permission Modal */}
      {permModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">กำหนดสิทธิ์การใช้งาน</h3>
                <button onClick={() => setPermModalOpen(false)} className="text-gray-400 hover:text-gray-600"><HiXMark className="text-xl"/></button>
            </div>
            <div className="p-6">
                <div className="text-sm text-gray-500 mb-6">
                    เลือกฟีเจอร์ให้: <span className="font-bold text-[#0095F6]">{selectedUserForPerm?.name}</span>
                </div>
                <div className="space-y-3">
                    {availableFeatures.length > 0 ? (
                        availableFeatures.map((feature) => {
                            const isChecked = selectedFeatureIds.includes(feature.feature_id);
                            return (
                                <label key={feature.feature_id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${isChecked ? 'border-[#0095F6] bg-blue-50/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isChecked ? 'bg-blue-100 text-[#0095F6]' : 'bg-gray-100 text-gray-400'}`}>
                                            <HiShieldCheck className="text-lg" />
                                        </div>
                                        <span className={`text-sm font-semibold ${isChecked ? 'text-gray-800' : 'text-gray-500'}`}>{feature.feature_name}</span>
                                    </div>
                                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${isChecked ? 'bg-[#0095F6]' : 'bg-gray-200'}`}>
                                        <input type="checkbox" className="hidden" checked={isChecked} onChange={() => handleToggleFeature(feature.feature_id)} />
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                </label>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-400 py-4">ไม่พบข้อมูลฟีเจอร์</div>
                    )}
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                <button onClick={() => setPermModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition">ยกเลิก</button>
                <button onClick={handleSavePermissions} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#0095F6] hover:bg-[#1877F2] shadow-sm transition">บันทึกสิทธิ์</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}