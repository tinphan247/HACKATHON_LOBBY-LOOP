import { CountedItem } from "../lib/analytics";

interface InsightBarListProps {
  items: CountedItem[];
  emptyLabel: string;
}

export default function InsightBarList({ items, emptyLabel }: InsightBarListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-sm text-paper-100/40">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.count));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[15px] text-paper-100/85">{item.label}</span>
            <span className="text-sm font-semibold tabular-nums text-marquee-400">
              {item.count}
            </span>
          </div>
          <div className="insight-bar-track h-2 w-full">
            <div
              className="insight-bar-fill h-2"
              style={{ width: `${Math.max(6, (item.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
