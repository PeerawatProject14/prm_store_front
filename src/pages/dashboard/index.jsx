"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FeatureCard from "@/components/dashboard/FeatureCard";
import LogoutButton from "@/components/dashboard/LogoutButton"; // ✅ กลับมาใช้ LogoutButton เดิม
import { fetchModules } from "@/services/api";

export default function Dashboard() {
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // โหลดสถานะ HOT_ISSUE / ROOM_BOOKING จาก backend
  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await fetchModules(); // GET /admin/modules
        setModules(data || []);
      } catch (e) {
        console.error("โหลด module settings ไม่สำเร็จ:", e);
      } finally {
        setLoadingModules(false);
      }
    };
    loadModules();
  }, []);

  const getModuleByCode = (code) =>
    modules.find((m) => m.code === code) || null;

  const hotIssueModule = getModuleByCode("HOT_ISSUE");
  const roomBookingModule = getModuleByCode("ROOM_BOOKING");

  const hotIssueEnabled = !!hotIssueModule?.is_enabled;
  const roomBookingEnabled = !!roomBookingModule?.is_enabled;

  return (
    // พื้นหลังสีเทาอ่อนสไตล์ IG (#FAFAFA)
    <main className="min-h-screen bg-[#FAFAFA]">
      
      {/* ใช้ LogoutButton เดิมที่มีอยู่แล้ว */}
      <div className="flex justify-end pt-6 px-6">
        <LogoutButton />
      </div>

      <div className="max-w-4xl mx-auto pb-20 pt-4">
        
        {/* Header (Logo + Title) */}
        <DashboardHeader />

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 px-6">
          
          {/* 1. Hot Issue Card */}
          <FeatureCard
            title="Hot Issue"
            description="ระบบรายงานและติดตามปัญหาเร่งด่วน แจ้งซ่อม ร้องเรียน"
            statusLabel={
              loadingModules
                ? "Loading..."
                : hotIssueEnabled
                ? "Active"
                : "Inactive"
            }
            statusBgClass={
              loadingModules
                ? "bg-gray-100"
                : hotIssueEnabled
                ? "bg-green-50" // พื้นหลังเขียวอ่อน
                : "bg-red-50"
            }
            statusTextClass={
              loadingModules
                ? "text-gray-400"
                : hotIssueEnabled
                ? "text-[#34C759]" // เขียว iOS
                : "text-[#ED4956]" // แดง IG
            }
            icon={<span>🔥</span>}
            iconBgClass={
              hotIssueEnabled
                // Gradient สไตล์ IG Story (ม่วง-ชมพู-ส้ม)
                ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                : "bg-gray-300"
            }
            buttonLabel={
              loadingModules
                ? "Checking..."
                : hotIssueEnabled
                ? "เข้าใช้งาน"
                : "ปิดปรับปรุง"
            }
            buttonBgClass={
              loadingModules
                ? "bg-gray-300 cursor-wait"
                : hotIssueEnabled
                ? "bg-[#0095F6] hover:bg-[#1877F2]" // ฟ้า IG
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }
            href={hotIssueEnabled ? "/hotissue" : undefined}
            disabled={!hotIssueEnabled || loadingModules}
          />

          {/* 2. Room Booking Card */}
          <FeatureCard
            title="Room Booking"
            description="ระบบบริหารจัดการและจองห้องประชุมออนไลน์"
            statusLabel={
              loadingModules
                ? "Loading..."
                : roomBookingEnabled
                ? "Active"
                : "Inactive"
            }
            statusBgClass={
              loadingModules
                ? "bg-gray-100"
                : roomBookingEnabled
                ? "bg-green-50"
                : "bg-red-50"
            }
            statusTextClass={
              loadingModules
                ? "text-gray-400"
                : roomBookingEnabled
                ? "text-[#34C759]"
                : "text-[#ED4956]"
            }
            icon={<span>📅</span>}
            iconBgClass={
              roomBookingEnabled
                // Gradient ฟ้า-น้ำเงิน (Messenger style)
                ? "bg-gradient-to-br from-cyan-400 to-blue-600"
                : "bg-gray-300"
            }
            buttonLabel={
              loadingModules
                ? "Checking..."
                : roomBookingEnabled
                ? "เข้าใช้งาน"
                : "ปิดปรับปรุง"
            }
            buttonBgClass={
              loadingModules
                ? "bg-gray-300 cursor-wait"
                : roomBookingEnabled
                ? "bg-[#0095F6] hover:bg-[#1877F2]" // ฟ้า IG
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }
            href={roomBookingEnabled ? "/roombooking" : undefined}
            disabled={!roomBookingEnabled || loadingModules}
          />
        </div>
        
        {/* Footer Text เล็กๆ สไตล์ App */}
        <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 font-medium">© 2024 Piramid Solution</p>
        </div>

      </div>
    </main>
  );
}