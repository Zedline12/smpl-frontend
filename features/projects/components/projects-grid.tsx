import React, { useState } from "react";
import { useProjects } from "../hooks/use-projects";
import { ProjectCard } from "./project-card";
import Link from "next/link";
import { CreateProjectModal } from "@/components/create-project-modal";

export function ProjectsGrid() {
  const { projects, isLoading, error } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 h-48 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg mb-4" />
            <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 text-red-600">
        <p className="font-medium">Error loading projects</p>
        <p className="text-sm mt-1 opacity-80">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
        <p className="text-gray-500 mt-1 mb-6">
          Create your first project to get started
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {/* Create New Card */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group h-full"
      >
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span className="font-medium text-gray-900">Create New Project</span>
      </button>

      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/workspace/projects/${project.id}`}
          className="block"
        >
          <ProjectCard key={project.id} project={project} />
        </Link>
      ))}
    </div>
  );
}
