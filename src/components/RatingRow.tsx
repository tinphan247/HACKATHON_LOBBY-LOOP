export interface RatingOption {
  value: number;
  label: string;
}

export const RATING_OPTIONS: RatingOption[] = [
  { value: 1, label: "Rất không hài lòng" },
  { value: 2, label: "Không hài lòng" },
  { value: 3, label: "Bình thường" },
  { value: 4, label: "Hài lòng" },
  { value: 5, label: "Rất hài lòng" },
];

interface RatingRowProps {
  value: number | null;
  onSelect: (value: number) => void;
}

export default function RatingRow({ value, onSelect }: RatingRowProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {RATING_OPTIONS.map((opt) => {
        const active = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={[
              "group flex items-center rounded-2xl px-4 py-3.5 text-left transition-all duration-150 border",
              active
                ? "bg-[#E0F7FA]/40 border-[#00BCD4] text-gray-900 shadow-sm"
                : "bg-[#F4F7F9] border-gray-100/80 hover:bg-[#EDF2F7] text-gray-800",
            ].join(" ")}
          >
            {/* Pure-CSS Radio button without icons */}
            <span
              className={[
                "mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors bg-white",
                active
                  ? "border-[#00BCD4]"
                  : "border-gray-300 group-hover:border-gray-400",
              ].join(" ")}
            >
              {active && (
                <span className="h-2.5 w-2.5 rounded-full bg-[#00BCD4]" />
              )}
            </span>

            <span className="flex-1 text-[14px] sm:text-[15px] font-medium leading-snug">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
