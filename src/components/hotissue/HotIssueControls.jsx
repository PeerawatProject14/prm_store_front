"use client";

import { HiMagnifyingGlass, HiFunnel, HiPlus, HiChevronDown } from "react-icons/hi2";

export default function HotIssueControls({
  search,
  setSearch,
  type,
  setType,
  status,
  setStatus,
  showActiveOnly,     
  setShowActiveOnly,  
  activeCount,
  onAddCase,
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

      {/* ------------------------------ SEARCH BAR (IG Style) ------------------------------ */}
      <div className="w-full md:flex-1 min-w-[280px]">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

          <input
            type="text"
            value={search || ""} 
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full bg-[#EFEFEF] rounded-lg pl-10 pr-4 py-2
                       text-sm text-gray-900 placeholder-gray-500
                       focus:outline-none focus:ring-0 transition"
          />
        </div>
      </div>

      {/* ------------------------------ FILTERS ------------------------------ */}
      <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">

        {/* Active Cases Toggle Button */}
        <button
          onClick={() => setShowActiveOnly && setShowActiveOnly(!showActiveOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition font-semibold text-sm
            ${showActiveOnly 
              ? "bg-[#0095F6] border-transparent text-white" // Active = IG Blue
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
        >
          <HiFunnel className={showActiveOnly ? "text-white" : "text-gray-500"} />
          <span>Active Cases ({activeCount})</span>
        </button>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={type || ""}
            onChange={(e) => setType && setType(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 shadow-sm
                       text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none hover:bg-gray-50"
          >
            <option value="All">All Types</option>
            <option value="HOT">Hot Issue</option>
            <option value="COMPLAIN">Complaints</option>
            <option value="TEAMWORK">Teamwork</option>
          </select>
          <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status || ""}
            onChange={(e) => setStatus && setStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 shadow-sm
                       text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none hover:bg-gray-50"
          >
            <option value="All">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="CLOSED">Closed</option>
          </select>
          <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
        </div>
      </div>

      {/* ------------------------------ ADD NEW CASE (IG Primary Button) ------------------------------ */}
      <button
        onClick={onAddCase}
        className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#0095F6] hover:bg-[#1877F2]
                   text-white px-4 py-2 rounded-lg shadow-sm transition transform active:scale-95 font-semibold text-sm"
      >
        <HiPlus className="text-lg" />
        <span>Add New Case</span>
      </button>

    </div>
  );
}