import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Swal from "sweetalert2";
import { 
    HiUserCircle, HiEnvelope, HiBriefcase, HiPencilSquare, 
    HiKey, HiChevronLeft, HiXMark, HiPhone, HiBuildingOffice
} from "react-icons/hi2";
import { fetchUserProfile, updateProfileApi, changeMyPasswordApi, fetchDepartments } from "@/services/api";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [departments, setDepartments] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    
    // ✅ เพิ่ม email ใน formData
    const [formData, setFormData] = useState({ 
        first_name: "", 
        last_name: "",
        phone_number: "",
        job_title: "",
        department_id: "",
        email: "" 
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    useEffect(() => {
        const init = async () => {
            try {
                const [userData, deptData] = await Promise.all([
                    fetchUserProfile(),
                    fetchDepartments()
                ]);
                
                setUser(userData);
                setDepartments(deptData);

                setFormData({
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    phone_number: userData.phone_number || "",
                    job_title: userData.job_title || "",
                    department_id: userData.department_id || "",
                    email: userData.email || "" // ✅ set ค่าเริ่มต้น email
                });

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfileApi(formData);
            
            const selectedDept = departments.find(d => String(d.department_id) === String(formData.department_id));
            
            // ✅ อัปเดต UI ทันทีรวมถึง Email
            setUser(prev => ({ 
                ...prev, 
                ...formData,
                department: selectedDept ? { ...selectedDept } : prev.department 
            }));
            
            setIsEditing(false);
            Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
        } catch (error) {
            // ✅ แสดง Error ถ้า Email ซ้ำ
            const msg = error?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้';
            Swal.fire('Error', msg, 'error');
        }
    };

    // ... (handleChangePassword เหมือนเดิม) ...
    const handleChangePassword = async () => {
        // (Code เดิมของคุณ)
        if (passwordForm.newPassword !== passwordForm.confirmPassword) return Swal.fire('Error', 'รหัสผ่านใหม่ไม่ตรงกัน', 'warning');
        if (passwordForm.newPassword.length < 6) return Swal.fire('Error', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'warning');
        try {
            await changeMyPasswordApi(passwordForm.currentPassword, passwordForm.newPassword);
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            Swal.fire('Success', 'เปลี่ยนรหัสผ่านเรียบร้อย', 'success');
        } catch (error) {
            const msg = error?.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ";
            Swal.fire('Error', msg, 'error');
        }
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

    const currentDeptName = departments.find(d => d.department_id === user?.department_id)?.department_name || "-";

    return (
        <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 font-sans"
        style={{ background: 'linear-gradient(to bottom, #1f242b00, #2c4567)' }}>
            <div className="max-w-4xl mx-auto">
                
                <div className="mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-800 transition mb-4">
                        <HiChevronLeft className="text-xl mr-1" /> กลับหน้าหลัก
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">ข้อมูลส่วนตัว</h1>
                    <p className="text-gray-500">จัดการข้อมูลบัญชีผู้ใช้ของคุณ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* --- Left Column: Profile Card --- */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 p-1 mb-4">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-bold text-gray-600">
                                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user?.first_name} {user?.last_name}
                            </h2>
                            <p className="text-sm text-gray-500 mb-1">{user?.job_title || "No Job Title"}</p>
                            <p className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                                {user?.role?.role_name || "User"}
                            </p>

                            <div className="w-full border-t border-gray-100 pt-4 mt-4 space-y-3 text-left">
                                {/* ✅ แสดง Email ตรงนี้แน่นอน */}
                                <div className="flex items-center gap-3 text-sm text-gray-600 overflow-hidden">
                                    <HiEnvelope className="text-lg text-gray-400 flex-shrink-0" />
                                    <span className="truncate" title={user?.email}>{user?.email || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <HiPhone className="text-lg text-gray-400 flex-shrink-0" />
                                    <span>{user?.phone_number || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <HiBuildingOffice className="text-lg text-gray-400 flex-shrink-0" />
                                    <span>{currentDeptName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Edit Form --- */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">แก้ไขรายละเอียด</h3>
                                {!isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-sm font-semibold text-[#0095F6] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                                    >
                                        <HiPencilSquare className="text-lg" /> แก้ไข
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                {/* ชื่อ - นามสกุล (เหมือนเดิม) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ชื่อจริง</label>
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0095F6] disabled:text-gray-500 disabled:bg-gray-100 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">นามสกุล</label>
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0095F6] disabled:text-gray-500 disabled:bg-gray-100 transition"
                                        />
                                    </div>
                                </div>

                                {/* Job Title & Dept (เหมือนเดิม) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ตำแหน่งงาน (Job Title)</label>
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={formData.job_title}
                                            onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0095F6] disabled:text-gray-500 disabled:bg-gray-100 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">แผนก (Department)</label>
                                        <select
                                            disabled={!isEditing}
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0095F6] disabled:text-gray-500 disabled:bg-gray-100 transition appearance-none"
                                        >
                                            <option value="">-- ระบุแผนก --</option>
                                            {departments.map(d => (
                                                <option key={d.department_id} value={d.department_id}>
                                                    {d.department_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">เบอร์โทรศัพท์</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0095F6] disabled:text-gray-500 disabled:bg-gray-100 transition"
                                    />
                                </div>

                                {/* ✅ Email (แก้ไขได้แล้ว) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Email {isEditing && <span className="text-red-500 text-[10px] ml-1">*หากเปลี่ยนต้อง Login ใหม่</span>}
                                    </label>
                                    <input 
                                        type="email" 
                                        disabled={!isEditing} // ✅ ปลดล็อกเมื่อกด Edit
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0095F6] disabled:text-gray-500 disabled:bg-gray-100 transition"
                                    />
                                </div>

                                {/* Action Buttons */}
                                {isEditing ? (
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    first_name: user.first_name || "",
                                                    last_name: user.last_name || "",
                                                    phone_number: user.phone_number || "",
                                                    job_title: user.job_title || "",
                                                    department_id: user.department_id || "",
                                                    email: user.email || "" // Reset ค่า
                                                });
                                            }}
                                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button 
                                            type="submit"
                                            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0095F6] hover:bg-[#1877F2] shadow-sm transition"
                                        >
                                            บันทึก
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-6 border-t border-gray-100">
                                        <button 
                                            type="button"
                                            onClick={() => setShowPasswordModal(true)}
                                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-lg w-full justify-center transition"
                                        >
                                            <HiKey className="text-lg" /> เปลี่ยนรหัสผ่าน
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal (เหมือนเดิม) */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* ... (Modal Content เดิม) ... */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                                <HiXMark className="text-xl"/>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
                                <input 
                                    type="password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0095F6]/20 focus:border-[#0095F6] outline-none transition"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                                <input 
                                    type="password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0095F6]/20 focus:border-[#0095F6] outline-none transition"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                                <input 
                                    type="password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0095F6]/20 focus:border-[#0095F6] outline-none transition"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={handleChangePassword}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#0095F6] hover:bg-[#1877F2] transition shadow-sm"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}