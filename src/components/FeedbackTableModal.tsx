import { useState, useMemo } from "react";
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

function formatTimeWithSeconds(iso: string): string {
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

export default function FeedbackTableModal({
  isOpen,
  onClose,
  feedbacks,
  onDeleteFeedback,
  onResetSample,
  onClearDemo,
  onClearAll,
  isSupabase,
  isLight = false,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    return feedbacks.filter((f) => {
      // 1. Lọc theo nhánh
      if (filterBranch !== "all" && f.branch !== filterBranch) return false;

      // 2. Lọc theo số sao
      if (filterRating !== "all" && f.rating !== Number(filterRating)) return false;

      // 3. Lọc theo ngày
      const feedbackTime = new Date(f.timestamp).getTime();
      if (filterDateRange === "today" && feedbackTime < todayStart) return false;
      if (filterDateRange === "7days" && feedbackTime < sevenDaysAgo) return false;
      if (filterDateRange === "30days" && feedbackTime < thirtyDaysAgo) return false;
      if (filterDateRange === "custom" && customDate) {
        const itemDateStr = new Date(f.timestamp).toISOString().slice(0, 10);
        if (itemDateStr !== customDate) return false;
      }

      // 4. Lọc theo từ khóa tìm kiếm
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const reasons = (f.satisfactionReasons || []).join(" ").toLowerCase();
      const issue = (f.issue || "").toLowerCase();
      const rootCause = (f.rootCause || "").toLowerCase();
      const comment = (f.comment || "").toLowerCase();
      const actionWanted = (f.actionWanted || "").toLowerCase();
      const device = (f.device || "").toLowerCase();
      const ip = (f.ip || "").toLowerCase();
      const id = f.id.toLowerCase();

      return (
        id.includes(term) ||
        device.includes(term) ||
        ip.includes(term) ||
        reasons.includes(term) ||
        issue.includes(term) ||
        rootCause.includes(term) ||
        comment.includes(term) ||
        actionWanted.includes(term)
      );
    });
  }, [feedbacks, searchTerm, filterRating, filterBranch, filterDateRange, customDate]);

  if (!isOpen) return null;

  async function handleDelete(id: string) {
    if (confirm("Bạn có chắc chắn muốn xóa phản hồi này khỏi Database?")) {
      setDeletingId(id);
      await onDeleteFeedback(id);
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    if (confirm("CẢNH BÁO: Thao tác này sẽ xóa sạch toàn bộ phản hồi hiện có. Bạn có chắc không?")) {
      setIsProcessing(true);
      await onClearAll();
      setIsProcessing(false);
    }
  }

  async function handleResetDemo() {
    if (confirm("Khôi phục danh sách về dữ liệu mẫu mặc định?")) {
      setIsProcessing(true);
      await onResetSample();
      setIsProcessing(false);
    }
  }

  async function handleClearDemo() {
    if (confirm("Bạn có chắc muốn xóa tất cả dữ liệu mẫu (Demo Seed)?")) {
      setIsProcessing(true);
      if (onClearDemo) {
        await onClearDemo();
      }
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border ${
          isLight ? "bg-white border-slate-300 text-slate-900" : "bg-[#121620] border-white/10 text-gray-200"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-[#161b27] border-white/10 text-white"
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold">Quản lý Dữ liệu Phản hồi</h2>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isSupabase
                    ? isLight
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : isLight
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {isSupabase ? "[ Supabase Cloud: Đang kết nối ]" : "[ Lưu trữ Cục bộ: Ngoại tuyến ]"}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              Tổng cộng {feedbacks.length} bản ghi phản hồi khách hàng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportFeedbacksToCSV(filteredData)}
              className="px-3.5 py-1.5 rounded-lg bg-[#034EA2] hover:bg-[#023b7a] text-xs font-semibold text-white transition shadow-sm"
              title="Xuất file CSV báo cáo mở bằng Excel"
            >
              Xuất CSV
            </button>

            <button
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`px-6 py-3 border-b flex flex-wrap items-center gap-2.5 ${
            isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#0d1017]/90 border-white/10"
          }`}
        >
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm mã, thiết bị, vấn đề, góp ý..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none transition ${
                isLight
                  ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#034EA2]"
                  : "bg-white/[0.06] border-white/10 text-white placeholder-gray-500 focus:border-orange-500"
              }`}
            />
          </div>

          {/* Rating filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
              isLight
                ? "bg-white border-slate-300 text-slate-800"
                : "bg-[#1a202c] border-white/10 text-gray-200"
            }`}
          >
            <option value="all">Tất cả số sao</option>
            <option value="5">5 sao (Rất hài lòng)</option>
            <option value="4">4 sao (Hài lòng)</option>
            <option value="3">3 sao (Bình thường)</option>
            <option value="2">2 sao (Không hài lòng)</option>
            <option value="1">1 sao (Rất tệ)</option>
          </select>

          {/* Branch filter */}
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
              isLight
                ? "bg-white border-slate-300 text-slate-800"
                : "bg-[#1a202c] border-white/10 text-gray-200"
            }`}
          >
            <option value="all">Tất cả phân loại</option>
            <option value="happy">Nhánh Hài lòng</option>
            <option value="unhappy">Nhánh Khiếu nại</option>
          </select>

          {/* Date Filter */}
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
              isLight
                ? "bg-white border-slate-300 text-slate-800"
                : "bg-[#1a202c] border-white/10 text-gray-200"
            }`}
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="custom">Chọn ngày cụ thể</option>
          </select>

          {filterDateRange === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className={`px-2.5 py-1 rounded-lg border text-xs outline-none ${
                isLight
                  ? "bg-white border-slate-300 text-slate-800"
                  : "bg-[#1a202c] border-white/10 text-gray-200"
              }`}
            />
          )}

          {/* Action buttons (pure typography, no icons) */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              disabled={isProcessing}
              onClick={handleResetDemo}
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30 transition disabled:opacity-50"
              title="Nạp lại 25 dữ liệu mẫu"
            >
              Nạp mẫu
            </button>
            <button
              disabled={isProcessing}
              onClick={handleClearDemo}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition disabled:opacity-50"
              title="Xóa các bản ghi demo"
            >
              Xóa mẫu
            </button>
            <button
              disabled={isProcessing}
              onClick={handleClearAll}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition disabled:opacity-50"
              title="Xóa sạch dữ liệu"
            >
              Xóa hết
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                Không tìm thấy bản ghi nào phù hợp
              </p>
              <p className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-gray-500"}`}>
                Thử thay đổi bộ lọc ngày, tìm kiếm hoặc nạp dữ liệu mẫu
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className={`border-b uppercase tracking-wider text-[11px] font-bold ${
                      isLight
                        ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-white/[0.03] text-gray-400 border-white/10"
                    }`}
                  >
                    <th className="py-2.5 px-3">Thời gian (Giờ:Phút:Giây)</th>
                    <th className="py-2.5 px-3">Thiết bị / IP</th>
                    <th className="py-2.5 px-3">Đánh giá</th>
                    <th className="py-2.5 px-3">Chi tiết & Yêu cầu xử lý</th>
                    <th className="py-2.5 px-3">Ghi chú</th>
                    <th className="py-2.5 px-3 text-center">Nguồn</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isLight ? "divide-slate-200 text-slate-800" : "divide-white/5 text-gray-300"
                  }`}
                >
                  {filteredData.map((f) => {
                    const isHappy = f.branch === "happy";
                    const formattedDate = formatTimeWithSeconds(f.timestamp);

                    return (
                      <tr
                        key={f.id}
                        className={`transition ${isLight ? "hover:bg-slate-50" : "hover:bg-white/[0.03]"}`}
                      >
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                                isLight
                                  ? "bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-white/10 text-gray-300 border-white/10"
                              }`}
                            >
                              {f.device || "Không xác định"}
                            </span>
                            {f.ip && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                  isLight
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                }`}
                                title="Địa chỉ IP khách hàng"
                              >
                                IP: {f.ip}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs border ${
                              isHappy
                                ? isLight
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : isLight
                                ? "bg-rose-50 text-rose-800 border-rose-300"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                          >
                            {f.rating} sao
                          </span>
                        </td>
                        <td className="py-3 px-3 min-w-[220px]">
                          {isHappy ? (
                            <span className={isLight ? "text-emerald-700 font-medium" : "text-emerald-300 font-medium"}>
                              {(f.satisfactionReasons || [])
                                .map((r) => labelForIssue(r))
                                .join(", ") || "Hài lòng tổng thể"}
                            </span>
                          ) : (
                            <div>
                              <span className={isLight ? "font-bold text-rose-700" : "font-semibold text-rose-300"}>
                                {labelForIssue(f.issue)}
                              </span>
                              {f.rootCause && (
                                <span className={isLight ? "text-slate-600" : "text-gray-400"}>
                                  {" "}| {labelForRootCause(f.issue, f.rootCause)}
                                </span>
                              )}
                              {f.actionWanted && (
                                <p className={`mt-1 font-medium ${isLight ? "text-amber-800" : "text-amber-300"}`}>
                                  Yêu cầu: "{f.actionWanted}"
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 italic max-w-[180px] truncate text-[11px]">
                          {f.comment || "—"}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {f.isDemo ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-500/20 text-gray-500 font-medium">
                              Dữ liệu mẫu
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-600 font-semibold border border-blue-500/30">
                              Khách thật
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            disabled={deletingId === f.id}
                            onClick={() => handleDelete(f.id)}
                            className="px-2 py-0.5 rounded text-rose-500 hover:bg-rose-500/15 font-semibold transition disabled:opacity-40"
                            title="Xóa bản ghi này"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-t text-xs ${
            isLight
              ? "bg-slate-100 border-slate-200 text-slate-600"
              : "bg-[#161b27] border-white/10 text-gray-400"
          }`}
        >
          <div>
            Hiển thị <span className="font-bold">{filteredData.length}</span> / {feedbacks.length} bản ghi
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-semibold transition border ${
              isLight
                ? "bg-white hover:bg-slate-200 text-slate-800 border-slate-300"
                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
