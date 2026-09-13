interface KpiCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
  isLight?: boolean;
}

export default function KpiCard({
  label,
  value,
  tone = "neutral",
  isLight = false,
}: KpiCardProps) {
  const toneClassesDark: Record<NonNullable<KpiCardProps["tone"]>, string> = {
    neutral: "text-white",
    good: "text-emerald-400",
    warn: "text-rose-400",
  };

  const toneClassesLight: Record<NonNullable<KpiCardProps["tone"]>, string> = {
    neutral: "text-slate-900",
    good: "text-emerald-600",
    warn: "text-rose-600",
  };

  const toneClass = isLight ? toneClassesLight[tone] : toneClassesDark[tone];

  return (
    <div
      className={`rounded-2xl p-5 transition border ${
        isLight
          ? "bg-white border-slate-200 shadow-sm"
          : "bg-white/[0.06] border-white/10 shadow-lg backdrop-blur-sm"
      }`}
    >
      <p className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${toneClass}`}>
        {value}
      </p>
      <p className={`mt-1 text-xs sm:text-sm font-medium ${isLight ? "text-slate-500" : "text-gray-400"}`}>
        {label}
      </p>
    </div>
  );
}
