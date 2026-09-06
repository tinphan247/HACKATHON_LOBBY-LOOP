import { DashboardAlert } from "../lib/types";

export default function AlertBanner({ alert }: { alert: DashboardAlert }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 backdrop-blur-sm">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold text-base">
        !
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-300">
            Lobby Alert — Cảnh báo tức thì
          </span>
        </div>
        <p className="mt-1.5 text-[15px] font-semibold text-white">
          Vấn đề "{alert.issueLabel}" đang tăng bất thường trong ca trực
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Ghi nhận {alert.count} khách phản ánh trong {alert.windowLabel}
        </p>
        <div className="mt-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm text-amber-200">
          <strong>Đề xuất hành động:</strong> {alert.recommendation}
        </div>
      </div>
    </div>
  );
}
