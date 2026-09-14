import { Feedback } from "../lib/types";
import { labelForIssue, labelForRootCause } from "../lib/questions";

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

interface Props {
  feedback: Feedback;
  isLight?: boolean;
}

export default function LiveFeedbackCard({ feedback, isLight = false }: Props) {
  const isHappy = feedback.branch === "happy";
  const deviceName = feedback.device || "Không xác định";
  const clientIp = feedback.ip;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 transition border ${
        isLight
          ? "bg-white border-slate-200/80 hover:bg-slate-50/80 shadow-sm text-slate-800"
          : "bg-white/[0.04] border-white/5 hover:bg-white/[0.07] text-gray-200"
      }`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-wrap sm:flex-nowrap flex-1 overflow-hidden">
        {/* Rating text badge */}
        <span
          className={`flex shrink-0 items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
            isHappy
              ? isLight
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : isLight
              ? "bg-rose-50 text-rose-700 border-rose-300"
              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
          }`}
        >
          {feedback.rating} sao
        </span>

        {/* Device model tag */}
        <span
          className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-mono border ${
            isLight
              ? "bg-slate-100 text-slate-700 border-slate-300"
              : "bg-white/10 text-gray-300 border-white/10"
          }`}
          title="Thiết bị khách hàng"
        >
          {deviceName}
        </span>

        {/* IP Address tag */}
        {clientIp && (
          <span
            className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-mono border ${
              isLight
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-blue-500/15 text-blue-300 border-blue-500/30"
            }`}
            title="Địa chỉ IP khách hàng"
          >
            IP: {clientIp}
          </span>
        )}

        {/* Content details */}
        <div className="min-w-0 flex-1 overflow-hidden">
          {isHappy ? (
            <p className="text-xs sm:text-sm font-medium truncate">
              {(feedback.satisfactionReasons ?? [])
                .map((r) => labelForIssue(r))
                .join(", ") || "Hài lòng dịch vụ"}
              {feedback.comment && (
                <span className={`italic ml-1 break-words break-all ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                  — "{feedback.comment}"
                </span>
              )}
            </p>
          ) : (
            <div className="text-xs sm:text-sm">
              <span className={`font-semibold ${isLight ? "text-rose-600" : "text-rose-400"}`}>
                {labelForIssue(feedback.issue)}
              </span>
              {feedback.rootCause && (
                <span className={isLight ? "text-slate-600" : "text-gray-400"}>
                  {" "}| {labelForRootCause(feedback.issue, feedback.rootCause)}
                </span>
              )}
              {feedback.actionWanted && (
                <p className={`mt-0.5 text-xs font-medium break-words break-all line-clamp-2 ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                  Yêu cầu xử lý: "{feedback.actionWanted}"
                </p>
              )}
              {feedback.comment && (
                <p className={`mt-0.5 text-xs italic break-words break-all line-clamp-2 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                  {feedback.actionWanted ? "Ghi chú: " : "Chi tiết: "}"{feedback.comment}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timestamp with seconds */}
      <div className={`shrink-0 text-left sm:text-right text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
        <p className={`font-mono font-medium ${isLight ? "text-slate-700" : "text-gray-300"}`}>
          {formatTimeWithSeconds(feedback.timestamp)}
        </p>
        <p className="text-[11px] mt-0.5">{feedback.location ?? "Galaxy Cinema"}</p>
      </div>
    </div>
  );
}
