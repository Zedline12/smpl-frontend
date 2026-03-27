
import { AllModelsAspectRatio } from "@/features/generation/types/generation";

interface AspectRatioSelectorProps {
  options: readonly AllModelsAspectRatio[];
  value: AllModelsAspectRatio;
  onChange: (value: AllModelsAspectRatio) => void;
}

export default function AspectRatioSelector({
  options,
  value,
  onChange,
}: AspectRatioSelectorProps) {
  return (
    <div className="bg-neutral-800 w-full p-3 rounded-lg flex flex-col gap-1">
      <p className="text-neutral-400 font-medium">Aspect Ratio</p>
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
              value === option
                ? "bg-neutral-500 text-neutral-100"
                : "text-neutral-400 hover:bg-neutral-500 hover:text-neutral-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
