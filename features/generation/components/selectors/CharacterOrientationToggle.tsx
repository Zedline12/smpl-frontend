import { Button } from "@/components/ui/button";
import { KlingV3ProMotionControlInputConst } from "@/features/generation/types/models/kling-v3-pro-motion-control";

interface CharacterOrientationToggleProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function CharacterOrientationToggle({
  value,
  onChange,
}: CharacterOrientationToggleProps) {
  const isVideo = value === "video";
  const safeValue = value || "image";

  return (
    <div className="w-full bg-neutral-800 p-2 rounded-lg flex flex-col gap-2">
      <p className="text-primary-foreground font-medium text-sm px-1">Character Orientation</p>
      <p className="text-xs text-secondary-foreground px-1">Controls whether the output character's orientation matches the reference image or video. </p>
      <div className="relative flex rounded-md bg-neutral-900 border border-white/5 p-1">
        <div
          className={`absolute inset-y-1 w-[calc(50%-4px)] bg-primary rounded transition-all duration-300 ease-in-out ${
            isVideo ? "left-[calc(50%+2px)]" : "left-1"
          }`}
        />
        {KlingV3ProMotionControlInputConst.characterOrientation.map((option) => (
          <Button
            key={option}
            className={`relative z-10 w-1/2 flex-1 py-1.5 text-xs font-medium transition-colors ${
              safeValue === option ? "text-primary-foreground" : "text-neutral-400 hover:text-white"
            }`}
            onClick={() => onChange(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}
