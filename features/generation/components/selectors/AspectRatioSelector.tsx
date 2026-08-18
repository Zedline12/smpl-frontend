
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
    <div className="bg-background-light w-full p-3 rounded-lg flex flex-col gap-1">
      <p className="text-muted-foreground font-medium">Aspect Ratio</p>
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
              value === option
                ? "bg-background-lightest text-foreground"
                : "text-muted-foreground hover:bg-background-lightest hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
