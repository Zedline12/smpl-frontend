import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import PromptComposerFooter from "../PromptComposerFooter";
import { IKlingV3TextToVideoInput, KlingV3TextToVideoInputConst } from "@/features/generation/types/models/kling-v3-text-to-video.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

interface KlingV3TextToVideoComposerProps {
  isFocused: boolean;
}

export default function KlingV3TextToVideoComposer({
  isFocused,
}: KlingV3TextToVideoComposerProps) {
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[
    AiModelsEnum.KLING_V3_TEXT_TO_VIDEO
  ] as IKlingV3TextToVideoInput;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.KLING_V3_TEXT_TO_VIDEO, key, value);

  const {
    prompt,
    duration,
    aspectRatio,
    generateAudio,
  } = state;

  return (
    <>
      <div
        style={{ zIndex: 1 }}
        className="flex flex-col sm:flex-row items-start gap-4"
      >
        <Textarea
          value={prompt || ""}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder={`Describe the video you want to generate...`}
          className="flex-1 min-h-[100px] text-lg text-white bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <PromptComposerFooter isFocused={isFocused}>
        <div className="grid grid-cols-3 sm:flex sm:flex-row w-full sm:mt-0">
          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                {aspectRatio}
              </div>
            }
            align="left"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[200px]">
              <AspectRatioSelectorComponent
                options={KlingV3TextToVideoInputConst.aspectRatio as any}
                value={aspectRatio as any}
                onChange={(value: any) => setField("aspectRatio", value)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                    clipRule="evenodd"
                  />
                </svg>
                Duration: {duration}s
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[max-content]">
              <DurationSelector
                options={KlingV3TextToVideoInputConst.duration}
                value={duration}
                onChange={(v) => setField("duration", v)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                Audio: {generateAudio ? "Yes" : "No"}
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[240px]">
              <GenerateAudioSelector
                value={generateAudio}
                onChange={(v) => setField("generateAudio", v)}
              />
            </MenuItem>
          </Menu>
        </div>
      </PromptComposerFooter>
    </>
  );
}
