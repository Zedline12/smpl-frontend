import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import { Plus, X, Image as ImageIcon, Trash2, ListPlus, Layers } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import { Button } from "@/components/ui/button";
import { IKlingV3ImageToVideoInput, KlingV3ImageToVideoInputConst } from "@/features/generation/types/models/kling-v3-image-to-video.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KlingV3ImageToVideoComposerProps {
  isFocused: boolean;
}

const EMPTY_ARRAY: string[] = [];

export default function KlingV3ImageToVideoComposer({
  isFocused,
}: KlingV3ImageToVideoComposerProps) {
  const [isStartImageManagerOpen, setIsStartImageManagerOpen] = useState(false);
  const [isEndImageManagerOpen, setIsEndImageManagerOpen] = useState(false);
  
  const [isMultiPromptOpen, setIsMultiPromptOpen] = useState(false);
  const [isElementsOpen, setIsElementsOpen] = useState(false);
  const [activeMediaDialog, setActiveMediaDialog] = useState<{
    index: number;
    field: "referenceImageUrls" | "frontalImageUrl" | "videoUrl";
  } | null>(null);

  const { states, setField: setModelField } = useAiModelStore();
  const state = states[
    AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO
  ] as IKlingV3ImageToVideoInput;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO, key, value);
    
  const {
    prompt,
    startImageUrl,
    endImageUrl,
    duration,
    generateAudio,
    multiPrompt,
    elements,
  } = state;

  const hasMultiPrompt = (multiPrompt?.length ?? 0) > 0;
  
  return (
    <>
      <div
        style={{ zIndex: 1 }}
        className="flex flex-col sm:flex-row items-start gap-4"
      >
        <div className="flex flex-row gap-4 flex-wrap max-w-[400px]">
          {/* Start Image Selection */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-primary-foreground">Start Image</span>
            {startImageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                <img
                  src={startImageUrl}
                  alt="Start"
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={() => setField("startImageUrl", "")}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsStartImageManagerOpen(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            )}
          </div>

          {/* End Image Selection */}
          <div className={`flex flex-col gap-1 items-center ${hasMultiPrompt ? "opacity-50 pointer-events-none" : ""}`}>
            <span className="text-xs text-primary-foreground">End Image</span>
            {endImageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                <img
                  src={endImageUrl}
                  alt="End"
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={() => setField("endImageUrl", undefined)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEndImageManagerOpen(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            )}
          </div>
        </div>

        <Textarea
          value={prompt || ""}
          onChange={(e) => setField("prompt", e.target.value)}
          disabled={hasMultiPrompt}
          placeholder={hasMultiPrompt ? "Prompt disabled (using Multi Prompt)" : `Describe the motion and scene details...`}
          className="flex-1 min-h-[100px] text-lg text-white bg-transparent border-none focus:ring-0 resize-none outline-none pt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <MediaManagerDialog
        open={isStartImageManagerOpen}
        onOpenChange={setIsStartImageManagerOpen}
        selectedImage={startImageUrl}
        onSelect={(images) => setField("startImageUrl", images[0])}
        maxSelections={1}
      />

      <MediaManagerDialog
        open={isEndImageManagerOpen}
        onOpenChange={setIsEndImageManagerOpen}
        selectedImage={endImageUrl!}
        onSelect={(images) => setField("endImageUrl", images[0])}
        maxSelections={1}
      />

      <MediaManagerDialog
        open={activeMediaDialog !== null}
        onOpenChange={(open) => !open && setActiveMediaDialog(null)}
        mediaType={activeMediaDialog?.field === "videoUrl" ? "video" : "image"}
        maxSelections={activeMediaDialog?.field === "referenceImageUrls" ? 5 : 1}
        selectedImages={
           activeMediaDialog?.field === "referenceImageUrls"
             ? (elements?.[activeMediaDialog.index]?.referenceImageUrls || EMPTY_ARRAY)
             : undefined
        }
        selectedImage={
           activeMediaDialog?.field !== "referenceImageUrls" && activeMediaDialog !== null
             ? (elements?.[activeMediaDialog.index]?.[activeMediaDialog.field] || undefined)
             : undefined
        }
        onSelect={(urls) => {
          if (!activeMediaDialog) return;
          const { index, field } = activeMediaDialog;
          const newEls = [...(elements || [])];
          if (field === "referenceImageUrls") {
            newEls[index].referenceImageUrls = urls;
          } else {
            newEls[index] = { ...newEls[index], [field]: urls[0] };
          }
          setField("elements", newEls);
        }}
      />

      <PromptComposerFooter isFocused={isFocused}>
        <Dialog open={isMultiPromptOpen} onOpenChange={setIsMultiPromptOpen}>
          <DialogTrigger asChild>
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
              <ListPlus className="w-4 h-4" />
              Multi Prompt ({multiPrompt?.length || 0})
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] md:max-w-[600px] bg-background-light text-white border-white/10 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Multi Prompts</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              {multiPrompt?.map((mp, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-white/10 rounded-xl bg-white/5 relative">
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <Label className="text-xs text-primary-foreground">Prompt</Label>
                    <Textarea 
                      value={mp.prompt} 
                      onChange={(e) => {
                        const newMp = [...multiPrompt];
                        newMp[index].prompt = e.target.value;
                        setField("multiPrompt", newMp);
                      }}
                      className="min-h-[80px] text-sm bg-black/20"
                      placeholder="Prompt description..."
                    />
                  </div>
                  <div className="w-full sm:w-24 flex flex-col gap-2">
                    <Label className="text-xs text-primary-foreground">Duration (s)</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={15} 
                      value={mp.duration} 
                      onChange={(e) => {
                         const newMp = [...multiPrompt];
                         newMp[index].duration = parseInt(e.target.value) || 1;
                         setField("multiPrompt", newMp);
                      }}
                      className="bg-black/20 text-sm h-10"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 sm:mt-6 sm:self-start hover:bg-red-500/20 text-red-400"
                    onClick={() => {
                        const newMp = [...multiPrompt];
                        newMp.splice(index, 1);
                        setField("multiPrompt", newMp);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                onClick={() => setField("multiPrompt", [...(multiPrompt || []), { prompt: "", duration: 5 }])}
                className="w-full border-dashed border-2 bg-transparent hover:bg-white/5 border-white/20 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isElementsOpen} onOpenChange={setIsElementsOpen}>
          <DialogTrigger asChild>
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
              <Layers className="w-4 h-4" />
              Elements ({elements?.length || 0})
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] md:max-w-[600px] bg-background-light text-white border-white/10 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Elements</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              {elements?.map((el, index) => (
                <div key={index} className="flex flex-col gap-4 p-4 border border-white/10 rounded-xl bg-white/5 relative mt-4">
                  <div className="absolute -top-3 left-3 bg-background-light px-2 text-xs text-muted-foreground border border-white/10 rounded-full">
                    Element {index + 1}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 hover:bg-red-500/20 text-red-400 z-10"
                    onClick={() => {
                        const newEls = [...elements];
                        newEls.splice(index, 1);
                        setField("elements", newEls);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex flex-wrap gap-6 pt-6">
                    {/* Frontal Image */}
                    <div className="flex flex-col gap-2 items-center">
                      <span className="text-xs text-primary-foreground">Frontal Image</span>
                      {el.frontalImageUrl ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                          <img src={el.frontalImageUrl} className="w-full h-full object-cover" />
                          <Button onClick={() => {
                              const newEls = [...elements];
                              newEls[index].frontalImageUrl = undefined;
                              setField("elements", newEls);
                            }} 
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          ><X className="w-3 h-3 text-white" /></Button>
                        </div>
                      ) : (
                        <Button onClick={() => setActiveMediaDialog({ index, field: "frontalImageUrl" })} className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group">
                          <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                          <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                      )}
                    </div>

                    {/* Video URL */}
                    <div className="flex flex-col gap-2 items-center">
                      <span className="text-xs text-primary-foreground">Video</span>
                      {el.videoUrl ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5 flex items-center justify-center">
                          <video src={el.videoUrl} className="w-full h-full object-cover" />
                          <Button onClick={() => {
                              const newEls = [...elements];
                              newEls[index].videoUrl = undefined;
                              setField("elements", newEls);
                            }} 
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          ><X className="w-3 h-3 text-white" /></Button>
                        </div>
                      ) : (
                        <Button onClick={() => setActiveMediaDialog({ index, field: "videoUrl" })} className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary transition-colors mb-1"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                          <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Reference Images */}
                    <div className="flex flex-col gap-2 items-start flex-1 min-w-[200px]">
                      <span className="text-xs text-primary-foreground">Reference Images</span>
                      <div className="flex gap-2 flex-wrap items-center">
                        {el.referenceImageUrls?.map((url, i) => (
                           <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                             <img src={url} className="w-full h-full object-cover" />
                             <Button onClick={() => {
                                 const newEls = [...elements];
                                 newEls[index].referenceImageUrls = newEls[index].referenceImageUrls?.filter((_, idx) => idx !== i);
                                 setField("elements", newEls);
                               }} 
                               className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             ><X className="w-3 h-3 text-white" /></Button>
                           </div>
                        ))}
                        <Button onClick={() => setActiveMediaDialog({ index, field: "referenceImageUrls" })} className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group">
                          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => setField("elements", [...(elements || []), {}])}
                className="w-full border-dashed border-2 bg-transparent hover:bg-white/5 border-white/20 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Element
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                options={KlingV3ImageToVideoInputConst.duration}
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
      </PromptComposerFooter>
    </>
  );
}

