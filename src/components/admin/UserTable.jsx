// src/components/admin/UserTable.jsx
import { useState, useMemo } from "react";
import { HiMagnifyingGlass, HiFunnel, HiChevronDown } from "react-icons/hi2";

export default function UserTable({
  users,
  roles,
  onRoleChange,
  onToggleStatus,
  onApprove,
  onDeleteUser = () => {},
}) {
  // --------------------- LOCAL FILTER STATE ---------------------
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [approveFilter, setApproveFilter] = useState("ALL");

  // --------------------- FILTER LOGIC (เดิม) ---------------------------
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchesRole =
        roleFilter === "ALL" || String(u.roleId) === String(roleFilter);
      const matchesStatus =
        statusFilter === "ALL" || u.statusCode === statusFilter;
      let matchesApprove = true;
      if (approveFilter === "PENDING") {
        matchesApprove = u.statusCode === "PENDING";
      } else if (approveFilter === "APPROVED") {
        matchesApprove = u.statusCode !== "PENDING";
      }
      return matchesSearch && matchesRole && matchesStatus && matchesApprove;
    });
  }, [users, search, roleFilter, statusFilter, approveFilter]);

  // ==============================================================
  return (
    // ✅ Card สไตล์ IG: ขาวสะอาด ขอบมน
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      
      {/* ----------------------- SEARCH + FILTER BAR ----------------------- */}
      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
        
        {/* SEARCH: พื้นเทาอ่อน ไม่มีขอบ (IG Style) */}
        <div className="flex-1 w-full md:w-auto relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ หรือ Email..." 
            className="w-full bg-[#EFEFEF] rounded-lg pl-10 pr-4 py-2
                       text-sm text-gray-900 placeholder-gray-500
                       focus:outline-none focus:ring-0 transition"
          />
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8
                         text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:border-[#0095F6]"
            >
              <option value="ALL">Role : ทั้งหมด</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8
                         text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:border-[#0095F6]"
            >
              <option value="ALL">Status : ทั้งหมด</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
            </select>
            <HiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          </div>

          {/* Approve Filter Button */}
          <button
            type="button"
            onClick={() => {
              setApproveFilter((prev) => {
                if (prev === "ALL") return "PENDING";
                if (prev === "PENDING") return "APPROVED";
                return "ALL";
              });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition border
              ${
                approveFilter === "ALL"
                  ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "bg-[#0095F6] border-transparent text-white" // ✅ สีฟ้า IG เมื่อกดเลือก
              }`}
          >
            <HiFunnel className={approveFilter === "ALL" ? "text-gray-500" : "text-white"} />
            <span>
              Approve :&nbsp;
              {approveFilter === "ALL"
                ? "ทั้งหมด"
                : approveFilter === "PENDING"
                ? "รออนุมัติ"
                : "อนุมัติแล้ว"}
            </span>
          </button>
        </div>
      </div>

      {/* ----------------------------- TABLE ----------------------------- */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">User Info</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Approve</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                
                {/* 1. Info */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    {/* Avatar สีรุ้งสไตล์ IG (เพิ่มลูกเล่นนิดนึง) */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-700 font-bold text-xs border border-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>

                {/* 2. Role Dropdown: มินิมอล */}
                <td className="px-6 py-4 align-middle">
                  <div className="relative w-fit">
                    <select
                        value={user.roleId || ""}
                        onChange={(e) => onRoleChange(user.id, Number(e.target.value))}
                        className="appearance-none bg-transparent font-medium text-gray-700 pr-6 py-1 cursor-pointer focus:outline-none hover:text-[#0095F6]"
                    >
                        {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                        </option>
                        ))}
                    </select>
                    <HiChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  </div>
                </td>

                {/* 3. Status Toggle: iOS Switch */}
                <td className="px-6 py-4 text-center align-middle">
                  <div className="flex flex-col items-center">
                    <button
                        onClick={() => onToggleStatus(user.id, user.statusCode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                        user.statusCode === "ACTIVE" ? "bg-[#34C759]" : "bg-[#E9E9EA]" // เขียว iOS หรือ เทา
                        }`}
                    >
                        <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            user.statusCode === "ACTIVE" ? "translate-x-5" : "translate-x-0.5"
                        }`}
                        />
                    </button>
                    <span className={`text-[10px] mt-1 font-medium ${
                         user.statusCode === "ACTIVE" ? "text-green-500" : "text-gray-400"
                    }`}>
                        {user.statusCode}
                    </span>
                  </div>
                </td>

                {/* 4. Approve Button: สีฟ้า IG */}
                <td className="px-6 py-4 text-center align-middle">
                  {user.statusCode === "PENDING" ? (
                    <button
                      onClick={() => onApprove(user.id)}
                      // ✅ เปลี่ยนสีเป็นฟ้า IG (#0095F6) + ขอบมน lg
                      className="bg-[#0095F6] hover:bg-[#1877F2] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      อนุมัติ
                    </button>
                  ) : (
                    <span
                      className={`text-xs flex justify-center items-center gap-1 font-medium px-3 py-1 rounded-lg w-fit mx-auto
                        ${
                          user.statusCode === "INACTIVE"
                            ? "text-red-600 bg-red-50"
                            : "text-green-600 bg-green-50"
                        }`}
                    >
                      {user.statusCode}
                    </span>
                  )}
                </td>

                {/* 5. Delete User: สีแดง IG */}
                <td className="px-6 py-4 text-center align-middle">
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    // ✅ พื้นเทาอ่อน ตัวหนังสือแดง (สไตล์ปุ่มลบ IG)
                    className="bg-[#EFEFEF] hover:bg-gray-200 text-[#ED4956] px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                    title="ลบผู้ใช้งาน"
                  >
                    ลบผู้ใช้
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50">
                        <HiMagnifyingGlass className="text-2xl text-gray-400" />
                    </div>
                    <span className="font-medium text-sm">ไม่พบผู้ใช้ตามเงื่อนไขที่ค้นหา / กรองไว้</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}