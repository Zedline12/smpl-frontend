import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import PromptComposerFooter from "../PromptComposerFooter";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { Menu, MenuItem } from "@/components/menu";
import {
  IElevenLabsV3Input,
  ElevenLabsV3InputConst,
} from "@/features/generation/types/models/elevenlabs-v3.type";
const languages = [
  { name: "Afrikaans", value: "af" },
  { name: "Arabic", value: "ar" },
  { name: "Armenian", value: "hy" },
  { name: "Assamese", value: "as" },
  { name: "Azerbaijani", value: "az" },
  { name: "Belarusian", value: "be" },
  { name: "Bengali", value: "bn" },
  { name: "Bosnian", value: "bs" },
  { name: "Bulgarian", value: "bg" },
  { name: "Catalan", value: "ca" },
  { name: "Cebuano", value: "ceb" }, // No ISO 639-1 code, using ISO 639-2
  { name: "Chichewa", value: "ny" },
  { name: "Croatian", value: "hr" },
  { name: "Czech", value: "cs" },
  { name: "Danish", value: "da" },
  { name: "Dutch", value: "nl" },
  { name: "English", value: "en" },
  { name: "Estonian", value: "et" },
  { name: "Filipino", value: "fil" }, // No ISO 639-1 code, using ISO 639-2
  { name: "Finnish", value: "fi" },
  { name: "French", value: "fr" },
  { name: "Galician", value: "gl" },
  { name: "Georgian", value: "ka" },
  { name: "German", value: "de" },
  { name: "Greek", value: "el" },
  { name: "Gujarati", value: "gu" },
  { name: "Hausa", value: "ha" },
  { name: "Hebrew", value: "he" },
  { name: "Hindi", value: "hi" },
  { name: "Hungarian", value: "hu" },
  { name: "Icelandic", value: "is" },
  { name: "Indonesian", value: "id" },
  { name: "Irish", value: "ga" },
  { name: "Italian", value: "it" },
  { name: "Japanese", value: "ja" },
  { name: "Javanese", value: "jv" },
  { name: "Kannada", value: "kn" },
  { name: "Kazakh", value: "kk" },
  { name: "Kirghiz", value: "ky" },
  { name: "Korean", value: "ko" },
  { name: "Latvian", value: "lv" },
  { name: "Lingala", value: "ln" },
  { name: "Lithuanian", value: "lt" },
  { name: "Luxembourgish", value: "lb" },
  { name: "Macedonian", value: "mk" },
  { name: "Malay", value: "ms" },
  { name: "Malayalam", value: "ml" },
  { name: "Mandarin Chinese", value: "zh" },
  { name: "Marathi", value: "mr" },
  { name: "Nepali", value: "ne" },
  { name: "Norwegian", value: "no" },
  { name: "Pashto", value: "ps" },
  { name: "Persian", value: "fa" },
  { name: "Polish", value: "pl" },
  { name: "Portuguese", value: "pt" },
  { name: "Punjabi", value: "pa" },
  { name: "Romanian", value: "ro" },
  { name: "Russian", value: "ru" },
  { name: "Serbian", value: "sr" },
  { name: "Sindhi", value: "sd" },
  { name: "Slovak", value: "sk" },
  { name: "Slovenian", value: "sl" },
  { name: "Somali", value: "so" },
  { name: "Spanish", value: "es" },
  { name: "Swahili", value: "sw" },
  { name: "Swedish", value: "sv" },
  { name: "Tamil", value: "ta" },
  { name: "Telugu", value: "te" },
  { name: "Thai", value: "th" },
  { name: "Turkish", value: "tr" },
  { name: "Ukrainian", value: "uk" },
  { name: "Urdu", value: "ur" },
  { name: "Vietnamese", value: "vi" },
  { name: "Welsh", value: "cy" },
];
interface ElevenLabsV3ComposerProps {
  isFocused: boolean;
}

interface GenericSelectorProps {
  title: string;
  options: { name: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

function GenericSelector({ title, options, value, onChange }: GenericSelectorProps) {
  return (
    <div className="bg-neutral-800 p-3 w-[100%] sm:w-[350px] md:w-[450px] rounded-lg flex flex-col gap-1 max-h-[300px] overflow-y-auto">
      <p className="text-neutral-400 font-medium">{title}</p>
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
              value === option.value
                ? "bg-neutral-500 text-neutral-100"
                : "text-neutral-400 hover:bg-neutral-500 hover:text-neutral-100"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SliderSelectorProps {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderSelector({ title, value, min, max, step, onChange }: SliderSelectorProps) {
  return (
    <div className="bg-neutral-800 p-3 w-[250px] rounded-lg flex flex-col gap-3">
      <div className="flex justify-between items-center text-neutral-400 font-medium text-sm">
        <p>{title}</p>
        <span className="text-neutral-100">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-neutral-300 hover:accent-white transition-all"
      />
    </div>
  );
}

export default function ElevenLabsV3Composer({
  isFocused,
}: ElevenLabsV3ComposerProps) {
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[AiModelsEnum.ELEVEN_LABS_V3_TTS] as IElevenLabsV3Input;

  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.ELEVEN_LABS_V3_TTS, key, value);

  const { prompt, voice, applyTextNormalization, languageCode, stability } = state;

  return (
    <>
      <div style={{ zIndex: 1 }} className="flex flex-row items-start gap-4">
        <Textarea
          value={prompt}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder="Enter the text to be generated into speech..."
          className="flex-1 min-h-[100px] text-lg text-white bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <PromptComposerFooter isFocused={isFocused}>
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {voice || "Voice"}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0 m-0">
            <GenericSelector 
              title="Voice" 
              value={voice || ""} 
              onChange={(v) => setField("voice", v)} 
              options={ElevenLabsV3InputConst.voice.map(v => ({ name: v, value: v }))} 
            />
          </MenuItem>
        </Menu>
        
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {languages.find(l => l.value === languageCode)?.name || "Language"}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0 m-0">
            <GenericSelector 
              title="Language" 
              value={languageCode || "en"} 
              onChange={(v) => setField("languageCode", v)} 
              options={languages} 
            />
          </MenuItem>
        </Menu>

        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              {applyTextNormalization || "Text Norm"}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0 m-0">
             <GenericSelector 
              title="Text Normalization" 
              value={applyTextNormalization || "auto"} 
              onChange={(v) => setField("applyTextNormalization", v)} 
              options={ElevenLabsV3InputConst.applyTextNormalization.map(v => ({ name: v.toUpperCase(), value: v }))} 
            />
          </MenuItem>
        </Menu>

        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {stability ?? 0.5}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0 m-0">
            <SliderSelector 
              title="Stability" 
              value={stability ?? 0.5} 
              min={0}
              max={1}
              step={0.1}
              onChange={(v) => setField("stability", v)} 
            />
          </MenuItem>
        </Menu>

      </PromptComposerFooter>
    </>
  );
}
