"use client";

import { useProjectsQuery } from "@/features/projects/hooks/projects";
import { ProjectsGrid } from "@/features/projects/components/projects-grid";
import ProjectsPageHeader from "@/features/projects/components/ProjectsPageHeader";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjectsQuery();

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-red-500">
        Failed to load projects. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ProjectsPageHeader />
      <ProjectsGrid projects={projects} />
    </div>
  );
}
