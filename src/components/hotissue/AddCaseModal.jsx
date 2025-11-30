"use client";

import { useState, useEffect } from "react";
import { createNewCase } from "@/services/api";
import { HiXMark } from "react-icons/hi2";

export default function AddCaseModal({ isOpen, onClose, onSuccess }) {
  
  // สร้าง state เก็บชื่อคน Login
  const [currentUserName, setCurrentUserName] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    case_type_id: "1",
    status_id: "1",
    assigned_to: "",
    target_date: "",
    next_step_followup: "",
    remark: ""
  });

  // ฟังก์ชันถอดรหัส Token (JWT Decode)
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // ⭐ useEffect: ดึงชื่อจาก Token เมื่อเปิด Modal
  useEffect(() => {
    if (isOpen) {
      // 1. Reset Form
      setForm({
        title: "",
        description: "",
        case_type_id: "1",
        status_id: "1",
        assigned_to: "",
        target_date: "",
        next_step_followup: "",
        remark: ""
      });

      // 2. ดึง Token และถอดรหัสหาชื่อ
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
        
        if (token) {
          const u = parseJwt(token);
          
          if (u) {
            const fName = u.first_name || u.firstname || u.firstName || u.name || u.username || u.sub || "";
            const lName = u.last_name || u.lastname || u.lastName || "";
            
            const fullName = lName ? `${fName} ${lName}` : fName;
            
            setCurrentUserName(fullName || "Unknown User");
          } else {
            setCurrentUserName("Invalid Token Data");
          }
        } else {
            setCurrentUserName("No Token Found");
        }
      } catch (err) {
        console.error("Error reading user data:", err);
        setCurrentUserName("Error Loading User");
      }
    }
  }, [isOpen]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.title || !form.description) {
        alert("กรุณากรอก Project Name และ Description");
        return;
      }
      
      const payload = {
        ...form,
        case_type_id: parseInt(form.case_type_id),
        status_id: parseInt(form.status_id),
      };

      await createNewCase(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Create case failed");
    }
  };

  if (!isOpen) return null;

  // Input Style แบบ IG: พื้นเทาอ่อน (#FAFAFA), ขอบบางๆ
  const inputClass = "w-full mt-1.5 px-3 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-gray-400 focus:outline-none transition-colors";
  const labelClass = "text-xs font-semibold text-gray-700 ml-1";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh] border border-gray-100">

        <button
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
          onClick={onClose}
        >
          <HiXMark size={24} />
        </button>

        <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">Add New Case</h3>

        <div className="space-y-5">
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Case Type</label>
              <select
                value={form.case_type_id}
                onChange={(e) => updateForm("case_type_id", e.target.value)}
                className={inputClass}
              >
                <option value="1">Hot Issue</option>
                <option value="2">Complain</option>
                <option value="3">Teamwork</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status_id}
                onChange={(e) => updateForm("status_id", e.target.value)}
                className={inputClass}
              >
                <option value="1">Open</option>
                <option value="2">In Progress</option>
                <option value="3">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Project Name</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className={inputClass}
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className={labelClass}>Issue Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className={`${inputClass} min-h-[100px] resize-none`}
              placeholder="Describe the issue..."
            />
          </div>

          {/* Issue By & Action By */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Issue By</label>
              <input
                type="text"
                value={currentUserName || "Loading..."} 
                readOnly 
                className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed border-transparent`}
              />
            </div>

            <div>
              <label className={labelClass}>Action By</label>
              <input
                type="text"
                value={form.assigned_to}
                onChange={(e) => updateForm("assigned_to", e.target.value)}
                className={inputClass}
                placeholder="Enter name..."
              />
            </div>
          </div>

           <div>
              <label className={labelClass}>Target Date</label>
              <input
                type="date"
                value={form.target_date}
                onChange={(e) => updateForm("target_date", e.target.value)}
                className={inputClass}
              />
          </div>

           <div>
            <label className={labelClass}>Next Step & Follow-up</label>
            <textarea
              value={form.next_step_followup}
              onChange={(e) => updateForm("next_step_followup", e.target.value)}
              className={`${inputClass} min-h-[80px]`}
            />
          </div>

          <div>
            <label className={labelClass}>Remark</label>
            <textarea
              value={form.remark}
              onChange={(e) => updateForm("remark", e.target.value)}
              className={`${inputClass} min-h-[80px]`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button 
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 bg-[#0095F6] text-white rounded-lg text-sm font-semibold hover:bg-[#1877F2] transition shadow-sm active:scale-95"
            onClick={handleSubmit}
          >
            Save Case
          </button>
        </div>

      </div>
    </div>
  );
}