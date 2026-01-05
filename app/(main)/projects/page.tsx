"use client";

import { ProjectsGrid } from "@/features/projects/components/projects-grid";

export default function ProjectsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            Manage and organize your creative work
          </p>
        </div>

        {/* Optional: Add header actions if needed */}
      </div>

      <ProjectsGrid />
    </div>
  );
}
