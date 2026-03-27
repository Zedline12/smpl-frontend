"use client";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";

export default function CreateImagePage() {
  

  return (
    <>
      <div className="md:grid hidden w-full  h-full  text-foreground">
        {/* <div className="col-span-1 ">
          <CreateImageParameter />
        </div> */}
        <div className="relative col-span-2 px-5 w-full   flex flex-col justify-between gap-2">
          <div className="h-[500px] ">
            <MediaExplorer />
          </div>
           <section className=" w-full    flex items-center justify-center">
          <PromptComposer />
        </section>
          {/* <div className="absolute border border-neutral-800 rounded-lg p-5 bottom-0 left-0 w-full">
            <ImageGenerationInput onGeneration={handleGeneration} />
          </div> */}
        </div>
      </div>
      <div className="p-5 md:hidden  block h-full grid grid-cols-1 gap-6 text-foreground">
        <div className="col-span-1 h-[600px] ">
          <MediaExplorer />
        </div>
        <section className=" w-full   z-10 flex items-center justify-center">
          <PromptComposer />
        </section>
      </div>
    </>
  );
}
