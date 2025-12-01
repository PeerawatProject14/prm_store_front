"use client";

import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function StatsCard({
  title,
  icon,
  total,
  detail,
  isTotalCard = false,
  
  // Props สำหรับการ์ด Total
  label,      
  doneCount,  
  onPrev,     
  onNext,     

  // Props สำหรับการ์ดประเภท
  weeklyCount,

  // Props เดิม
  doneCombined, 
}) {
  const safeDetail = {
    open: detail?.open ?? 0,
    progress: detail?.progress ?? 0,
    done: doneCombined ?? ((detail?.done ?? 0) + (detail?.closed ?? 0)),
  };

  // ================== 1. การ์ด Total Cases (Switchable View) ==================
  if (isTotalCard) {
    const currentTotal = total ?? 0;
    const currentDone = doneCount ?? 0;
    const progressPct = currentTotal > 0 ? Math.min(100, (currentDone / currentTotal) * 100) : 0;

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm w-full transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 text-xl text-gray-700 shadow-sm border border-white">
                {icon}
             </div>
             <div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                {label && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
                )}
             </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={onNext} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-4xl font-bold mb-6 text-gray-900 tracking-tight animate-fade-in">
          {currentTotal}
        </div>
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-600">Performance</span>
                <span className="font-medium text-gray-900">
                   {currentTotal} Cases · Done {currentDone}
                </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-20" />
                <div className="relative h-full bg-[#34C759] rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
        </div>
      </div>
    );
  }

  // ================== 2. การ์ดประเภท (Hot/Complain/Teamwork) ==================
  const showSplitStats = typeof weeklyCount !== 'undefined';

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm w-full hover:border-gray-300 transition-colors flex flex-col justify-between">
       {/* Header */}
       <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-lg text-gray-600 border border-gray-100">
            {icon}
          </div>
          <h3 className="text-sm font-bold text-gray-900">
             {title}
          </h3>
       </div>

       {/* ✅ Content ส่วนที่ 1: Split View (Total | Weekly) */}
       {showSplitStats ? (
          <div className="flex items-center w-full pt-1 pb-4 mb-3 border-b border-gray-100">
             {/* ครึ่งซ้าย: Total */}
             <div className="flex-1 flex flex-col justify-center border-r border-gray-100 pr-4">
                <span className="text-3xl font-bold text-gray-900 tracking-tight">{total}</span>
                <span className="text-xs text-gray-500 font-medium mt-1">Total Cases</span>
             </div>

             {/* ครึ่งขวา: Weekly */}
             <div className="flex-1 flex flex-col justify-center pl-6">
                <span className="text-3xl font-bold text-[#0095F6] tracking-tight">+{weeklyCount}</span>
                <span className="text-xs text-gray-500 font-medium mt-1">This Week</span>
             </div>
          </div>
       ) : (
          <div className="text-3xl font-bold text-gray-900 mb-4">{total}</div>
       )}

       {/* ✅ Content ส่วนที่ 2: Status Breakdown List (นำกลับมาแสดง) */}
       <div className="space-y-3">
            <div className="flex items-center justify-between text-sm group">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ED4956]"></span>
                <span className="text-gray-600 font-medium">Open</span>
            </div>
            <span className="font-bold text-[#ED4956] bg-red-50 px-2 py-0.5 rounded text-xs">
                {safeDetail.open}
            </span>
            </div>
            <div className="flex items-center justify-between text-sm group">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="text-gray-600 font-medium">In Progress</span>
            </div>
            <span className="font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-xs">
                {safeDetail.progress}
            </span>
            </div>
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