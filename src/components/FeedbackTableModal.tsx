import { useState, useMemo } from "react";
import { Feedback } from "../lib/types";
import { labelForIssue, labelForRootCause } from "../lib/questions";
import { exportFeedbacksToCSV } from "../lib/storage";
import {
  Download,
  Trash2,
  RotateCcw,
  X,
  Search,
  Database,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: Feedback[];
  onDeleteFeedback: (id: string) => Promise<void>;
  onResetSample: () => Promise<void>;
  onClearAll: () => Promise<void>;
  isSupabase: boolean;
}

export default function FeedbackTableModal({
  isOpen,
  onClose,
  feedbacks,
  onDeleteFeedback,
  onResetSample,
  onClearAll,
  isSupabase,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterBranch, setFilterBranch] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredData = useMemo(() => {
    return feedbacks.filter((f) => {
      // Filter by branch
      if (filterBranch !== "all" && f.branch !== filterBranch) return false;

      // Filter by rating
      if (filterRating !== "all" && f.rating !== Number(filterRating)) return false;

      // Filter by search text
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const reasons = (f.satisfactionReasons || []).join(" ").toLowerCase();
      const issue = (f.issue || "").toLowerCase();
      const rootCause = (f.rootCause || "").toLowerCase();
      const comment = (f.comment || "").toLowerCase();
      const id = f.id.toLowerCase();

      return (
        id.includes(term) ||
        reasons.includes(term) ||
        issue.includes(term) ||
        rootCause.includes(term) ||
        comment.includes(term)
      );
    });
  }, [feedbacks, searchTerm, filterRating, filterBranch]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] bg-[#121620] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161b27]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Quản lý Dữ liệu Database</h2>
                {isSupabase ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Supabase Cloud
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-3 w-3" /> Chế độ Cục bộ (Local)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Tổng cộng {feedbacks.length} bản ghi phản hồi khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportFeedbacksToCSV(filteredData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
              title="Xuất file CSV mở bằng Excel"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-[#0d1017]/80 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, nội dung, nguyên nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Rating filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1a202c] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-orange-500"
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
            className="px-3 py-1.5 rounded-lg bg-[#1a202c] border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-orange-500"
          >
            <option value="all">Tất cả phân loại</option>
            <option value="happy">Nhánh Hài lòng (4-5⭐)</option>
            <option value="unhappy">Nhánh Khiếu nại (1-3⭐)</option>
          </select>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              disabled={isProcessing}
              onClick={handleResetDemo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-medium border border-orange-500/20 transition disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Nạp mẫu</span>
            </button>
            <button
              disabled={isProcessing}
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa hết</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Database className="h-10 w-10 text-gray-600 mb-2" />
              <p className="text-sm font-medium">Không tìm thấy bản ghi nào phù hợp</p>
              <p className="text-xs text-gray-500 mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc nạp dữ liệu mẫu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[11px] bg-white/[0.02]">
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Đánh giá</th>
                    <th className="py-2.5 px-3">Chi tiết & Nguyên nhân</th>
                    <th className="py-2.5 px-3">Ghi chú</th>
                    <th className="py-2.5 px-3 text-center">Nguồn</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredData.map((f) => {
                    const isHappy = f.branch === "happy";
                    const formattedDate = new Date(f.timestamp).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={f.id} className="hover:bg-white/[0.04] transition">
                        <td className="py-3 px-3 whitespace-nowrap text-gray-400 font-mono">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold ${
                              isHappy
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {f.rating} ★
                          </span>
                        </td>
                        <td className="py-3 px-3 min-w-[200px]">
                          {isHappy ? (
                            <span className="text-emerald-300 font-medium">
                              {(f.satisfactionReasons || [])
                                .map((r) => labelForIssue(r))
                                .join(", ") || "Hài lòng tổng quan"}
                            </span>
                          ) : (
                            <div>
                              <span className="font-semibold text-rose-300">
                                {labelForIssue(f.issue)}
                              </span>
                              {f.rootCause && (
                                <span className="text-gray-400">
                                  {" "}➔ {labelForRootCause(f.issue, f.rootCause)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-400 italic max-w-[200px] truncate">
                          {f.comment || "—"}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {f.isDemo ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-700/50 text-gray-400">
                              Demo Seed
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                              Khách thật
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            disabled={deletingId === f.id}
                            onClick={() => handleDelete(f.id)}
                            className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-40"
                            title="Xóa bản ghi này"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-[#161b27] text-xs text-gray-400">
          <div>
            Hiển thị <span className="text-white font-semibold">{filteredData.length}</span> / {feedbacks.length} bản ghi
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
