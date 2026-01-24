"use client";
import { PromptInput } from "@/features/ai-media/components/prompt-input";
import { useEffect, useState } from "react";
import { Project } from "@/features/projects/types/project";
import { MediaGrid } from "./MediaGrid";
import { useProjectMedia } from "@/features/media/hooks/useProjectMedia";
import { ProjectPicker } from "./ProjectPicker";
import { Label } from "@/components/ui/label";

export function MediaFeature() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { media, loading } = useProjectMedia(selectedProject?.id ?? "");
  useEffect(() => {
    fetch("/api/projects/me")
      .then((res) => res.json())
      .then((data: any) => {
        setProjects(data.data);
        setSelectedProject(data.data.find((p: Project) => p.isMain));
      });
  }, []);
  console.log(selectedProject);

  return (
    <>
      <section className="w-1/2 flex items-center fixed bottom-10 z-10">
        <PromptInput />
      </section>
      <section className="bg-black/20 backdrop-blur-xl">
        <section className=" border-b border-white/20  p-6 flex flex-row justify-between items-center mb-10 ">
          <div className="flex flex-row items-center gap-10 ">
            <ProjectPicker
              projects={projects}
              project={selectedProject}
              onSelect={setSelectedProject}
            />
            <div className="flex flex-row gap-8 ">
              <div className="flex flex-col gap-1 items-center">
                <Label className="text-foreground text-xs ">Photos</Label>
                <Label className="text-foreground  text-xs">6</Label>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Label className="text-foreground text-xs ">Videos</Label>
                <Label className="text-foreground  text-xs">0</Label>
              </div>
              <div className="flex flex-col gap-1 items-center">
                <Label className="text-foreground text-xs ">Credits</Label>
                <Label className="text-foreground  text-xs">3500</Label>
              </div>
            </div>
          </div>
          <div className="div flex flex-row gap-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 text-foreground"
            >
              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
              <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 text-red-500"
            >
              <path
                fillRule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </section>
        <section>
          <MediaGrid media={media} />
        </section>
      </section>
    </>
  );
}
