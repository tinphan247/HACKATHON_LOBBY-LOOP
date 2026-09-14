import { useState, useMemo, useEffect, useRef } from "react";
import { Feedback } from "../lib/types";
import { labelForIssue, labelForRootCause } from "../lib/questions";
import { exportFeedbacksToCSV } from "../lib/storage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: Feedback[];
  onDeleteFeedback: (id: string) => Promise<void>;
  onResetSample: () => Promise<void>;
  onClearDemo?: () => Promise<void>;
  onClearAll: () => Promise<void>;
  isSupabase: boolean;
  isLight?: boolean;
}

function formatFullDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const secs = String(d.getSeconds()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${hours}:${mins}:${secs} - ${day}/${month}/${year}`;
  } catch {
    return iso;
  }
}

function formatTimeOnly(iso: string): { time: string; date: string } {
  try {
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const secs = String(d.getSeconds()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return {
      time: `${hours}:${mins}:${secs}`,
      date: `${day}/${month}`,
    };
  } catch {
    return { time: iso, date: "" };
  }
}

function formatDateDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function FeedbackTableModal({
  isOpen,
  onClose,
  feedbacks,
  onDeleteFeedback,
  onResetSample,
  onClearDemo,
  onClearAll,
  isSupabase,
  isLight = true,
}: Props) {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  // Date navigation
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateMode, setDateMode] = useState<"day" | "today" | "yesterday" | "7days" | "30days" | "all" | "custom">("today");
  const [customDateStr, setCustomDateStr] = useState<string>("");

  // Drawer details
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Dropdown menu state for admin data operations
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [actionMenuFeedbackId, setActionMenuFeedbackId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const adminMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
      if (actionMenuFeedbackId && !(event.target as HTMLElement).closest(".row-action-menu-container")) {
        setActionMenuFeedbackId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuFeedbackId]);

  // Date navigation handlers
  function handlePrevDay() {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    setDateMode("day");
  }

  function handleNextDay() {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
    setDateMode("day");
  }

  function handleSetToday() {
    setSelectedDate(new Date());
    setDateMode("today");
  }

  // Filtered dataset
  const filteredFeedbacks = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const targetDayStr = selectedDate.toISOString().slice(0, 10);

    return feedbacks.filter((f) => {
      // 1. Date filter
      const fTime = new Date(f.timestamp).getTime();
      const fDateStr = new Date(f.timestamp).toISOString().slice(0, 10);

      if (dateMode === "today") {
        if (fTime < todayStart) return false;
      } else if (dateMode === "yesterday") {
        if (fTime < yesterdayStart || fTime >= todayStart) return false;
      } else if (dateMode === "day") {
        if (fDateStr !== targetDayStr) return false;
      } else if (dateMode === "7days") {
        if (fTime < sevenDaysAgo) return false;
      } else if (dateMode === "30days") {
        if (fTime < thirtyDaysAgo) return false;
      } else if (dateMode === "custom" && customDateStr) {
        if (fDateStr !== customDateStr) return false;
      }

      // 2. Rating filter
      if (filterRating !== "all" && f.rating !== Number(filterRating)) {
        return false;
      }

      // 3. Branch filter
      if (filterBranch !== "all" && f.branch !== filterBranch) {
        return false;
      }

      // 4. Device filter
      if (filterDevice !== "all") {
        const d = (f.device || "").toLowerCase();
        if (filterDevice === "iphone" && !d.includes("iphone")) return false;
        if (filterDevice === "android" && !d.includes("android") && !d.includes("samsung") && !d.includes("xiaomi") && !d.includes("oppo") && !d.includes("vivo")) return false;
        if (filterDevice === "pc" && !d.includes("windows") && !d.includes("mac") && !d.includes("linux")) return false;
      }

      // 5. Source filter
      if (filterSource === "real" && f.isDemo) return false;
      if (filterSource === "demo" && !f.isDemo) return false;

      // 6. Search term filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const id = f.id.toLowerCase();
      const dev = (f.device || "").toLowerCase();
      const ip = (f.ip || "").toLowerCase();
      const reasons = (f.satisfactionReasons || []).join(" ").toLowerCase();
      const issue = (f.issue || "").toLowerCase();
      const rootCause = (f.rootCause || "").toLowerCase();
      const comment = (f.comment || "").toLowerCase();
      const actionWanted = (f.actionWanted || "").toLowerCase();

      return (
        id.includes(term) ||
        dev.includes(term) ||
        ip.includes(term) ||
        reasons.includes(term) ||
        issue.includes(term) ||
        rootCause.includes(term) ||
        comment.includes(term) ||
        actionWanted.includes(term)
      );
    });
  }, [feedbacks, dateMode, selectedDate, customDateStr, filterRating, filterBranch, filterDevice, filterSource, searchTerm]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = filteredFeedbacks.length;
    if (total === 0) {
      return { total: 0, avgRating: "0.0", count1Star: 0, count23Star: 0, countNeedsReview: 0 };
    }
    const sumRating = filteredFeedbacks.reduce((acc, cur) => acc + cur.rating, 0);
    const avgRating = (sumRating / total).toFixed(1);
    const count1Star = filteredFeedbacks.filter((f) => f.rating === 1).length;
    const count23Star = filteredFeedbacks.filter((f) => f.rating === 2 || f.rating === 3).length;
    const countNeedsReview = filteredFeedbacks.filter(
      (f) => f.rating <= 2 || Boolean(f.actionWanted && f.actionWanted.trim())
    ).length;

    return { total, avgRating, count1Star, count23Star, countNeedsReview };
  }, [filteredFeedbacks]);

  if (!isOpen) return null;

  function promptDeleteSingle(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa phản hồi",
      message: `Bạn có chắc muốn xóa bản ghi phản hồi [${id}] khỏi hệ thống? Thao tác này không thể hoàn tác.`,
      action: async () => {
        await onDeleteFeedback(id);
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback(null);
        }
      },
    });
  }

  function promptResetDemo() {
    setIsAdminMenuOpen(false);
    setConfirmDialog({
      isOpen: true,
      title: "Khôi phục dữ liệu mẫu",
      message: "Nạp lại 25 phản hồi mẫu demo phục vụ thử nghiệm. Bạn có chắc muốn tiếp tục?",
      action: async () => {
        setIsProcessing(true);
        await onResetSample();
        setIsProcessing(false);
      },
    });
  }

  function promptClearDemo() {
    setIsAdminMenuOpen(false);
    setConfirmDialog({
      isOpen: true,
      title: "Xóa dữ liệu mẫu (Demo Seed)",
      message: "Bạn có chắc muốn xóa tất cả các bản ghi demo? Phản hồi của khách thật sẽ được giữ nguyên.",
      action: async () => {
        if (onClearDemo) {
          setIsProcessing(true);
          await onClearDemo();
          setIsProcessing(false);
        }
      },
    });
  }

  function promptClearAll() {
    setIsAdminMenuOpen(false);
    setConfirmDialog({
      isOpen: true,
      title: "CẢNH BÁO: Xóa tất cả phản hồi",
      message: "Toàn bộ dữ liệu phản hồi sẽ bị xóa sạch khỏi cơ sở dữ liệu. Bạn có chắc chắn không?",
      action: async () => {
        setIsProcessing(true);
        await onClearAll();
        if (selectedFeedback) setSelectedFeedback(null);
        setIsProcessing(false);
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-none">
      <div
        className={`relative flex flex-col w-full max-w-6xl h-[92vh] rounded-lg shadow-2xl overflow-hidden border font-sans ${
          isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-[#10141d] border-white/10 text-gray-200"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isLight ? "bg-white border-slate-200" : "bg-[#141923] border-white/10"
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold tracking-tight">Quản lý Dữ liệu Phản hồi</h2>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  isSupabase
                    ? isLight
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : isLight
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {isSupabase ? "[ Supabase: Đang kết nối ]" : "[ Lưu trữ cục bộ ]"}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              Theo dõi và quản lý dữ liệu phản hồi khách hàng tập trung
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportFeedbacksToCSV(filteredFeedbacks)}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-[#034EA2] hover:bg-[#023b7a] text-white transition"
            >
              [ Xuất CSV ]
            </button>
            <button
              onClick={onClose}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition ${
                isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300" : "bg-white/10 hover:bg-white/15 text-white border-white/10"
              }`}
            >
              [ Đóng ]
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5">
          {/* DATE NAVIGATION */}
          <section
            className={`rounded border p-3 flex flex-wrap items-center justify-between gap-3 ${
              isLight ? "bg-white border-slate-200" : "bg-[#141923] border-white/10"
            }`}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-semibold mr-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                Thời gian:
              </span>
              <button
                onClick={handleSetToday}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  dateMode === "today"
                    ? isLight ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-900 border-white"
                    : isLight ? "bg-white text-slate-700 border-slate-300" : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                Hôm nay
              </button>
              <button
                onClick={() => {
                  const yest = new Date();
                  yest.setDate(yest.getDate() - 1);
                  setSelectedDate(yest);
                  setDateMode("yesterday");
                }}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  dateMode === "yesterday"
                    ? isLight ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-900 border-white"
                    : isLight ? "bg-white text-slate-700 border-slate-300" : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                Hôm qua
              </button>
              <button
                onClick={() => setDateMode("7days")}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  dateMode === "7days"
                    ? isLight ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-900 border-white"
                    : isLight ? "bg-white text-slate-700 border-slate-300" : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => setDateMode("30days")}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  dateMode === "30days"
                    ? isLight ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-900 border-white"
                    : isLight ? "bg-white text-slate-700 border-slate-300" : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                30 ngày qua
              </button>
              <button
                onClick={() => setDateMode("all")}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  dateMode === "all"
                    ? isLight ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-900 border-white"
                    : isLight ? "bg-white text-slate-700 border-slate-300" : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setDateMode("custom")}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  dateMode === "custom"
                    ? isLight ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-900 border-white"
                    : isLight ? "bg-white text-slate-700 border-slate-300" : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                Chọn ngày
              </button>

              {dateMode === "custom" && (
                <input
                  type="date"
                  value={customDateStr}
                  onChange={(e) => setCustomDateStr(e.target.value)}
                  className={`px-2 py-0.5 rounded border text-xs outline-none ${
                    isLight ? "bg-white border-slate-300 text-slate-800" : "bg-[#1f2533] border-white/10 text-gray-200"
                  }`}
                />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevDay}
                className={`px-2 py-1 rounded text-xs font-semibold border ${
                  isLight ? "bg-white border-slate-300 hover:bg-slate-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                [ &lt; Ngày trước ]
              </button>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                isLight ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-white/10 text-white border-white/10"
              }`}>
                {formatDateDisplay(selectedDate)}
              </span>
              <button
                onClick={handleNextDay}
                className={`px-2 py-1 rounded text-xs font-semibold border ${
                  isLight ? "bg-white border-slate-300 hover:bg-slate-100" : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                [ Ngày sau &gt; ]
              </button>
            </div>
          </section>

          {/* SUMMARY STRIP */}
          <section
            className={`grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x rounded border ${
              isLight ? "bg-white border-slate-200 divide-slate-200" : "bg-[#141923] border-white/10 divide-white/10"
            }`}
          >
            <div className="p-3 text-left">
              <p className={`text-[11px] font-semibold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                Tổng phản hồi
              </p>
              <p className="text-xl font-bold mt-0.5">{summary.total}</p>
            </div>
            <div className="p-3 text-left">
              <p className={`text-[11px] font-semibold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                Điểm TB
              </p>
              <p className="text-xl font-bold mt-0.5">
                {summary.avgRating} <span className="text-xs font-normal opacity-70">/ 5</span>
              </p>
            </div>
            <div className="p-3 text-left">
              <p className={`text-[11px] font-semibold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                1 sao
              </p>
              <p className={`text-xl font-bold mt-0.5 ${summary.count1Star > 0 ? "text-rose-600" : ""}`}>
                {summary.count1Star}
              </p>
            </div>
            <div className="p-3 text-left">
              <p className={`text-[11px] font-semibold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                2 - 3 sao
              </p>
              <p className="text-xl font-bold mt-0.5">{summary.count23Star}</p>
            </div>
            <div className="p-3 text-left col-span-2 sm:col-span-1">
              <p className={`text-[11px] font-semibold uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                Cần xem xét
              </p>
              <p className={`text-xl font-bold mt-0.5 ${summary.countNeedsReview > 0 ? "text-amber-600" : ""}`}>
                {summary.countNeedsReview}
              </p>
            </div>
          </section>

          {/* TOOLBAR */}
          <section
            className={`rounded border p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 ${
              isLight ? "bg-white border-slate-200" : "bg-[#141923] border-white/10"
            }`}
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm mã FB, thiết bị, IP, vấn đề, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-1 rounded border text-xs outline-none ${
                  isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className={`px-2 py-1 rounded border text-xs outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" : "bg-[#1f2533] border-white/10 text-gray-200"
                }`}
              >
                <option value="all">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>

              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className={`px-2 py-1 rounded border text-xs outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" : "bg-[#1f2533] border-white/10 text-gray-200"
                }`}
              >
                <option value="all">Tất cả phân loại</option>
                <option value="happy">Hài lòng (Happy)</option>
                <option value="unhappy">Khiếu nại (Unhappy)</option>
              </select>

              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className={`px-2 py-1 rounded border text-xs outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" : "bg-[#1f2533] border-white/10 text-gray-200"
                }`}
              >
                <option value="all">Tất cả thiết bị</option>
                <option value="iphone">iPhone</option>
                <option value="android">Android</option>
                <option value="pc">PC / Mac</option>
              </select>

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className={`px-2 py-1 rounded border text-xs outline-none ${
                  isLight ? "bg-white border-slate-300 text-slate-800" : "bg-[#1f2533] border-white/10 text-gray-200"
                }`}
              >
                <option value="all">Tất cả nguồn</option>
                <option value="real">Khách thật</option>
                <option value="demo">Dữ liệu mẫu</option>
              </select>

              {/* Data Operations */}
              <div className="relative" ref={adminMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  disabled={isProcessing}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" : "bg-white/10 hover:bg-white/15 text-gray-200 border-white/10"
                  }`}
                >
                  [ Quản trị dữ liệu v ]
                </button>

                {isAdminMenuOpen && (
                  <div
                    className={`absolute right-0 mt-1 w-52 rounded shadow-lg border py-1 z-40 ${
                      isLight ? "bg-white border-slate-200 text-slate-800" : "bg-[#1b2230] border-white/10 text-gray-200"
                    }`}
                  >
                    <button
                      onClick={promptResetDemo}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Nạp 25 phản hồi mẫu (Demo)
                    </button>
                    <button
                      onClick={promptClearDemo}
                      className="w-full text-left px-3 py-1.5 text-xs text-amber-600 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Xóa các bản ghi mẫu
                    </button>
                    <div className={`my-1 border-t ${isLight ? "border-slate-100" : "border-white/10"}`} />
                    <button
                      onClick={promptClearAll}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Xóa toàn bộ dữ liệu...
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* TABLE */}
          <section
            className={`rounded border overflow-hidden flex-1 flex flex-col ${
              isLight ? "bg-white border-slate-200" : "bg-[#141923] border-white/10"
            }`}
          >
            {filteredFeedbacks.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold">Không tìm thấy bản ghi nào</p>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                  Thử đổi bộ lọc ngày hoặc từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                        isLight ? "bg-slate-50 text-slate-600 border-slate-200" : "bg-white/[0.02] text-gray-400 border-white/10"
                      }`}
                    >
                      <th className="py-2.5 px-3 whitespace-nowrap">Thời gian</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Đánh giá</th>
                      <th className="py-2.5 px-3 min-w-[240px]">Nội dung phản hồi</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Thiết bị / IP</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Nguồn</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Trạng thái</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? "divide-slate-200 text-slate-800" : "divide-white/5 text-gray-300"}`}>
                    {filteredFeedbacks.map((f) => {
                      const timeObj = formatTimeOnly(f.timestamp);
                      const isHappy = f.branch === "happy";
                      const needsReview = f.rating <= 2 || Boolean(f.actionWanted && f.actionWanted.trim());

                      return (
                        <tr
                          key={f.id}
                          onClick={() => setSelectedFeedback(f)}
                          className={`cursor-pointer transition ${
                            selectedFeedback?.id === f.id
                              ? isLight ? "bg-blue-50/70" : "bg-blue-900/20"
                              : isLight ? "hover:bg-slate-50" : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                            <div>{timeObj.time}</div>
                            <div className={`text-[10px] ${isLight ? "text-slate-400" : "text-gray-500"}`}>{timeObj.date}</div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`font-mono font-bold text-xs ${
                                f.rating >= 4
                                  ? isLight ? "text-emerald-700" : "text-emerald-400"
                                  : f.rating === 3
                                  ? isLight ? "text-slate-700" : "text-gray-300"
                                  : "text-rose-600"
                              }`}
                            >
                              {f.rating} / 5
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            {isHappy ? (
                              <div>
                                <div className="font-medium">
                                  {(f.satisfactionReasons || []).map((r) => labelForIssue(r)).join(", ") || "Hài lòng dịch vụ"}
                                </div>
                                {f.comment && (
                                  <p className={`text-[11px] italic truncate max-w-xs mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                                    "{f.comment}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-rose-600">
                                  {labelForIssue(f.issue)}
                                  {f.rootCause && (
                                    <span className={`font-normal ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                                      {" "}• {labelForRootCause(f.issue, f.rootCause)}
                                    </span>
                                  )}
                                </div>
                                {f.actionWanted && (
                                  <p className={`text-[11px] font-medium mt-0.5 break-words break-all line-clamp-2 ${isLight ? "text-amber-800" : "text-amber-300"}`}>
                                    Yêu cầu: "{f.actionWanted}"
                                  </p>
                                )}
                                {f.comment && (
                                  <p className={`text-[11px] italic break-words break-all line-clamp-2 max-w-xs mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                                    "{f.comment}"
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-mono text-[11px]">{f.device || "Không xác định"}</div>
                            {f.ip && (
                              <div className={`font-mono text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                                IP: {f.ip}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-center">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                f.isDemo
                                  ? isLight ? "bg-slate-100 text-slate-500" : "bg-white/5 text-gray-400"
                                  : isLight ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-blue-900/30 text-blue-300 border border-blue-500/20"
                              }`}
                            >
                              {f.isDemo ? "Mẫu" : "Khách thật"}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                needsReview
                                  ? isLight ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  : isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-white/5 text-gray-400 border-white/10"
                              }`}
                            >
                              {needsReview ? "Cần xem xét" : "Bình thường"}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block row-action-menu-container">
                              <button
                                type="button"
                                onClick={() => setActionMenuFeedbackId(actionMenuFeedbackId === f.id ? null : f.id)}
                                className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                                  isLight ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300" : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                                }`}
                              >
                                [ ... ]
                              </button>

                              {actionMenuFeedbackId === f.id && (
                                <div
                                  className={`absolute right-0 mt-1 w-36 rounded shadow-lg border py-1 z-40 text-left ${
                                    isLight ? "bg-white border-slate-200 text-slate-800" : "bg-[#1b2230] border-white/10 text-gray-200"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedFeedback(f);
                                      setActionMenuFeedbackId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-100 dark:hover:bg-white/5"
                                  >
                                    Xem chi tiết
                                  </button>
                                  <button
                                    onClick={() => {
                                      promptDeleteSingle(f.id);
                                      setActionMenuFeedbackId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-left text-rose-600 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold"
                                  >
                                    Xóa phản hồi
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div
              className={`px-3.5 py-2.5 border-t text-xs flex items-center justify-between ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-[#141923] border-white/10 text-gray-400"
              }`}
            >
              <div>
                Hiển thị <span className="font-semibold text-slate-900 dark:text-white">{filteredFeedbacks.length}</span> / {feedbacks.length} bản ghi
              </div>
              <div className="text-[11px] opacity-75">Bấm vào dòng để mở chi tiết</div>
            </div>
          </section>
        </div>

        {/* DETAIL DRAWER INSIDE MODAL */}
        {selectedFeedback && (
          <div className="absolute inset-0 z-40 flex justify-end">
            <div
              onClick={() => setSelectedFeedback(null)}
              className="absolute inset-0 bg-black/40"
            />
            <aside
              className={`relative w-full max-w-sm h-full shadow-2xl flex flex-col border-l z-10 ${
                isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#161c28] border-white/10 text-gray-200"
              }`}
            >
              <div className={`p-3.5 border-b flex items-center justify-between ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#131722] border-white/10"}`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Chi tiết phản hồi</h3>
                  <p className="text-[11px] font-mono opacity-70">Mã: {selectedFeedback.id}</p>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                    isLight ? "bg-white border-slate-300" : "bg-white/10 border-white/10"
                  }`}
                >
                  [ Đóng ]
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 text-xs">
                <div
                  className={`p-2.5 rounded border ${
                    selectedFeedback.branch === "happy"
                      ? isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/20"
                      : isLight ? "bg-rose-50/50 border-rose-200" : "bg-rose-950/20 border-rose-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{selectedFeedback.rating} / 5 sao</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                        selectedFeedback.branch === "happy"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {selectedFeedback.branch === "happy" ? "Hài lòng" : "Khiếu nại"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {selectedFeedback.branch === "happy" ? (
                    <div>
                      <span className={`block font-semibold uppercase text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                        Lý do hài lòng
                      </span>
                      <p className="font-medium mt-0.5">
                        {(selectedFeedback.satisfactionReasons || []).map((r) => labelForIssue(r)).join(", ") || "Hài lòng tổng thể"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className={`block font-semibold uppercase text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                          Vấn đề khiếu nại
                        </span>
                        <p className="font-semibold text-rose-600 mt-0.5">
                          {labelForIssue(selectedFeedback.issue)}
                        </p>
                      </div>
                      {selectedFeedback.rootCause && (
                        <div>
                          <span className={`block font-semibold uppercase text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                            Nguyên nhân cụ thể
                          </span>
                          <p className="font-medium mt-0.5">
                            {labelForRootCause(selectedFeedback.issue, selectedFeedback.rootCause)}
                          </p>
                        </div>
                      )}
                      {selectedFeedback.actionWanted && (
                        <div className={`p-2.5 rounded border ${isLight ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-amber-950/20 border-amber-500/30 text-amber-300"}`}>
                          <span className="block font-bold uppercase text-[10px]">
                            Yêu cầu xử lý từ khách hàng
                          </span>
                          <p className="font-medium text-xs mt-0.5 break-words break-all whitespace-pre-wrap">
                            "{selectedFeedback.actionWanted}"
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedFeedback.comment && (
                    <div>
                      <span className={`block font-semibold uppercase text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                        Ý kiến đóng góp
                      </span>
                      <p className={`p-2 rounded border italic text-[11px] break-words break-all whitespace-pre-wrap max-h-48 overflow-y-auto ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-gray-300"}`}>
                        "{selectedFeedback.comment}"
                      </p>
                    </div>
                  )}
                </div>

                <div className={`border-t my-1 ${isLight ? "border-slate-200" : "border-white/10"}`} />

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className={`block text-[10px] uppercase font-semibold ${isLight ? "text-slate-400" : "text-gray-500"}`}>Thời gian</span>
                    <span className="font-mono">{formatFullDateTime(selectedFeedback.timestamp)}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] uppercase font-semibold ${isLight ? "text-slate-400" : "text-gray-500"}`}>Khu vực</span>
                    <span>{selectedFeedback.location || "Galaxy Nguyen Du"}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] uppercase font-semibold ${isLight ? "text-slate-400" : "text-gray-500"}`}>Thiết bị</span>
                    <span className="font-mono">{selectedFeedback.device || "Không xác định"}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] uppercase font-semibold ${isLight ? "text-slate-400" : "text-gray-500"}`}>Địa chỉ IP</span>
                    <span className="font-mono">{selectedFeedback.ip || "Không xác định"}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] uppercase font-semibold ${isLight ? "text-slate-400" : "text-gray-500"}`}>Nguồn</span>
                    <span>{selectedFeedback.isDemo ? "Dữ liệu mẫu" : "Khách thật"}</span>
                  </div>
                </div>
              </div>

              <div className={`p-3.5 border-t flex items-center justify-between ${isLight ? "bg-slate-50 border-slate-200" : "bg-[#131722] border-white/10"}`}>
                <button
                  type="button"
                  onClick={() => promptDeleteSingle(selectedFeedback.id)}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-300"
                >
                  [ Xóa phản hồi ]
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                    isLight ? "bg-white border-slate-300 text-slate-800" : "bg-white/10 border-white/10 text-white"
                  }`}
                >
                  [ Đóng ]
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* CONFIRMATION DIALOG */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none">
            <div
              className={`w-full max-w-sm rounded border shadow-xl p-4.5 ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#181f2c] border-white/15 text-gray-200"
              }`}
            >
              <h4 className="text-xs font-bold tracking-tight">{confirmDialog.title}</h4>
              <p className={`text-xs mt-2 leading-relaxed ${isLight ? "text-slate-600" : "text-gray-300"}`}>
                {confirmDialog.message}
              </p>
              <div className="mt-4 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className={`px-2.5 py-1 rounded font-semibold border ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300" : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await confirmDialog.action();
                    setConfirmDialog(null);
                  }}
                  className="px-2.5 py-1 rounded font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
