"use client";
import { PromptInput } from "@/components/prompt-input";
import { GalleryGrid } from "@/components/gallery-grid";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "@/components/create-project-modal";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useLatestGenerations } from "@/features/projects/hooks/use-latest-generations";

export default function WorkspacePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const { projects } = useProjects();
  const { latestGenerations } = useLatestGenerations();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <section className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">
            Hello, Creative.
          </h1>
          <p className="text-gray-500">
            Ready to create something amazing today?
          </p>
        </div>
        {projects.length > 0 ? (
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value === "new") {
                  setIsCreateModalOpen(true);
                  e.target.value = ""; // Reset select
                } else if (e.target.value) {
                  setSelectedProjectId(e.target.value);
                  // router.push(`/workspace/projects/${e.target.value}`);
                }
              }}
              defaultValue=""
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium shadow-sm transition-all cursor-pointer min-w-[200px]"
            >
              <option value="" disabled>
                Select a project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
              <option
                value="new"
                className="text-blue-600 font-semibold border-t border-gray-100"
              >
                + Create New Project
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Project
          </button>
        )}
      </section>

      <section>
        <PromptInput projectId={selectedProjectId} />
      </section>
      <h1 className="text-2xl font-bold text-secondary">Latest Generations</h1>
      <section className="pt-8 border-t border-gray-200">
        <GalleryGrid media={latestGenerations} />
      </section>
    </div>
  );
}
