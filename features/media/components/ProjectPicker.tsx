"use client";

import { Project } from "@/features/projects/types/project";
import { useState } from "react";



interface ProjectPickerProps {
  project: Project | null;
  onSelect: (project: Project) => void;
  projects: Project[]; // pass in the list of projects
}

export function ProjectPicker({ project, onSelect, projects }: ProjectPickerProps) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex flex font-bold text-xl text-foreground  items-center   rounded"
        onClick={toggleDropdown}
      >
        {project?.name || "Select Project"}
        <span className="ml-2">▾</span>
      </button>

      {open && (
        <ul className="absolute bg-black/50 backdrop-blur-lg mt-2 w-48  rounded shadow-lg z-50">
          {projects.map((p) => (
            <li
              key={p.id}
              className="px-4 py-2 font-bold hover:bg-secondary cursor-pointer"
              onClick={() => {
                onSelect(p);
                setOpen(false);
              }}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
