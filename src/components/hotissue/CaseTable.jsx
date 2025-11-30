"use client";

import { useState, useEffect } from "react";
import { HiPencilSquare, HiMagnifyingGlassPlus } from "react-icons/hi2";

export default function CaseTable({ cases, loading, onEdit, onHistory }) {
  
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
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

  if (loading) return (
      <div className="mt-10 flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-[#0095F6] rounded-full"></div>
        <span className="text-sm">Loading data...</span>
      </div>
  );
  
  if (!cases || cases.length === 0) return <div className="mt-10 text-center text-gray-400 text-sm">No cases found.</div>;

  const getTypeConfig = (type) => {
    switch (type) {
      case 'HOT':
        return { label: 'Hot Issue', style: 'bg-red-50 text-[#ED4956] border-red-100' };
      case 'COMPLAIN':
        return { label: 'Complaints', style: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'TEAMWORK':
        return { label: 'Teamwork', style: 'bg-blue-50 text-[#0095F6] border-blue-100' };
      default:
        return { label: type || '-', style: 'bg-gray-50 text-gray-500 border-gray-100' };
    }
  };

  const getStatusLabel = (code) => {
    switch (code) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In Progress';
      case 'DONE': return 'Done';
      case 'CLOSED': return 'Done';
      default: return code;
    }
  };

  const getTimelineStatus = (targetDate, status) => {
    if (!targetDate) return { text: "-", color: "text-gray-400" };
    
    if (status === "DONE" || status === "CLOSED") {
        return { text: "Done", color: "text-[#34C759] font-semibold" }; // IG Green
    }

    const target = new Date(targetDate);
    const today = new Date();
    
    target.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      return { text: "On-Time", color: "text-[#34C759] font-bold" };
    } else {
      return { text: `Delay ${Math.abs(diffDays)} วัน`, color: "text-[#ED4956] font-bold" }; // IG Red
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          
          {/* Header แบบ Minimal */}
          <thead className="bg-gray-50 text-gray-900 text-xs font-semibold uppercase border-b border-gray-200">
            <tr>
              <th className="py-4 px-4 whitespace-nowrap">Case ID</th>
              <th className="py-4 px-4 whitespace-nowrap">Created Date</th>
              <th className="py-4 px-4 whitespace-nowrap">Type</th>
              <th className="py-4 px-4 min-w-[200px]">Project</th>
              <th className="py-4 px-4 min-w-[250px]">Issue Description</th>
              <th className="py-4 px-4 whitespace-nowrap">Status</th>
              <th className="py-4 px-4 whitespace-nowrap">Issue By</th>
              <th className="py-4 px-4 whitespace-nowrap">Action By</th>
              <th className="py-4 px-4 whitespace-nowrap">Target Date</th>
              <th className="py-4 px-4 whitespace-nowrap">Timeline Status</th>
              <th className="py-4 px-4 whitespace-nowrap">Last Update</th>
              <th className="py-4 px-4 text-center whitespace-nowrap">Action Log</th>
              <th className="py-4 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {cases.map((item) => {
              const timeline = getTimelineStatus(item.target_date, item.status_code);
              const typeConfig = getTypeConfig(item.type_code);

              const isOwner = currentUser && (currentUser.user_id === item.created_by);
              const isAdmin = currentUser && (currentUser.role === 'admin'); 
              const canEdit = isOwner || isAdmin;

              return (
                <tr key={item.case_id} className="hover:bg-gray-50 transition duration-150 group">
                  <td className="py-4 px-4 font-medium text-gray-900">
                    CASE-{item.case_id}
                  </td>

                  <td className="py-4 px-4 text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("th-TH")}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-bold border tracking-wide ${typeConfig.style}`}>
                      {typeConfig.label}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-semibold text-gray-800">
                    {item.title || "-"}
                  </td>

                  <td className="py-4 px-4 text-gray-600 max-w-xs truncate" title={item.description}>
                    {item.description}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap
                      ${item.status_code === 'OPEN' ? 'bg-red-50 text-[#ED4956] border-red-100' : ''}
                      ${item.status_code === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-500 border-orange-100' : ''}
                      ${(item.status_code === 'DONE' || item.status_code === 'CLOSED') ? 'bg-green-50 text-[#34C759] border-green-100' : ''}
                    `}>
                      {getStatusLabel(item.status_code)}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-gray-600 text-xs">
                    {item.first_name || item.created_by}
                  </td>

                  <td className="py-4 px-4 text-gray-600 text-xs">
                    {item.assigned_to || "-"}
                  </td>

                  <td className="py-4 px-4 text-gray-600">
                    {item.target_date ? new Date(item.target_date).toLocaleDateString("en-CA") : "-"}
                  </td>

                  <td className={`py-4 px-4 text-xs ${timeline.color}`}>
                    {timeline.text}
                  </td>

                  <td className="py-4 px-4 text-gray-500 text-xs">
                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString("th-TH") : "-"}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <button 
                        onClick={() => onHistory(item.case_id)}
                        className="text-gray-400 hover:text-[#0095F6] p-2 rounded-full hover:bg-blue-50 transition"
                        title="View History"
                    >
                        <HiMagnifyingGlassPlus size={20} />
                    </button>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">
                        {canEdit ? (
                            <button 
                                onClick={() => onEdit(item)}
                                className="text-gray-400 hover:text-[#0095F6] p-2 rounded-full hover:bg-blue-50 transition" 
                                title="Edit Case"
                            >
                                <HiPencilSquare size={18} />
                            </button>
                        ) : (
                             <span className="w-[34px]"></span> 
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}