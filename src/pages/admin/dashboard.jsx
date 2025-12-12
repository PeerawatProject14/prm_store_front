import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import UserTable from "@/components/admin/UserTable";
import Settings from "@/components/admin/Settings";
import { HiChevronLeft, HiUsers, HiCog6Tooth } from "react-icons/hi2";
// ✅ Import API calls
import {
  fetchAllUsers,
  fetchAllRoles,
  fetchUserProfile,
  approveUserApi,
  updateStatusApi,
  updateRoleApi,
  deleteUserApi,
  fetchModules,
  updateUserPermissionsApi 
} from "@/services/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ Active Tab State (Default: 'users')
  const [activeTab, setActiveTab] = useState("users");

  const loadUsers = async () => {
    const data = await fetchAllUsers();
    const formattedUsers = data.map((user) => ({
      id: user.user_id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      statusCode: user.status_code,
      permissions: user.permissions || []
    }));
    setUsers(formattedUsers);
  };

  const loadRoles = async () => {
    const data = await fetchAllRoles();
    setRoles(data);
  };

  const loadModules = async () => {
    try {
      const data = await fetchModules();
      const formattedModules = data.map(m => ({
        feature_id: m.module_id,
        feature_name: m.name
      }));
      setModules(formattedModules);
    } catch (error) {
      console.error("Failed to load modules", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [userData] = await Promise.all([
          fetchUserProfile().catch(() => null),
          loadUsers(),
          loadRoles(),
          loadModules()
        ]);

        if (userData) {
          setCurrentUserId(userData.id || userData.user_id);
        }

      } catch (e) {
        console.error(e);
        const status = e?.response?.status;
        if (status === 403) {
          alert("คุณไม่มีสิทธิ์เข้าหน้านี้");
          router.replace("/dashboard");
          return;
        }
        alert("โหลดข้อมูล Admin ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // -------- Handlers --------
  const handleRoleChange = async (userId, newRoleId) => {
    if (currentUserId && String(userId) === String(currentUserId)) return;
    try {
      await updateRoleApi(userId, newRoleId);
      loadUsers();
    } catch (e) {
      alert("เปลี่ยน Role ไม่สำเร็จ");
    }
  };

  const handleToggleStatus = async (id, currentStatusCode) => {
    if (currentUserId && String(id) === String(currentUserId)) return;
    const newStatusCode = currentStatusCode === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStatusApi(id, newStatusCode);
      loadUsers();
    } catch (e) {
      alert("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  // ✅ Updated Approve Handler (Auto-grant ROOM_BOOKING)
  const handleApprove = async (id) => {
    if (!confirm("ยืนยันการอนุมัติ?")) return;
    try {
      // 1. Approve User (Active Status)
      await approveUserApi(id);

      // 2. Auto-grant "Room Booking" Permission
      // หา ID ของ Room Booking จาก modules ที่โหลดมา
      const roomBookingModule = modules.find(m => 
          m.feature_name === "Room Booking" || m.feature_name === "ROOM_BOOKING"
      );

      if (roomBookingModule) {
          // ยิง API บันทึกสิทธิ์ (array [id])
          await updateUserPermissionsApi(id, [roomBookingModule.feature_id]);
      }

      loadUsers();
      alert("อนุมัติผู้ใช้สำเร็จ (เพิ่มสิทธิ์ Room Booking อัตโนมัติ)");
    } catch (e) {
      console.error(e);
      alert("อนุมัติไม่สำเร็จ");
    }
  };

  const handleDeleteUser = async (id) => {
    if (currentUserId && String(id) === String(currentUserId)) return;
    if (!confirm("ต้องการลบผู้ใช้งานคนนี้จริงหรือไม่?")) return;
    try {
      await deleteUserApi(id);
      loadUsers();
    } catch (e) {
      alert("ลบผู้ใช้งานไม่สำเร็จ");
    }
  };

  const handleUpdatePermissions = async (userId, selectedFeatureIds) => {
    try {
      await updateUserPermissionsApi(userId, selectedFeatureIds);
      alert("อัปเดตสิทธิ์การใช้งานเรียบร้อย");
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("อัปเดตสิทธิ์ไม่สำเร็จ");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Title Logic
  const title = activeTab === "users" ? "User Management" : "System Settings";
  const subtitle = activeTab === "users" 
    ? "จัดการสิทธิ์และสถานะผู้ใช้งานในระบบ" 
    : "ตั้งค่าการเปิด/ปิด Feature ต่างๆ ของระบบ";

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">

        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">{subtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* ✅ Tab Switcher (Users / Settings) */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${activeTab === "users"
                    ? "bg-[#0095F6] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <HiUsers className="text-lg" />
                จัดการผู้ใช้งาน
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${activeTab === "settings"
                    ? "bg-[#0095F6] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <HiCog6Tooth className="text-lg" />
                ตั้งค่าระบบ
              </button>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#EFEFEF] text-gray-900 hover:bg-gray-200 transition"
            >
              <HiChevronLeft className="text-lg" />
              กลับหน้าหลัก
            </Link>
          </div>
        </header>

        <div className="animate-fade-in-up">
          {activeTab === "users" ? (
            <UserTable
              users={users}
              roles={roles}
              availableFeatures={modules}
              currentUserId={currentUserId}
              onRoleChange={handleRoleChange}
              onToggleStatus={handleToggleStatus}
              onApprove={handleApprove} // ✅ ใช้ handleApprove ใหม่ที่มี auto-permission
              onDeleteUser={handleDeleteUser}
              onUpdatePermissions={handleUpdatePermissions}
            />
          ) : (
            <Settings />
          )}
        </div>
      </div>
    </main>
  );
}