
import { PromptInput } from "@/features/ai-media/components/prompt-input";
import { MediaFeature } from "@/features/media/components/MediaFeature";
import { MediaGrid } from "@/features/media/components/MediaGrid";
import { fetchWithToken } from "@/lib/fetcher";
import { Media } from "@/lib/types/project.type";
import Image from "next/image";
export default async function WorkspacePage() {
   

  return ( 
    <div className="relative min-h-screen bg-grid overflow-hidden">
  {/* Glow 1 */}
  <div className="
    absolute
    top-[-150px]
    left-[-150px]
    w-[400px]
    h-[400px]
    bg-[#8663ff]
    rounded-full
    blur-[120px]
    opacity-40
  " />

  {/* Glow 2 */}
  <div className="
    absolute
    bottom-[-150px]
    right-[-150px]
    w-[500px]
    h-[500px]
    bg-[#6b41ff]
    rounded-full
    blur-[140px]
    opacity-30
  " />

  {/* Content */}
  <main className=" z-10">
    
    <div className="p-8  max-w-6xl mx-auto space-y-12">
     

      <section>
        <MediaFeature/>
      </section>
    </div>
  </main>
</div>
  );
}
