"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";

import Header from "@/components/hotissue/Header";
import StatsCard from "@/components/hotissue/StatsCard";
import CaseTable from "@/components/hotissue/CaseTable";
import HotIssueControls from "@/components/hotissue/HotIssueControls";
import AddCaseModal from "@/components/hotissue/AddCaseModal";
import EditCaseModal from "@/components/hotissue/EditCaseModal";
import HistoryModal from "@/components/hotissue/HistoryModal";

import {
  getHotIssueStats,
  getHotIssueCases,
  getHotIssueDetailStats,
  isModuleEnabled,
} from "@/services/api";

import {
  HiMiniFire,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUsers,
  HiOutlineChartBar,
} from "react-icons/hi2";

// 🔢 helper แปลงให้เป็นตัวเลขแน่นอน
const toNum = (v) => (v == null ? 0 : Number(v) || 0);

export default function HotIssuePage() {
  const router = useRouter();

  // ====== Module Guard State ======
  const [checkingModule, setCheckingModule] = useState(true);
  const [moduleAllowed, setModuleAllowed] = useState(false);

  // ====== Data States ======
  const [stats, setStats] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);

  // Filter/Search Controls States
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCaseId, setHistoryCaseId] = useState(null);

  const [loading, setLoading] = useState(true);

  // เลือกสัปดาห์ที่ดูในการ์ด Total
  // 0 = สัปดาห์นี้, 1 = สัปดาห์ที่แล้ว, 2 = ย้อนหลังสองสัปดาห์
  const [weekIndex, setWeekIndex] = useState(0);

  // =======================================================
  // ฟังก์ชันโหลดข้อมูลหลัก (stats + detail + cases)
  // =======================================================
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, detailData, casesData] = await Promise.all([
        getHotIssueStats(),
        getHotIssueDetailStats(),
        getHotIssueCases(),
      ]);

      setStats(statsData);
      setDetail(detailData);
      setCases(casesData || []);
      setFilteredCases(casesData || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // 0. CHECK MODULE ENABLED? (HOT_ISSUE)
  // =======================================================
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const enabled = await isModuleEnabled("HOT_ISSUE");
        if (!enabled) {
          alert("ฟีเจอร์ Hot Issue ถูกปิดการใช้งานโดยผู้ดูแลระบบ");
          router.replace("/dashboard");
          return;
        }
        setModuleAllowed(true);
      } catch (err) {
        console.error("ตรวจสอบสถานะ Hot Issue ล้มเหลว:", err);
        alert("ไม่สามารถตรวจสอบสถานะระบบได้ กรุณาลองใหม่อีกครั้ง");
        router.replace("/dashboard");
        return;
      } finally {
        setCheckingModule(false);
      }
    };

    checkAccess();
  }, [router]);

  // =======================================================
  // 1. Load Data (หลังจากรู้แน่ๆ ว่า moduleAllowed = true)
  // =======================================================
  useEffect(() => {
    if (!moduleAllowed) return;
    loadData();
  }, [moduleAllowed]);

  // =======================================================
  // 2. Filter Logic สำหรับตาราง
  // =======================================================
  useEffect(() => {
    let result = cases;

    if (search) {
      const lowerTerm = search.toLowerCase();
      result = result.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(lowerTerm)) ||
          (item.case_id && item.case_id.toString().includes(lowerTerm))
      );
    }

    if (type && type !== "All") {
      result = result.filter((item) => item.type_code === type);
    }

    if (status && status !== "All") {
      result = result.filter((item) => item.status_code === status);
    }

    if (showActiveOnly) {
      // Active = ยังไม่ DONE และยังไม่ CLOSED
      result = result.filter(
        (item) => item.status_code !== "DONE" && item.status_code !== "CLOSED"
      );
    }

    setFilteredCases(result);
  }, [search, type, status, showActiveOnly, cases]);

  // =======================================================
  // 2.5 รวม Done + Closed ต่อประเภท จาก cases
  // =======================================================
  const combinedDoneByType = useMemo(() => {
    const result = {
      HOT_ISSUE: 0,
      COMPLAIN: 0,
      TEAMWORK: 0,
    };

    (cases || []).forEach((c) => {
      if (c.status_code === "DONE" || c.status_code === "CLOSED") {
        if (c.type_code === "HOT_ISSUE" || c.type_code === "HOT") result.HOT_ISSUE += 1;
        if (c.type_code === "COMPLAIN") result.COMPLAIN += 1;
        if (c.type_code === "TEAMWORK") result.TEAMWORK += 1;
      }
    });

    return result;
  }, [cases]);

  // =======================================================
  // 2.6 สรุปจำนวนราย "สัปดาห์" จาก cases (ใช้ในการ์ด Total)
  // =======================================================
  const weeklySummaries = useMemo(() => {
    const now = new Date();

    const makeWeekRanges = () => {
      const weeks = [];
      for (let offset = 0; offset < 3; offset++) {
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        end.setDate(end.getDate() - offset * 7);

        const start = new Date(end);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 6);

        weeks.push({
          start,
          end,
          total: 0,
          done: 0, // รวม DONE + CLOSED
        });
      }
      return weeks;
    };

    const weeks = makeWeekRanges();

    const fmt = (d) =>
      d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });

    (cases || []).forEach((c) => {
      if (!c.created_at) return;
      const created = new Date(c.created_at);

      for (let i = 0; i < weeks.length; i++) {
        const w = weeks[i];
        if (created >= w.start && created <= w.end) {
          w.total += 1;
          if (c.status_code === "DONE" || c.status_code === "CLOSED") {
            w.done += 1;
          }
          break;
        }
      }
    });

    return weeks.map((w) => ({
      label: `${fmt(w.start)} - ${fmt(w.end)}`,
      total: w.total,
      done: w.done,
    }));
  }, [cases]);

  const currentWeek = weeklySummaries[weekIndex] || {
    label: "",
    total: 0,
    done: 0,
  };
  const prevWeek = weeklySummaries[weekIndex + 1] || {
    label: "",
    total: 0,
    done: 0,
  };

  const canPrevWeek = weekIndex < weeklySummaries.length - 1;
  const canNextWeek = weekIndex > 0;

  // =======================================================
  // 3. Functions for Modals
  // =======================================================
  const handleEditClick = (caseItem) => {
    setEditingCase(caseItem);
    setShowEditModal(true);
  };

  const handleHistoryClick = (caseId) => {
    setHistoryCaseId(caseId);
    setShowHistoryModal(true);
  };

  // =======================================================
  // 4. Loading / Guard States
  // =======================================================
  if (checkingModule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-gray-500 text-sm gap-3">
         <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-[#0095F6] rounded-full"></div>
         Checking Permissions...
      </div>
    );
  }

  if (!moduleAllowed) return null;

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-3">
         <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-[#0095F6] rounded-full"></div>
         <span className="text-gray-400 font-medium text-sm">Loading Dashboard...</span>
      </div>
    );
  }
  if (!stats || !detail) return null;

  // =======================================================
  // 5. Render Main UI
  // =======================================================
  return (
    // IG Style: พื้นหลังเทาอ่อน (#FAFAFA)
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      
      {/* ✅ แก้ไข: ขยาย Container เป็น 95% (เกือบเต็มจอ) เพื่อให้ตารางมีพื้นที่มากขึ้น */}
      <div className="w-full max-w-[95%] mx-auto px-4 py-6 md:px-8 md:py-10">
        
        <Header
          dateText={new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />

        <HotIssueControls
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
          status={status}
          setStatus={setStatus}
          showActiveOnly={showActiveOnly}
          setShowActiveOnly={setShowActiveOnly}
          activeCount={filteredCases.length}
          onAddCase={() => setShowAddModal(true)}
        />

        {/* การ์ดสรุป */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-10">
          {/* ✅ Total Cases */}
          <StatsCard
            title="Total Cases"
            icon={<HiOutlineChartBar />}
            total={currentWeek.total}
            isTotalCard
            weekLabel={currentWeek.label}
            weekDone={currentWeek.done}
            prevWeekLabel={prevWeek.label}
            prevWeekTotal={prevWeek.total}
            prevWeekDone={prevWeek.done}
            canPrev={canPrevWeek}
            canNext={canNextWeek}
            onPrevWeek={() =>
              setWeekIndex((prev) =>
                prev < weeklySummaries.length - 1 ? prev + 1 : prev
              )
            }
            onNextWeek={() => setWeekIndex((prev) => (prev > 0 ? prev - 1 : prev))}
          />

          {/* การ์ดประเภทอื่น ๆ */}
          <StatsCard
            title="Hot Issues"
            icon={<HiMiniFire />}
            total={stats.hot}
            detail={detail.hot}
            doneCombined={combinedDoneByType.HOT_ISSUE}
          />
          <StatsCard
            title="Complaints"
            icon={<HiOutlineChatBubbleLeftRight />}
            total={stats.complaint}
            detail={detail.complain}
            doneCombined={combinedDoneByType.COMPLAIN}
          />
          <StatsCard
            title="Teamwork"
            icon={<HiOutlineUsers />}
            total={stats.teamwork}
            detail={detail.teamwork}
            doneCombined={combinedDoneByType.TEAMWORK}
          />
        </div>

        <CaseTable
          cases={filteredCases}
          loading={loading}
          onEdit={handleEditClick}
          onHistory={handleHistoryClick}
        />

        <AddCaseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadData}
        />

        <EditCaseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadData}
          caseData={editingCase}
        />

        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          caseId={historyCaseId}
        />
      </div>
    </div>
  );
}