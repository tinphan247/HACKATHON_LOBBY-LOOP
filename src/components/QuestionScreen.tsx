import { ReactNode } from "react";

interface QuestionScreenProps {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  eyebrow?: string;
  question: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function QuestionScreen({
  step,
  totalSteps,
  onBack,
  eyebrow = "Vui lòng chọn câu trả lời bạn đồng tình nhất ở bên dưới",
  question,
  children,
  footer,
}: QuestionScreenProps) {
  const pct = Math.min(100, Math.round((step / totalSteps) * 100));

  return (
    <div
      className="relative flex min-h-dvh w-full items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6"
      style={{ backgroundImage: "url('/cinema-bg.png')" }}
    >
      {/* Dark overlay for cinema backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Header with Galaxy Cinema Logos */}
      <header className="pointer-events-none absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between z-10">
        <img
          src="/galaxy-logo.png"
          alt="Galaxy Cinema"
          className="h-9 sm:h-12 w-auto object-contain drop-shadow-md"
        />
        <div className="text-right">
          <span className="font-bold tracking-wider text-amber-400 text-sm sm:text-base drop-shadow">
            Galaxy Cine<span className="text-amber-500">X</span>
          </span>
        </div>
      </header>

      {/* Main Card (Mobile-proportioned: w-full max-w-[420px]) */}
      <div className="relative z-10 my-auto w-full max-w-[420px] rounded-[24px] sm:rounded-[28px] bg-white p-5 sm:p-6 shadow-2xl transition-all">
        {/* Top Progress bar (golden/yellow line as in Hình 1) */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Step Badge (Cyan circular badge as in Hình 2) */}
        <div className="flex items-center justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00BCD4] text-xs sm:text-sm font-bold text-white shadow-sm">
            {step}
          </div>
          <span className="text-xs font-semibold text-gray-400 tracking-wide">
            {step} / {totalSteps}
          </span>
        </div>

        {/* Question Title & Subtitle */}
        <div className="mt-3">
          <h1 className="text-[18px] sm:text-[20px] font-bold leading-snug text-gray-900">
            {question}
          </h1>
          {eyebrow && (
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500 leading-relaxed">
              {eyebrow}
            </p>
          )}
        </div>

        {/* Question Body (Options or Rating row) */}
        <div className="mt-5">{children}</div>

        {/* Bottom Actions (Matching Hình 2) */}
        {footer && <div className="mt-6">{footer}</div>}
      </div>

      {/* Bottom-left back button (Matching Hình 2) */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl transition-transform hover:bg-gray-100 active:scale-95 text-lg font-bold"
        >
          ←
        </button>
      )}
    </div>
  );
}
