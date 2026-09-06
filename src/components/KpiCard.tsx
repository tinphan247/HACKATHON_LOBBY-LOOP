interface KpiCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "text-white",
  good: "text-emerald-400",
  warn: "text-rose-400",
};

export default function KpiCard({ label, value, tone = "neutral" }: KpiCardProps) {
  return (
    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 shadow-lg backdrop-blur-sm">
      <p className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${toneClasses[tone]}`}>
        {value}
      </p>
      <p className="mt-1 text-xs sm:text-sm font-medium text-gray-400">{label}</p>
    </div>
  );
}
