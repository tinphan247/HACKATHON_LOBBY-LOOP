import { CountedItem } from "../lib/analytics";

interface InsightBarListProps {
  items: CountedItem[];
  emptyLabel: string;
  isLight?: boolean;
}

export default function InsightBarList({
  items,
  emptyLabel,
  isLight = false,
}: InsightBarListProps) {
  if (items.length === 0) {
    return (
      <p className={`py-6 text-xs sm:text-sm ${isLight ? "text-slate-400" : "text-gray-500"}`}>
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.count));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className={`text-xs sm:text-sm font-medium ${isLight ? "text-slate-800" : "text-gray-200"}`}>
              {item.label}
            </span>
            <span className="text-xs sm:text-sm font-bold tabular-nums text-orange-500">
              {item.count} lượt
            </span>
          </div>
          <div
            className={`h-2.5 w-full rounded-full overflow-hidden ${
              isLight ? "bg-slate-200/80" : "bg-white/10"
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
              style={{ width: `${Math.max(6, (item.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
