import { Button } from "@/components/ui/button";
import { KlingV3ProMotionControlInputConst } from "@/features/generation/types/models/kling-v3-pro-motion-control";

interface CharacterOrientationSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function CharacterOrientationSelector({
  value,
  onChange,
}: CharacterOrientationSelectorProps) {
  return (
    <div className="w-full bg-neutral-800 p-2 rounded-lg grid grid-cols-2 gap-2">
      {KlingV3ProMotionControlInputConst.characterOrientation.map((option) => (
        <Button
          key={option}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            value === option || (!value && option === "image")
              ? "bg-primary text-primary-foreground"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
          onClick={() => onChange(option)}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </Button>
      ))}
    </div>
  );
}
