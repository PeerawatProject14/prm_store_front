import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import UserTable from "@/components/admin/UserTable";
import Settings from "@/components/admin/Settings";
import { HiChevronLeft, HiUsers, HiCog6Tooth } from "react-icons/hi2";
import {
  fetchAllUsers,
  fetchAllRoles,
  fetchUserProfile,
  approveUserApi,
  updateStatusApi,
  updateRoleApi,
  deleteUserApi,
} from "@/services/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

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
    }));
    setUsers(formattedUsers);
  };

  const loadRoles = async () => {
    const data = await fetchAllRoles();
    setRoles(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [userData] = await Promise.all([
           fetchUserProfile().catch(() => null), 
           loadUsers(),
           loadRoles()
        ]);

        if (userData) {
            console.log("✅ Logged in as:", userData);
            // ใช้ .id หรือ .user_id ตามที่ API ส่งมา
            setCurrentUserId(userData.id || userData.user_id); 
        } else {
            console.warn("⚠️ ไม่พบข้อมูลผู้ใช้ปัจจุบัน");
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
    // ยังคงกันเหนียวไว้ เผื่อ Hack HTML
    if (currentUserId && String(userId) === String(currentUserId)) return;

    try {
      await updateRoleApi(userId, newRoleId);
      const role = roles.find((r) => r.role_id === Number(newRoleId));
      alert(`อัปเดต Role เป็น ${role ? role.role_name : newRoleId} สำเร็จ`);
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("เปลี่ยน Role ไม่สำเร็จ");
    }
  };

  const handleToggleStatus = async (id, currentStatusCode) => {
    if (currentUserId && String(id) === String(currentUserId)) return;

    const newStatusCode =
      currentStatusCode === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateStatusApi(id, newStatusCode);
      alert(`เปลี่ยนสถานะเป็น ${newStatusCode} สำเร็จ`);
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleApprove = async (id) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    const isOrgEmail = targetUser.email?.toLowerCase().endsWith("@psolutions.co.th");
    let message = "ยืนยันการอนุมัติผู้ใช้นี้?";

    if (!isOrgEmail) {
      message = `⚠️ แจ้งเตือน: ผู้ใช้นี้ (${targetUser.email}) ไม่ได้ใช้อีเมลองค์กร (@psolutions.co.th)\n\nต้องการยืนยันการ approve หรือไม่?`;
    }

    if (!confirm(message)) return;

    try {
      await approveUserApi(id);
      alert("อนุมัติผู้ใช้สำเร็จ!");
      loadUsers();
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
      alert("ลบผู้ใช้งานสำเร็จ");
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("ลบผู้ใช้งานไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-3">
         <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-[#0095F6] rounded-full"></div>
         <span className="text-gray-400 font-medium text-sm">Loading Admin Panel...</span>
      </main>
    );
  }

  const title = activeTab === "users" ? "User Management" : "System Settings";
  const subtitle = activeTab === "users"
      ? "จัดการสิทธิ์และสถานะผู้ใช้งานในระบบ"
      : "เปิด/ปิดการใช้งานโมดูลหลัก เช่น Hot Issue และ Room Booking";

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">{subtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${
                    activeTab === "users"
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
                  ${
                    activeTab === "settings"
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
              กลับสู่หน้าแรก
            </Link>
          </div>
        </header>

        <div className="animate-fade-in-up">
            {activeTab === "users" ? (
            <UserTable
                users={users}
                roles={roles}
                currentUserId={currentUserId} // ✅ เพิ่มบรรทัดนี้ เพื่อส่ง ID ไปให้ Table
                onRoleChange={handleRoleChange}
                onToggleStatus={handleToggleStatus}
                onApprove={handleApprove}
                onDeleteUser={handleDeleteUser}
            />
            ) : (
            <Settings />
            )}
        </div>
      </div>
    </main>
  );
}