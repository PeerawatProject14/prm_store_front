"use client";

import { useState, useEffect } from "react";
import { HiXMark, HiTrash } from "react-icons/hi2";
import api, { deleteCase } from "@/services/api";

export default function EditCaseModal({ isOpen, onClose, onSuccess, caseData }) {

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
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

    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        decoded.role = decoded.role ? decoded.role.toLowerCase() : null;
        setCurrentUser(decoded);
      }
    }
  }, []);

  const isOwner = currentUser && caseData && (currentUser.user_id === caseData.created_by);
  const isAdmin = currentUser && currentUser.role === "admin";
  const canEdit = isOwner || isAdmin;

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

  useEffect(() => {
    if (isOpen && caseData) {
      let formattedDate = "";
      if (caseData.target_date) {
        const dateObj = new Date(caseData.target_date);
        formattedDate = dateObj.toISOString().split("T")[0];
      }

      setForm({
        title: caseData.title || "",
        description: caseData.description || "",
        case_type_id: caseData.case_type_id?.toString() || "1",
        status_id: caseData.status_id?.toString() || "1",
        assigned_to: caseData.assigned_to || "",
        target_date: formattedDate,
        next_step_followup: caseData.next_step_followup || "",
        remark: caseData.remark || "",
      });
    }
  }, [isOpen, caseData]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!canEdit) {
      alert("You do not have permission to edit this case.");
      return;
    }

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

      await api.put(`/case/${caseData.case_id}`, payload);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Update case failed");
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      alert("You do not have permission to delete this case.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Case-${caseData.case_id}?`)) {
      return;
    }

    try {
      await deleteCase(caseData.case_id);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        alert("Delete failed: Admin only.");
      } else {
        alert("Delete case failed");
      }
    }
  };

  if (!isOpen) return null;

  // Base Style สำหรับ Input (IG Style)
  const baseInputStyle = "w-full mt-1.5 px-3 py-2.5 rounded-lg text-sm border focus:outline-none transition-colors";
  
  const inputCls = canEdit
    ? `${baseInputStyle} bg-[#FAFAFA] border-gray-200 focus:bg-white focus:border-gray-400`
    : `${baseInputStyle} bg-gray-100 border-transparent text-gray-500 cursor-not-allowed`;
  
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

        <h3 className="text-xl font-bold mb-6 text-gray-900 tracking-tight">
          Edit Case: <span className="text-gray-500 font-normal">{caseData?.case_id}</span>
        </h3>

        <div className="space-y-5">
          {/* Case Type & Status */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Case Type</label>
              <select
                value={form.case_type_id}
                disabled={!canEdit}
                onChange={(e) => updateForm("case_type_id", e.target.value)}
                className={inputCls}
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
                disabled={!canEdit}
                onChange={(e) => updateForm("status_id", e.target.value)}
                className={inputCls}
              >
                <option value="1">Open</option>
                <option value="2">In Progress</option>
                <option value="3">Done</option>
              </select>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className={labelClass}>Project Name</label>
            <input
              type="text"
              value={form.title}
              disabled={!canEdit}
              onChange={(e) => updateForm("title", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Issue Description</label>
            <textarea
              value={form.description}
              disabled={!canEdit}
              onChange={(e) => updateForm("description", e.target.value)}
              className={`${inputCls} min-h-[100px] resize-none`}
            />
          </div>

          {/* Issue By + Action By */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Issue By (Read Only)</label>
              <input
                type="text"
                value={caseData?.first_name || caseData?.created_by || "-"}
                readOnly
                className={`${baseInputStyle} bg-gray-100 border-transparent text-gray-500 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className={labelClass}>Action By</label>
              <input
                type="text"
                value={form.assigned_to}
                disabled={!canEdit}
                onChange={(e) => updateForm("assigned_to", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className={labelClass}>Target Date</label>
            <input
              type="date"
              value={form.target_date}
              disabled={!canEdit}
              onChange={(e) => updateForm("target_date", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Next Step */}
          <div>
            <label className={labelClass}>Next Step & Follow-up</label>
            <textarea
              value={form.next_step_followup}
              disabled={!canEdit}
              onChange={(e) => updateForm("next_step_followup", e.target.value)}
              className={`${inputCls} min-h-[80px]`}
            />
          </div>

          {/* Remark */}
          <div>
            <label className={labelClass}>Remark</label>
            <textarea
              value={form.remark}
              disabled={!canEdit}
              onChange={(e) => updateForm("remark", e.target.value)}
              className={`${inputCls} min-h-[80px]`}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">

          {/* ปุ่ม DELETE (Destructive Style) */}
          {canEdit ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-[#ED4956] hover:bg-red-50 rounded-lg transition font-semibold text-sm"
            >
              <HiTrash className="text-lg" />
              Delete Case
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button
              className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              disabled={!canEdit}
              className={`px-6 py-2.5 text-white rounded-lg text-sm font-semibold shadow-sm transition active:scale-95 ${
                canEdit
                  ? "bg-[#0095F6] hover:bg-[#1877F2]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}