import { AiModelsEnum, Model } from "@/features/generation/enums/models.enum";
import { Menu, MenuItem } from "@/components/menu";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { Image, Video } from "lucide-react";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
          {mediaType === GenerationTypeEnum.VIDEO ? (
            <Video size={20} />
          ) : (
            <Image size={20} />
          )}
          <span>
            {models.find((m) => m.id === currentModel)?.name || "Select Model"}
          </span>
        </div>
      }
    >
      <div className="p-1 bg-black/80 backdrop-blur-2xl  min-w-[250px] w-[500px]">
        {models.map((m) => (
          <MenuItem
            className=" w-full"
            key={m.id}
            onClick={() => setModel(m.id)}
          >
            <div className="flex gap-3  items-start p-1 w-full">
              <div className="shrink-0 bg-white/10 text-2xl relative w-12 h-12 rounded-md flex justify-center items-center bg-button-secondary-hover">
                {m.svg}
              </div>
              <div className="flex flex-col text-left justify-center flex-1">
                <span className="font-bold text-primary-foreground text-md">
                  {m.name}
                </span>
                {m.description && (
                  <span className="text-secondary-foreground text-xs leading-snug mt-1">
                    {m.description}
                  </span>
                )}
              </div>
            </div>
          </MenuItem>
        ))}
      </div>
    </Menu>
  );
}
