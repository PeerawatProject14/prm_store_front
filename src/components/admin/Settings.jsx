"use client";

import { useEffect, useState } from "react";
import { fetchModules, updateModuleStatusApi } from "@/services/api";
import { HiCubeTransparent, HiCog6Tooth } from "react-icons/hi2"; // เพิ่ม icon ตกแต่ง

export default function Settings() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadModules = async () => {
    try {
      const data = await fetchModules();
      setModules(data || []);
    } catch (e) {
      console.error(e);
      alert("โหลดข้อมูลการตั้งค่าระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleToggleModule = async (code, currentEnabled) => {
    const newEnabled = !currentEnabled;

    try {
      await updateModuleStatusApi(code, newEnabled);
      setModules((prev) =>
        prev.map((m) =>
          m.code === code ? { ...m, is_enabled: newEnabled } : m
        )
      );
    } catch (e) {
      console.error(e);
      alert("อัปเดตสถานะระบบไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
        <span className="text-sm text-gray-400 font-medium">กำลังโหลดการตั้งค่า...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-start gap-4">
        <div className="p-3 bg-gray-50 rounded-full">
            <HiCog6Tooth className="text-2xl text-gray-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            ตั้งค่าระบบ
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            เปิด / ปิด การใช้งานโมดูลหลัก เช่น Hot Issue และ Room Booking
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-6 grid gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <div
            key={m.code}
            // ✅ Card สไตล์ IG: ขาว มีขอบบางๆ
            className="group rounded-xl border border-gray-200 p-5 flex flex-col justify-between hover:border-gray-300 transition-colors duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    {/* Module Icon Placeholer */}
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <HiCubeTransparent />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                    {m.name}
                    </h3>
                </div>
                
                {/* Status Badge แบบ Minimal */}
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                    ${m.is_enabled 
                        ? "bg-green-50 text-[#34C759]" 
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                    {m.is_enabled ? "Active" : "Disabled"}
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed pl-[44px]">
                {m.description || m.code}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 pl-[44px]">
              <span className="text-xs font-medium text-gray-400">
                สถานะ:{" "}
                <span className={m.is_enabled ? "text-gray-900" : "text-gray-400"}>
                  {m.is_enabled ? "เปิดใช้งาน" : "ปิดการใช้งาน"}
                </span>
              </span>

              {/* ✅ Toggle Switch สไตล์ iOS/IG */}
              <button
                onClick={() => handleToggleModule(m.code, m.is_enabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ease-in-out border border-transparent
                  ${
                    m.is_enabled ? "bg-[#34C759]" : "bg-[#E9E9EA]" // เขียว iOS หรือ เทา
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${m.is_enabled ? "translate-x-5" : "translate-x-0.5"}
                  `}
                />
              </button>
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400 text-sm">
            ไม่พบข้อมูลการตั้งค่าโมดูล
          </div>
        )}
      </div>
    </div>
  );
}