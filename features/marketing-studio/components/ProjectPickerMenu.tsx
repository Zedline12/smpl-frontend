"use client";

import { useEffect } from "react";
import { Menu, MenuItem } from "@/components/menu";
import { useProjectsQuery } from "@/features/projects/hooks/projects";

const FOLDER_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-5"
  >
    <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
  </svg>
);

interface ProjectPickerMenuProps {
  projectId: string | null;
  onChange: (projectId: string) => void;
}

/**
 * A standalone copy of the composer's ProjectSelector — that one threads
 * `projectId` through `useAiGenerationControlStore`, which is the main /create
 * page's global state and unrelated to this page. Local state here instead, so
 * the two pages can't clobber each other.
 */
export function ProjectPickerMenu({
  projectId,
  onChange,
}: ProjectPickerMenuProps) {
  const { data: projects = [] } = useProjectsQuery();

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      onChange(projects[0].id);
    }
  }, [projects, projectId, onChange]);

  const current = projects.find((project) => project.id === projectId);

  return (
    <Menu
      direction="up"
      trigger={
        <div className="border-border bg-background-light hover:bg-background-lightest flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors">
          {FOLDER_ICON}
          {current?.name ?? "Select a project"}
        </div>
      }
    >
      <MenuItem className="hover:bg-transparent">
        <div className="flex h-full max-h-100 w-full flex-col gap-1 overflow-y-auto">
          {projects.map((project) => (
            <span
              key={project.id}
              className="hover:bg-background-lighter w-full cursor-pointer p-3 text-left"
              onClick={() => onChange(project.id)}
            >
              {project.name}
            </span>
          ))}
        </div>
      </MenuItem>
    </Menu>
  );
}
