import { DashboardAlert } from "../lib/types";

interface Props {
  alert: DashboardAlert;
  isLight?: boolean;
}

export default function AlertBanner({ alert, isLight = false }: Props) {
  return (
    <div
      className={`rounded-2xl p-5 border transition ${
        isLight
          ? "bg-rose-50/90 border-rose-300 text-slate-900 shadow-sm"
          : "bg-rose-950/30 border-rose-500/40 text-white backdrop-blur-sm"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
              isLight
                ? "bg-rose-600 text-white border-rose-700"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            CẢNH BÁO VẬN HÀNH
          </span>
          <span className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
            Phát hiện trong {alert.windowLabel}
          </span>
        </div>

        <p className={`text-sm sm:text-base font-bold ${isLight ? "text-rose-950" : "text-white"}`}>
          Vấn đề "{alert.issueLabel}" đang tăng bất thường ({alert.count} lượt phản ánh)
        </p>

        <div
          className={`mt-1 rounded-xl p-3 text-xs sm:text-sm border ${
            isLight
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-amber-500/15 border-amber-500/30 text-amber-200"
          }`}
        >
          <span className="font-bold">Đề xuất xử lý ngay:</span> {alert.recommendation}
        </div>
      </div>
    </div>
  );
}
