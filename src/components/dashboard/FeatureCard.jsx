"use client";

import { useRouter } from "next/navigation";

export default function FeatureCard({
  title,
  description,
  statusLabel,
  statusBgClass,
  statusTextClass,
  icon,
  iconBgClass,
  buttonLabel,
  buttonBgClass,
  href,
  disabled,
}) {
  const router = useRouter();

  return (
    // Card: ขาวสะอาด ขอบบาง (border-gray-200) เงาจางๆ (shadow-sm)
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

      {/* Icon: ปรับให้ดูเหมือน Story Highlight (วงกลม) หรือ App Icon (Squircle) */}
      <div className="mb-4">
        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl text-white shadow-sm ${iconBgClass}`}
        >
          {icon}
        </div>
      </div>

      {/* Title + Status */}
      <div className="flex flex-col items-center gap-1 mb-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBgClass} ${statusTextClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed px-2 line-clamp-2">
        {description}
      </p>

      {/* Button: ใช้ Class ที่ส่งมา แต่ปรับ Shape ให้โค้งมนแบบ IG Buttons */}
      <button
        type="button"
        onClick={() => !disabled && router.push(href)}
        disabled={disabled}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200 ${buttonBgClass}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}