import { useEffect, useState, useMemo } from "react";
import AlertBanner from "../components/AlertBanner";
import InsightBarList from "../components/InsightBarList";
import KpiCard from "../components/KpiCard";
import LiveFeedbackCard from "../components/LiveFeedbackCard";
import FeedbackTableModal from "../components/FeedbackTableModal";
import {
  computeKPIs,
  computeRootCauseInsight,
  computeTopIssues,
  detectAlert,
} from "../lib/analytics";
import {
  ensureSeeded,
  getAllFeedback,
  resetToSampleData,
  subscribeToFeedback,
  syncWithSupabase,
  deleteFeedback,
  clearAllFeedback,
  clearDemoData,
  exportFeedbacksToCSV,
  isSupabaseActive,
} from "../lib/storage";
import { Feedback } from "../lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<Feedback[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSupabase = isSupabaseActive();

  // Quản lý theme Dark / Light (Mặc định Light theo yêu cầu nền trắng chủ đạo)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lobbyloop_theme");
      if (saved === "dark" || saved === "light") return saved;
    }
    return "light";
  });

  const isLight = theme === "light";

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lobbyloop_theme", next);
  }

  // Quản lý bộ lọc theo ngày trên Dashboard
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7days" | "30days" | "custom">("all");
  const [customDate, setCustomDate] = useState<string>("");

  async function refreshData() {
    setIsSyncing(true);
    const latest = await syncWithSupabase();
    setData(latest);
    setIsSyncing(false);
  }

  useEffect(() => {
    // Initial local read
    setData(getAllFeedback());

    // Check seed and sync with Supabase
    ensureSeeded().then(() => {
      setData(getAllFeedback());
    });

    if (isSupabase) {
      refreshData();
    }

    const unsubscribe = subscribeToFeedback(() => {
      setData(getAllFeedback());
    });
    return unsubscribe;
  }, [isSupabase]);

  // Lọc tập dữ liệu theo ngày
  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return data.filter((f) => {
      const t = new Date(f.timestamp).getTime();
      if (dateFilter === "today" && t < todayStart) return false;
      if (dateFilter === "7days" && t < sevenDaysAgo) return false;
      if (dateFilter === "30days" && t < thirtyDaysAgo) return false;
      if (dateFilter === "custom" && customDate) {
        const itemDateStr = new Date(f.timestamp).toISOString().slice(0, 10);
        if (itemDateStr !== customDate) return false;
      }
      return true;
    });
  }, [data, dateFilter, customDate]);

  const kpis = computeKPIs(filteredData);
  const topIssues = computeTopIssues(filteredData);
  const rootCauses = computeRootCauseInsight(filteredData);
  const alert = detectAlert(filteredData);
  const isDemoData = data.length > 0 && data.every((f) => f.isDemo);

  async function handleReset() {
    setIsSyncing(true);
    await resetToSampleData();
    setData(getAllFeedback());
    setIsSyncing(false);
  }

  async function handleDeleteFeedback(id: string) {
    await deleteFeedback(id);
    setData(getAllFeedback());
  }

  async function handleClearAll() {
    await clearAllFeedback();
    setData([]);
  }

  async function handleClearDemo() {
    await clearDemoData();
    setData(getAllFeedback());
  }

  return (
    <div
      className={`min-h-dvh transition-colors duration-200 px-4 py-8 sm:px-8 lg:px-14 ${
        isLight ? "bg-[#F8FAFC] text-slate-900" : "bg-[#0d1017] text-gray-100"
      }`}
    >
      {/* Top Header */}
      <header
        className={`mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
      >
        <div className="flex items-center gap-4">
          <img
            src="/galaxy-logo.png"
            alt="Galaxy Cinema"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1
                className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                LOBBY LOOP — DASHBOARD QUẢN TRỊ
              </h1>
            </div>
            <p className={`text-xs sm:text-sm ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              Hệ thống phân tích phản hồi & cảnh báo vận hành Lobby theo thời gian thực
            </p>
          </div>
        </div>

        {/* Action Buttons & Theme Switcher (No Icons) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút chuyển đổi Dark/Light mode thuần typography */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                : "bg-white/10 border-white/15 text-gray-200 hover:bg-white/20"
            }`}
            title="Chuyển đổi giao diện Sáng / Tối"
          >
            {isLight ? "[ Chế độ: Sáng ]" : "[ Chế độ: Tối ]"}
          </button>

          {/* Connection badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isSupabase
                ? isLight
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : isLight
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            <span>{isSupabase ? "Supabase Realtime" : "Bộ nhớ Cục bộ"}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition shadow-sm ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                : "bg-white/10 border-white/15 text-white hover:bg-white/20"
            }`}
          >
            Quản lý DB
          </button>

          <button
            type="button"
            onClick={() => exportFeedbacksToCSV(filteredData)}
            className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
            }`}
            title="Xuất file CSV báo cáo"
          >
            Xuất CSV
          </button>

          <button
            type="button"
            onClick={refreshData}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition disabled:opacity-50 ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
                : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
            }`}
            title="Đồng bộ dữ liệu"
          >
            {isSyncing ? "Đang tải..." : "Đồng bộ"}
          </button>

          <a
            href="/qr"
            className="rounded-xl bg-[#034EA2] hover:bg-[#023b7a] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition shadow-sm"
          >
            Màn hình QR
          </a>
        </div>
      </header>

      {/* Info bar & Live Status */}
      <div
        className={`mx-auto mt-6 flex max-w-6xl flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm ${
          isLight ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.04] border-white/10 text-gray-300"
        }`}
      >
        <p className="font-medium">
          Mô hình: <span className="text-orange-500 font-semibold">Ask Less — Ask Right — Act Fast</span> (Rút ngắn còn 2–3 câu cốt lõi).
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
          <span>[ Đang kết nối trực tiếp ]</span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div
        className={`mx-auto mt-4 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
          isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`font-bold ${isLight ? "text-slate-600" : "text-gray-400"}`}>Lọc theo ngày:</span>
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "today", label: "Hôm nay" },
              { id: "7days", label: "7 ngày qua" },
              { id: "30days", label: "30 ngày qua" },
              { id: "custom", label: "Chọn ngày" },
            ] as const
          ).map((item) => {
            const active = dateFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDateFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition border ${
                  active
                    ? "bg-[#034EA2] text-white border-[#034EA2]"
                    : isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {dateFilter === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className={`px-3 py-1 rounded-lg border text-xs outline-none ${
                isLight
                  ? "bg-white border-slate-300 text-slate-800"
                  : "bg-[#1a202c] border-white/10 text-gray-200"
              }`}
            />
          )}
        </div>

        <div className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
          Hiển thị: <strong>{filteredData.length}</strong> / {data.length} phản hồi
        </div>
      </div>

      {isDemoData && (
        <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-gray-500">
            Dữ liệu demo mô phỏng đang hoạt động
          </p>
        </div>
      )}

      {/* Main KPI Grid */}
      <main className="mx-auto mt-6 max-w-6xl">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard label="Tổng lượt phản hồi" value={kpis.total.toLocaleString("vi-VN")} isLight={isLight} />
          <KpiCard label="Chỉ số CSAT" value={`${kpis.csatPct}%`} tone="good" isLight={isLight} />
          <KpiCard label="Tỷ lệ hài lòng" value={`${kpis.happyPct}%`} tone="good" isLight={isLight} />
          <KpiCard label="Cần xử lý ngay" value={`${kpis.needsAttentionPct}%`} tone="warn" isLight={isLight} />
        </div>

        {/* Real-time Alert */}
        {alert && (
          <div className="mt-6">
            <AlertBanner alert={alert} isLight={isLight} />
          </div>
        )}

        {/* Deep Dive Insights */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section
            className={`rounded-2xl p-5 sm:p-6 border transition ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.04] border-white/10 shadow-md"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Nhóm vấn đề khách phản ánh nhiều nhất
              </h2>
            </div>
            <div className="mt-4">
              <InsightBarList items={topIssues} emptyLabel="Chưa có vấn đề nào được ghi nhận trong thời gian này." isLight={isLight} />
            </div>
          </section>

          <section
            className={`rounded-2xl p-5 sm:p-6 border transition ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.04] border-white/10 shadow-md"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Nguyên nhân gốc rễ (Root Cause)
              </h2>
            </div>
            <div className="mt-4">
              <InsightBarList items={rootCauses} emptyLabel="Chưa có root cause nào được ghi nhận trong thời gian này." isLight={isLight} />
            </div>
          </section>
        </div>

        {/* Real-time Feedback Stream */}
        <section
          className={`mt-6 rounded-2xl p-5 sm:p-6 border transition ${
            isLight ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.04] border-white/10 shadow-md"
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                Luồng phản hồi trực tiếp (Live Stream)
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${
                  isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-white/10 text-gray-300 border-white/10"
                }`}
              >
                {filteredData.length} phản hồi
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-orange-500 hover:text-orange-600 font-bold transition"
            >
              Xem chi tiết bảng dữ liệu →
            </button>
          </div>

          <div className="mt-4 flex max-h-[420px] flex-col gap-2.5 overflow-y-auto pr-1">
            {filteredData.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center py-10 rounded-xl border border-dashed ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-500"
                    : "bg-white/[0.01] border-white/10 text-gray-400"
                }`}
              >
                <p className="text-sm font-medium">Chưa có phản hồi nào trong khoảng thời gian này</p>
                <p className="text-xs mt-1 text-center px-4 opacity-75">
                  Khách quét mã QR tại rạp để gửi đánh giá hoặc bấm "Quản lý DB" để nạp dữ liệu mẫu thử nghiệm.
                </p>
              </div>
            ) : (
              filteredData.slice(0, 30).map((f) => (
                <LiveFeedbackCard key={f.id} feedback={f} isLight={isLight} />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Database Management Modal */}
      <FeedbackTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feedbacks={data}
        onDeleteFeedback={handleDeleteFeedback}
        onResetSample={handleReset}
        onClearDemo={handleClearDemo}
        onClearAll={handleClearAll}
        isSupabase={isSupabase}
        isLight={isLight}
      />
    </div>
  );
}
