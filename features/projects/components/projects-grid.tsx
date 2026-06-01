"use client";
import React, { useState } from "react";
import { ProjectCard } from "./project-card";
import Link from "next/link";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ProjectWithStats } from "../types/project";
interface ProjectsGridProps {
  projects?: ProjectWithStats[];
}
export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!projects?.length) {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card">
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
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
        <h3 className="text-lg font-semibold text-foreground">No projects yet</h3>
        <p className="text-muted-foreground mt-1 mb-6">
          Create your first project to get started
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
        >
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects?.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="block"
        >
          <ProjectCard key={project.id} project={project} />
        </Link>
      ))}
    </div>
  );
}
