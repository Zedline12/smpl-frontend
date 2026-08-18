import { ImageResolution, VideoResolution } from "@/features/media/types/media";

interface ResolutionSelectorProps {
  options: readonly (ImageResolution | VideoResolution)[];
  value: ImageResolution | VideoResolution;
  onChange: (value: ImageResolution | VideoResolution) => void;
}
export default function ResolutionSelector({
  options,
  value,
  onChange,
}: ResolutionSelectorProps) {
  return (
    <div className=" bg-background-light p-3 w-full rounded-lg flex flex-col gap-1">
      <p className="text-muted-foreground font-medium">Resolution</p>
      <div className="grid gap-2  grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
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
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
