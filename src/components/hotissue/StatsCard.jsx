"use client";

import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function StatsCard({
  title,
  icon,
  total,
  detail,
  // สำหรับการ์ด Total Cases
  isTotalCard = false,
  weekLabel,
  weekDone,
  prevWeekLabel,
  prevWeekTotal = 0,
  prevWeekDone = 0,
  canPrev,
  canNext,
  onPrevWeek,
  onNextWeek,
  // สำหรับการ์ดประเภท (Hot / Complaints / Teamwork)
  doneCombined, // ✅ DONE + CLOSED ที่คำนวณมาจากหน้าหลัก
}) {
  const safeDetail = {
    open: detail?.open ?? 0,
    progress: detail?.progress ?? 0,
    // ✅ แก้ไข: ถ้าไม่มี doneCombined ส่งมา ให้เอา done + closed จาก detail มารวมกันเอง
    done: doneCombined ?? ((detail?.done ?? 0) + (detail?.closed ?? 0)),
  };

  // ================== การ์ด Total Cases ==================
  if (isTotalCard) {
    const currentTotal = total ?? 0;
    const currentDone = weekDone ?? 0;
    const prevTotal = prevWeekTotal ?? 0;
    const prevDone = prevWeekDone ?? 0;

    // สัดส่วน Done/Total
    const currentDonePct =
      currentTotal > 0 ? Math.min(100, (currentDone / currentTotal) * 100) : 0;

    const prevDonePct =
      prevTotal > 0 ? Math.min(100, (prevDone / prevTotal) * 100) : 100;

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full">
        {/* Header + ปุ่มเลื่อนสัปดาห์ */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 text-xl text-gray-700 shadow-sm border border-white">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">
              {title}
            </h3>
            {weekLabel && (
              <p className="mt-0.5 text-xs text-gray-500 font-medium">{weekLabel}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevWeek}
              disabled={!canPrev}
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition ${
                !canPrev ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <HiChevronLeft />
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              disabled={!canNext}
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition ${
                !canNext ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <HiChevronRight />
            </button>
          </div>
        </div>

        {/* ตัวเลขรวมของสัปดาห์ที่เลือก */}
        <div className="text-4xl font-bold mb-2 text-gray-900 tracking-tight">
          {currentTotal}
        </div>

        {/* mini chart เปรียบเทียบสัปดาห์นี้ vs สัปดาห์ก่อน */}
        <div className="mt-6 space-y-4">
          {/* สัปดาห์นี้ */}
          <div>
            <div className="flex justify-between mb-1.5 text-xs">
              <span className="font-semibold text-gray-600">
                สัปดาห์นี้
              </span>
              <span className="font-medium text-gray-900">
                {currentTotal} เคส · Done {currentDone}
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              {/* พื้นหลัง: Gradient IG */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-20" />
              {/* แทบ Done: IG Green */}
              <div
                className="relative h-full bg-[#34C759] rounded-full"
                style={{ width: `${currentDonePct}%` }}
              />
            </div>
          </div>

          {/* สัปดาห์ก่อน */}
          {prevWeekLabel && (
            <div>
              <div className="flex justify-between mb-1.5 text-xs">
                <span className="text-gray-400 font-medium">สัปดาห์ก่อน</span>
                <span className="font-medium text-gray-500">
                  {prevTotal} เคส · Done {prevDone}
                </span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="relative h-full rounded-full bg-[#34C759]/50"
                  style={{ width: `${prevDonePct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================== การ์ดอื่น ๆ (Hot / Complaints / Teamwork) ==================
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-xl text-gray-600 border border-gray-100">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {title}
            </h3>
            <div className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
              {total}
            </div>
          </div>
        </div>
      </div>

      {/* แถบสถานะสีอ่อน Minimal */}
      <div className="space-y-3">
        {/* OPEN */}
        <div className="flex items-center justify-between text-sm group">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ED4956]"></span>
            <span className="text-gray-600 font-medium">Open</span>
          </div>
          <span className="font-bold text-[#ED4956] bg-red-50 px-2 py-0.5 rounded text-xs">
            {safeDetail.open}
          </span>
        </div>

        {/* IN PROGRESS */}
        <div className="flex items-center justify-between text-sm group">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-gray-600 font-medium">In Progress</span>
          </div>
          <span className="font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-xs">
            {safeDetail.progress}
          </span>
        </div>

        {/* DONE */}
        <div className="flex items-center justify-between text-sm group">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
            <span className="text-gray-600 font-medium">Done</span>
          </div>
          <span className="font-bold text-[#34C759] bg-green-50 px-2 py-0.5 rounded text-xs">
            {safeDetail.done}
          </span>
        </div>
      </div>
    </div>
  );
}