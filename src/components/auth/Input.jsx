export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col space-y-1.5">
      {/* Label สีเทาเข้ม สะอาดตา */}
      <label className="text-xs font-semibold text-gray-700 ml-1">{label}</label>
      <input
        className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-gray-300 rounded-md text-sm text-gray-900 focus:border-gray-400 focus:ring-0 outline-none transition-colors placeholder-gray-400"
        {...props}
      />
    </div>
  );
}