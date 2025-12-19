"use client";

import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi2";

export default function Header({ dateText }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Weekly Meeting Hot Issue Discussion
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Piramid Solutions Co., Ltd</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
        style={{ boxShadow: '2px 5px 6px 2px rgba(0, 0, 0, 0.2)' }}>
            {dateText}
        </span>

        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg bg-[#EFEFEF] text-gray-900 hover:bg-gray-200 transition"
          style={{ boxShadow: '2px 5px 6px 2px rgba(0, 0, 0, 0.2)' }}
        >
          <HiChevronLeft className="text-lg"/>
          กลับสู่หน้าแรก
        </Link>
      </div>
    </div>
  );
}