"use client";

import { useState, useEffect } from "react";
import { HiXMark, HiClock } from "react-icons/hi2";
import { getCaseHistory } from "@/services/api";

export default function HistoryModal({ isOpen, onClose, caseId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลเมื่อ Modal เปิด
  useEffect(() => {
    if (isOpen && caseId) {
      fetchHistory();
    }
  }, [isOpen, caseId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getCaseHistory(caseId);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-full text-gray-900">
                <HiClock size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900">History Log</h3>
                <p className="text-sm text-gray-500 font-medium">Case ID: <span className="text-gray-900">CASE-{caseId}</span></p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-900 transition bg-gray-50 p-1 rounded-full"
            onClick={onClose}
          >
            <HiXMark size={20} />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
                <div className="flex justify-center items-center py-20 gap-3 text-gray-400">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#0095F6] rounded-full"></div>
                    Loading history...
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No history found.</div>
            ) : (
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="py-3 px-4 rounded-l-lg">Date/Time</th>
                            <th className="py-3 px-4">Action</th>
                            <th className="py-3 px-4">Detail</th>
                            <th className="py-3 px-4 rounded-r-lg">By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((item) => (
                            <tr key={item.history_id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 text-gray-500 whitespace-nowrap font-medium">
                                    {new Date(item.created_at).toLocaleString("th-TH")}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide
                                        ${item.action_type === 'CREATE' ? 'bg-green-50 text-[#34C759]' : 
                                          item.action_type === 'UPDATE' ? 'bg-blue-50 text-[#0095F6]' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                        {item.action_type}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-gray-700 leading-relaxed">
                                    {item.action_detail}
                                </td>
                                <td className="py-4 px-4 text-gray-900 font-semibold">
                                    {item.first_name || item.created_by}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-right">
             <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#EFEFEF] text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
             >
                Close
             </button>
        </div>

      </div>
    </div>
  );
}