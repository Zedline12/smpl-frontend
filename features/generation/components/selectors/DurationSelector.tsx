import { VideoDuration } from "@/features/media/types/media";

interface DurationSelectorProps<T extends number = number> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}
export default function DurationSelector<T extends number = number>({
  options,
  value,
  onChange,
  disabled,
}: DurationSelectorProps<T>) {
  return (
    <div className="w-full bg-neutral-800 p-3 rounded-lg flex flex-col gap-1">
      <p className="text-neutral-400 font-medium">Duration (Seconds)</p>
      <div className="grid gap-2  grid-cols-[repeat(auto-fit,minmax(80px,1fr))]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => !disabled && onChange(option)}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
              value === option
                ? "bg-neutral-500 text-neutral-100"
                : "text-neutral-400 hover:bg-neutral-500 hover:text-neutral-100 "
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
