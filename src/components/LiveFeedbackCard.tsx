import { Feedback } from "../lib/types";
import { labelForIssue, labelForRootCause } from "../lib/questions";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function LiveFeedbackCard({ feedback }: { feedback: Feedback }) {
  const isHappy = feedback.branch === "happy";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] border border-white/5 px-4 py-3 hover:bg-white/[0.07] transition">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            isHappy
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}
        >
          {feedback.rating}★
        </span>
        <div className="min-w-0 truncate">
          {isHappy ? (
            <p className="text-sm font-medium text-gray-200 truncate">
              {(feedback.satisfactionReasons ?? [])
                .map((r) => labelForIssue(r))
                .join(", ") || "Hài lòng dịch vụ"}
            </p>
          ) : (
            <p className="text-sm font-medium text-gray-200 truncate">
              <span className="text-rose-300 font-semibold">{labelForIssue(feedback.issue)}</span>
              {feedback.rootCause && (
                <span className="text-gray-400">
                  {" "}→ {labelForRootCause(feedback.issue, feedback.rootCause)}
                </span>
              )}
              {feedback.comment && (
                <span className="text-gray-400 italic"> — "{feedback.comment}"</span>
              )}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right text-xs text-gray-400">
        <p className="font-medium text-gray-300">{formatTime(feedback.timestamp)}</p>
        <p className="text-[11px] text-gray-500">{feedback.location ?? "Lobby"}</p>
      </div>
    </div>
  );
}
