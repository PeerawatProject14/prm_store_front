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
  fetchMyPermissions, // ✅ Import เพิ่ม
  fetchUserProfile    // ✅ Import เพิ่ม
} from "@/services/api";

import {
  HiMiniFire,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUsers,
  HiOutlineChartBar,
} from "react-icons/hi2";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCaseId, setHistoryCaseId] = useState(null);

  const [loading, setLoading] = useState(true);

  // ✅ State View Mode: เริ่มต้นที่ WEEKLY
  const [viewMode, setViewMode] = useState("WEEKLY");

  // =======================================================
  // Load Data (Cases & Stats)
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
  // ✅ Check Permissions & Module Status
  // =======================================================
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // ดึงข้อมูล 3 ส่วนพร้อมกัน:
        // 1. สถานะ Module (Global)
        // 2. ข้อมูล User (เพื่อเช็ค Admin)
        // 3. สิทธิ์รายบุคคล (My Permissions)
        const [moduleEnabled, userData, myPermissions] = await Promise.all([
            isModuleEnabled("HOT_ISSUE").catch(() => false),
            fetchUserProfile().catch(() => null),
            fetchMyPermissions().catch(() => [])
        ]);

        // 1. เช็คว่า Module เปิดใช้งานหรือไม่ (Global Switch)
        if (!moduleEnabled) {
          alert("ฟีเจอร์ Hot Issue ถูกปิดการใช้งานโดยผู้ดูแลระบบ");
          router.replace("/dashboard");
          return;
        }

        // 2. เช็คสิทธิ์ผู้ใช้งาน (User Permission)
        if (userData) {
            const role = userData.role_name || userData.role || "";
            const isAdmin = String(role).toLowerCase() === 'admin';
            const hasAccess = (myPermissions || []).includes('HOT_ISSUE');

            // ถ้าไม่ใช่ Admin และ ไม่มีสิทธิ์ HOT_ISSUE -> ดีดออก
            if (!isAdmin && !hasAccess) {
                alert("คุณไม่มีสิทธิ์เข้าถึง Hot Issue");
                router.replace("/dashboard");
                return;
            }
        } else {
            // ถ้าดึง User ไม่ได้ (Token หมดอายุ) -> ดีดไป Login
            router.replace("/");
            return;
        }

        // ถ้าผ่านทุกด่าน
        setModuleAllowed(true);

      } catch (err) {
        console.error("ตรวจสอบสิทธิ์ล้มเหลว:", err);
        router.replace("/dashboard");
      } finally {
        setCheckingModule(false);
      }
    };
    
    checkAccess();
  }, [router]);

  // โหลดข้อมูลเคสเมื่อผ่านการตรวจสอบสิทธิ์แล้ว
  useEffect(() => {
    if (moduleAllowed) loadData();
  }, [moduleAllowed]);

  // =======================================================
  // Filter Logic
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
    if (type && type !== "All") result = result.filter((item) => item.type_code === type);
    if (status && status !== "All") result = result.filter((item) => item.status_code === status);
    if (showActiveOnly) {
      result = result.filter(
        (item) => item.status_code !== "DONE" && item.status_code !== "CLOSED"
      );
    }
    setFilteredCases(result);
  }, [search, type, status, showActiveOnly, cases]);

  // =======================================================
  // Combined Done Logic
  // =======================================================
  const combinedDoneByType = useMemo(() => {
    const result = { HOT_ISSUE: 0, COMPLAIN: 0, TEAMWORK: 0 };
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
  // ✅ Data Calculation (Week / Month / Total / TypeStats)
  // =======================================================
  const { summaryData, typeWeekly, totalStats } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Week Range
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startWeek = new Date(now);
    startWeek.setDate(now.getDate() - diffToMonday);
    startWeek.setHours(0, 0, 0, 0);
    const endWeek = new Date(startWeek);
    endWeek.setDate(startWeek.getDate() + 6);
    endWeek.setHours(23, 59, 59, 999);

    // Month Range
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const data = {
        week: { total: 0, done: 0, label: "" },
        month: { total: 0, done: 0, label: "" }
    };
    const tWeekly = { HOT: 0, COMPLAIN: 0, TEAMWORK: 0 };
    
    // ✅ เพิ่มส่วน Total Stats
    const tStats = { 
        total: (cases || []).length, 
        done: (cases || []).filter(c => c.status_code === 'DONE' || c.status_code === 'CLOSED').length,
        label: "All Time"
    };

    const fmt = (d) => d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    const fmtMonth = (d) => d.toLocaleDateString("th-TH", { month: "long", year: "numeric" });

    data.week.label = `${fmt(startWeek)} - ${fmt(endWeek)}`;
    data.month.label = fmtMonth(startMonth);

    (cases || []).forEach((c) => {
        if (!c.created_at) return;
        const created = new Date(c.created_at);
        const isDone = c.status_code === "DONE" || c.status_code === "CLOSED";

        if (created >= startWeek && created <= endWeek) {
            data.week.total += 1;
            if (isDone) data.week.done += 1;
            if (c.type_code === 'HOT_ISSUE' || c.type_code === 'HOT') tWeekly.HOT += 1;
            else if (c.type_code === 'COMPLAIN') tWeekly.COMPLAIN += 1;
            else if (c.type_code === 'TEAMWORK') tWeekly.TEAMWORK += 1;
        }

        if (created >= startMonth && created <= endMonth) {
            data.month.total += 1;
            if (isDone) data.month.done += 1;
        }
    });

    return { summaryData: data, typeWeekly: tWeekly, totalStats: tStats };
  }, [cases]);

  // ✅ Toggle Logic (Cycle 3 States)
  const handleNextView = () => {
    setViewMode((prev) => {
        if (prev === "WEEKLY") return "MONTHLY";
        if (prev === "MONTHLY") return "TOTAL";
        return "WEEKLY";
    });
  };

  const handlePrevView = () => {
    setViewMode((prev) => {
        if (prev === "WEEKLY") return "TOTAL";
        if (prev === "TOTAL") return "MONTHLY";
        return "WEEKLY";
    });
  };

  // ✅ Determine data to show
  let currentViewData, currentTitle;
  if (viewMode === "WEEKLY") {
      currentViewData = summaryData.week;
      currentTitle = "Weekly Cases";
  } else if (viewMode === "MONTHLY") {
      currentViewData = summaryData.month;
      currentTitle = "Monthly Cases";
  } else {
      currentViewData = totalStats;
      currentTitle = "Total Cases";
  }

  // Handlers
  const handleEditClick = (caseItem) => {
    setEditingCase(caseItem);
    setShowEditModal(true);
  };
  const handleHistoryClick = (caseId) => {
    setHistoryCaseId(caseId);
    setShowHistoryModal(true);
  };

  if (checkingModule) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-[#0095F6] rounded-full"></div>
          <span className="text-gray-400 text-xs font-bold animate-pulse tracking-widest uppercase">Checking Access...</span>
      </div>
  );
  
  if (!moduleAllowed) return null;
  
  if (loading && !stats) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-[#0095F6] rounded-full"></div>
          <span className="text-gray-400 text-xs font-bold animate-pulse tracking-widest uppercase">Loading Data...</span>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <div className="w-full max-w-[95%] mx-auto px-4 py-6 md:px-8 md:py-10">
        <Header dateText={new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })} />

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-10">
          
          {/* ✅ Card 1: Toggleable (Weekly -> Monthly -> Total) */}
          <StatsCard
            isTotalCard
            icon={<HiOutlineChartBar />}
            title={currentTitle}
            total={currentViewData.total}
            label={currentViewData.label}
            doneCount={currentViewData.done}
            onPrev={handlePrevView}
            onNext={handleNextView}
          />

          {/* Cards อื่นๆ (Split + Status List) */}
          <StatsCard
            title="Hot Issues"
            icon={<HiMiniFire />}
            total={stats.hot}
            weeklyCount={typeWeekly.HOT}
            detail={detail.hot}
            doneCombined={combinedDoneByType.HOT_ISSUE}
          />

          <StatsCard
            title="Complaints"
            icon={<HiOutlineChatBubbleLeftRight />}
            total={stats.complaint}
            weeklyCount={typeWeekly.COMPLAIN}
            detail={detail.complain}
            doneCombined={combinedDoneByType.COMPLAIN}
          />

          <StatsCard
            title="Teamwork"
            icon={<HiOutlineUsers />}
            total={stats.teamwork}
            weeklyCount={typeWeekly.TEAMWORK}
            detail={detail.teamwork}
            doneCombined={combinedDoneByType.TEAMWORK}
          />
        </div>

        <CaseTable cases={filteredCases} loading={loading} onEdit={handleEditClick} onHistory={handleHistoryClick} />
        <AddCaseModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadData} />
        <EditCaseModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={loadData} caseData={editingCase} />
        <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} caseId={historyCaseId} />
      </div>
    </div>
  );
}