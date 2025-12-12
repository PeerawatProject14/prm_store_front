"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeatureCard from "@/components/dashboard/FeatureCard";
import LogoutButton from "@/components/dashboard/LogoutButton";
// ✅ Import function ใหม่ fetchMyPermissions (ต้องไปเพิ่มใน api.js)
import { fetchModules, fetchMyPermissions } from "@/services/api";

export default function Dashboard() {
  const [modules, setModules] = useState([]);
  const [myPermissions, setMyPermissions] = useState([]); // ✅ เก็บสิทธิ์ของตัวเอง
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // โหลดพร้อมกัน 2 อย่าง: 
        // 1. Module Setting (Global on/off) 
        // 2. Permission ของเราเอง (My Permissions)
        const [modulesData, permissionsData] = await Promise.all([
            fetchModules().catch(() => []),
            fetchMyPermissions().catch(() => [])
        ]);

        setModules(modulesData || []);
        setMyPermissions(permissionsData || []); // Array ของ code เช่น ['HOT_ISSUE']
      } catch (e) {
        console.error("Dashboard data load failed:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const getModuleByCode = (code) => modules.find((m) => m.code === code) || null;

  // Function เช็คว่า User เข้าถึงได้ไหม
  // เงื่อนไข: 
  // 1. Module ต้องเปิด (is_enabled = true)
  // 2. User ต้องมีสิทธิ์ (อยู่ใน myPermissions) หรือเป็น Admin (อาจจะเช็ค Role เพิ่มถ้าต้องการ)
  const canAccess = (moduleCode) => {
    const mod = getModuleByCode(moduleCode);
    if (!mod) return false;
    
    const isGlobalEnabled = mod.is_enabled;
    const userHasPermission = myPermissions.includes(moduleCode);
    
    return isGlobalEnabled && userHasPermission;
  };

  const hotIssueEnabled = canAccess("HOT_ISSUE");
  const roomBookingEnabled = canAccess("ROOM_BOOKING");

  // สถานะ Global (เพื่อเอาไว้โชว์ว่าปิดปรับปรุง ถ้า Global ปิด)
  const isGlobalHotIssueActive = getModuleByCode("HOT_ISSUE")?.is_enabled;
  const isGlobalRoomBookingActive = getModuleByCode("ROOM_BOOKING")?.is_enabled;

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="flex justify-end pt-6 px-6">
        <LogoutButton />
      </div>

      <div className="max-w-4xl mx-auto pb-20 pt-4">
        <DashboardHeader />

        <div className="grid gap-6 md:grid-cols-2 px-6">
          
          {/* 1. Hot Issue Card */}
          <FeatureCard
            title="Hot Issue"
            description="ระบบรายงานและติดตามปัญหาเร่งด่วน แจ้งซ่อม ร้องเรียน"
            statusLabel={
              loading
                ? "Loading..."
                : !isGlobalHotIssueActive 
                    ? "Maintenance" // ถ้าปิด Global บอกปิดปรับปรุง
                    : hotIssueEnabled 
                        ? "Active" 
                        : "No Permission" // ถ้า Global เปิด แต่เราไม่มีสิทธิ์
            }
            statusBgClass={
              loading ? "bg-gray-100" : (hotIssueEnabled ? "bg-green-50" : "bg-red-50")
            }
            statusTextClass={
              loading ? "text-gray-400" : (hotIssueEnabled ? "text-[#34C759]" : "text-[#ED4956]")
            }
            icon={<span>🔥</span>}
            iconBgClass={
              hotIssueEnabled
                ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                : "bg-gray-300"
            }
            buttonLabel={
              loading
                ? "Checking..."
                : !isGlobalHotIssueActive 
                    ? "ปิดปรับปรุง"
                    : hotIssueEnabled 
                        ? "เข้าใช้งาน" 
                        : "ไม่มีสิทธิ์เข้าถึง"
            }
            buttonBgClass={
              loading
                ? "bg-gray-300 cursor-wait"
                : hotIssueEnabled
                ? "bg-[#0095F6] hover:bg-[#1877F2]"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }
            href={hotIssueEnabled ? "/hotissue" : undefined}
            disabled={!hotIssueEnabled || loading}
          />

          {/* 2. Room Booking Card */}
          <FeatureCard
            title="Room Booking"
            description="ระบบบริหารจัดการและจองห้องประชุมออนไลน์"
            statusLabel={
              loading
                ? "Loading..."
                : !isGlobalRoomBookingActive
                    ? "Maintenance"
                    : roomBookingEnabled
                        ? "Active"
                        : "No Permission"
            }
            statusBgClass={
              loading ? "bg-gray-100" : (roomBookingEnabled ? "bg-green-50" : "bg-red-50")
            }
            statusTextClass={
              loading ? "text-gray-400" : (roomBookingEnabled ? "text-[#34C759]" : "text-[#ED4956]")
            }
            icon={<span>📅</span>}
            iconBgClass={
              roomBookingEnabled
                ? "bg-gradient-to-br from-cyan-400 to-blue-600"
                : "bg-gray-300"
            }
            buttonLabel={
              loading
                ? "Checking..."
                : !isGlobalRoomBookingActive
                    ? "ปิดปรับปรุง"
                    : roomBookingEnabled
                        ? "เข้าใช้งาน"
                        : "ไม่มีสิทธิ์เข้าถึง"
            }
            buttonBgClass={
              loading
                ? "bg-gray-300 cursor-wait"
                : roomBookingEnabled
                ? "bg-[#0095F6] hover:bg-[#1877F2]"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }
            href={roomBookingEnabled ? "/roombooking" : undefined}
            disabled={!roomBookingEnabled || loading}
          />
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 font-medium">© 2024 Piramid Solution</p>
        </div>

      </div>
    </main>
  );
}