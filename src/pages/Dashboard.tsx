import { useEffect, useState } from "react";
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
  exportFeedbacksToCSV,
  isSupabaseActive,
} from "../lib/storage";
import { Feedback } from "../lib/types";
import { Database, Download, RefreshCw, Radio } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<Feedback[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSupabase = isSupabaseActive();

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

  const kpis = computeKPIs(data);
  const topIssues = computeTopIssues(data);
  const rootCauses = computeRootCauseInsight(data);
  const alert = detectAlert(data);
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

  return (
    <div className="min-h-dvh bg-[#0d1017] text-gray-100 px-4 py-8 sm:px-8 lg:px-14">
      {/* Top Header */}
      <header className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <img
            src="/galaxy-logo.png"
            alt="Galaxy Cinema"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                LOBBY LOOP — DASHBOARD QUẢN TRỊ
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Hệ thống phân tích phản hồi & cảnh báo vận hành Lobby theo thời gian thực
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Connection badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isSupabase
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSupabase ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSupabase ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span>{isSupabase ? "Supabase Cloud Realtime" : "Local Storage (Offline)"}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition shadow-sm"
          >
            <Database className="h-4 w-4 text-orange-400" />
            <span>Quản lý DB</span>
          </button>

          <button
            type="button"
            onClick={() => exportFeedbacksToCSV(data)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs sm:text-sm font-medium text-gray-200 transition"
            title="Xuất file CSV báo cáo"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSyncing}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2 text-gray-300 hover:text-white transition disabled:opacity-50"
            title="Khôi phục dữ liệu mẫu"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          </button>

          <a
            href="/qr"
            className="rounded-xl bg-[#034EA2] hover:bg-[#023b7a] px-4 py-2 text-xs sm:text-sm font-semibold text-white transition shadow-sm"
          >
            Màn hình QR
          </a>
        </div>
      </header>

      {/* Info bar */}
      <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-xs sm:text-sm">
        <p className="font-medium text-gray-300">
          Mô hình: <span className="text-amber-400 font-semibold">Ask Less — Ask Right — Act Fast</span> (Rút ngắn từ 13 câu xuống 2–3 câu cốt lõi).
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Live Sync Active</span>
        </div>
      </div>

      {isDemoData && (
        <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-gray-500">
            Dữ liệu demo mô phỏng đang hoạt động
          </p>
          {!isSupabase && (
            <p className="text-[11px] text-amber-400/80">
              💡 Để kết nối Supabase Cloud: Điền URL và Anon Key vào file <code className="bg-white/10 px-1 rounded">.env</code>
            </p>
          )}
        </div>
      )}

      {/* Main KPI Grid */}
      <main className="mx-auto mt-6 max-w-6xl">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard label="Tổng lượt phản hồi" value={kpis.total.toLocaleString("vi-VN")} />
          <KpiCard label="Chỉ số CSAT" value={`${kpis.csatPct}%`} tone="good" />
          <KpiCard label="Tỷ lệ hài lòng" value={`${kpis.happyPct}%`} tone="good" />
          <KpiCard label="Cần xử lý ngay" value={`${kpis.needsAttentionPct}%`} tone="warn" />
        </div>

        {/* Real-time Alert */}
        {alert && (
          <div className="mt-6">
            <AlertBanner alert={alert} />
          </div>
        )}

        {/* Deep Dive Insights */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Nhóm vấn đề khách phản ánh nhiều nhất
              </h2>
            </div>
            <div className="mt-4">
              <InsightBarList items={topIssues} emptyLabel="Chưa có vấn đề nào được ghi nhận." />
            </div>
          </section>

          <section className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Nguyên nhân gốc rễ (Root Cause)
              </h2>
            </div>
            <div className="mt-4">
              <InsightBarList items={rootCauses} emptyLabel="Chưa có root cause nào được ghi nhận." />
            </div>
          </section>
        </div>

        {/* Real-time Feedback Stream */}
        <section className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Luồng phản hồi trực tiếp (Live Stream)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/10 text-gray-300 font-mono">
                {data.length} phản hồi
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium transition"
            >
              Xem chi tiết bảng dữ liệu →
            </button>
          </div>
          <div className="mt-4 flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1">
            {data.slice(0, 30).map((f) => (
              <LiveFeedbackCard key={f.id} feedback={f} />
            ))}
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
        onClearAll={handleClearAll}
        isSupabase={isSupabase}
      />
    </div>
  );
}
