import { ChoiceOption } from "../lib/questions";

interface OptionGridProps {
  options: ChoiceOption[];
  selected: string[];
  onToggle: (id: string) => void;
  maxSelect?: number;
}

export default function OptionGrid({
  options,
  selected,
  onToggle,
  maxSelect,
}: OptionGridProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        const atLimit = !!maxSelect && selected.length >= maxSelect && !active;
        const isMultiple = (maxSelect ?? 1) > 1;

        return (
          <button
            key={opt.id}
            type="button"
            disabled={atLimit}
            onClick={() => onToggle(opt.id)}
            className={[
              "group flex items-center rounded-2xl px-4 py-3.5 text-left transition-all duration-150 border",
              active
                ? "bg-[#E0F7FA]/40 border-[#00BCD4] text-gray-900 shadow-sm"
                : atLimit
                ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#F4F7F9] border-gray-100/80 hover:bg-[#EDF2F7] text-gray-800",
            ].join(" ")}
          >
            {/* Custom pure-CSS Radio / Checkbox without icons */}
            <span
              className={[
                "mr-3 flex shrink-0 items-center justify-center transition-colors bg-white",
                isMultiple ? "h-5 w-5 rounded-md border-2" : "h-5 w-5 rounded-full border-2",
                active
                  ? "border-[#00BCD4]"
                  : atLimit
                  ? "border-gray-200"
                  : "border-gray-300 group-hover:border-gray-400",
              ].join(" ")}
            >
              {active && (
                <span
                  className={
                    isMultiple
                      ? "h-2.5 w-2.5 rounded-[2px] bg-[#00BCD4]"
                      : "h-2.5 w-2.5 rounded-full bg-[#00BCD4]"
                  }
                />
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
