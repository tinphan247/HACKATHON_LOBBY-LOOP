import { useEffect, useState } from "react";
import AlertBanner from "../components/AlertBanner";
import InsightBarList from "../components/InsightBarList";
import KpiCard from "../components/KpiCard";
import LiveFeedbackCard from "../components/LiveFeedbackCard";
import {
  computeKPIs,
  computeRootCauseInsight,
  computeTopIssues,
  detectAlert,
} from "../lib/analytics";
import { ensureSeeded, getAllFeedback, resetToSampleData, subscribeToFeedback } from "../lib/storage";
import { Feedback } from "../lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<Feedback[]>([]);

  useEffect(() => {
    ensureSeeded();
    setData(getAllFeedback());
    const unsubscribe = subscribeToFeedback(() => setData(getAllFeedback()));
    return unsubscribe;
  }, []);

  const kpis = computeKPIs(data);
  const topIssues = computeTopIssues(data);
  const rootCauses = computeRootCauseInsight(data);
  const alert = detectAlert(data);
  const isDemoData = data.length > 0 && data.every((f) => f.isDemo);

  function handleReset() {
    resetToSampleData();
    setData(getAllFeedback());
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
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              LOBBY LOOP — DASHBOARD QUẢN TRỊ
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Hệ thống phân tích phản hồi & cảnh báo vận hành Lobby theo thời gian thực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium text-gray-200 transition"
          >
            ↻ Khôi phục dữ liệu mẫu
          </button>
          <a
            href="/qr"
            className="rounded-xl bg-[#034EA2] hover:bg-[#023b7a] px-4 py-2 text-xs sm:text-sm font-semibold text-white transition shadow-sm"
          >
            Mở màn hình QR
          </a>
        </div>
      </header>

      {/* Info bar */}
      <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-xs sm:text-sm">
        <p className="font-medium text-gray-300">
          Mô hình: <span className="text-amber-400 font-semibold">Ask Less — Ask Right — Act Fast</span> (Rút ngắn từ 13 câu xuống 2–3 câu cốt lõi).
        </p>
        <span className="text-gray-400 hidden sm:inline">Cập nhật tự động (Live Sync)</span>
      </div>

      {isDemoData && (
        <p className="mx-auto mt-3 max-w-6xl text-[11px] uppercase tracking-wider text-gray-500">
          Dữ liệu demo mô phỏng đang hoạt động
        </p>
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
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Luồng phản hồi trực tiếp (Live Stream)
            </h2>
            <span className="text-xs text-gray-400">{data.length} phản hồi</span>
          </div>
          <div className="mt-4 flex max-h-[380px] flex-col gap-2 overflow-y-auto pr-1">
            {data.slice(0, 30).map((f) => (
              <LiveFeedbackCard key={f.id} feedback={f} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
