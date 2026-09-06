interface ProgressBarProps {
  step: number; // 1-indexed current step
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((step / totalSteps) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-curtain-800/10">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-marquee-500 to-marquee-600 transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
