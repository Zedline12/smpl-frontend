"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useProject } from "@/features/projects/hooks/use-project";
import { GalleryGrid } from "@/components/gallery-grid";
import { PromptInput } from "@/components/prompt-input"; // Assuming you want prompt input here too, or maybe not. User didn't strictly ask, but often relevant. I'll include passing media to gallery grid as requested.

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Project not found"}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 mt-1">
          Last updated {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* <PromptInput />  Optional: Uncomment if users should generate into this project */}

      <GalleryGrid media={project.media} />
    </div>
  );
}
