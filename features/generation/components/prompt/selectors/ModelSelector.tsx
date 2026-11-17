import { Model } from "@/features/generation/enums/models.enum";
import { Menu, MenuItem } from "@/components/menu";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { Image, Video } from "lucide-react";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { ModelRow } from "@/features/generation/components/ModelRow";

interface ModelSelectorProps {
  models: Model[];
}

export default function ModelSelector({ models }: ModelSelectorProps) {
  const {
    model: currentModel,
    setModel,
    mediaType,
  } = useAiGenerationControlStore();

  return (
    <Menu
      direction="up"
      align="left"
      className="pointer "
      trigger={
        <div className="flex min-w-0 items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
          {mediaType === GenerationTypeEnum.VIDEO ? (
            <Video size={20} />
          ) : (
            <Image size={20} />
          )}
          <span className="truncate">
            {models.find((m) => m.id === currentModel)?.name || "Select Model"}
          </span>
        </div>
      }
    >
      <div className="bg-popover custom-scrollbar max-h-[60vh] w-[min(500px,calc(100vw-40px))] overflow-y-auto p-1">
        {models.map((m) => (
          <MenuItem
            className=" w-full"
            key={m.id}
            onClick={() => setModel(m.id)}
          >
            <ModelRow model={m} isActive={m.id === currentModel} compact />
          </MenuItem>
        ))}
      </div>
    </Menu>
  );
}
