"use client";
import { CreateProjectModal } from "@/components/create-project-modal";
import { Button } from "@/components/ui/button";

import { useState } from "react";

export default function ProjectsPageHeader() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <>
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="bg-gradient-to-br from-white via-white to-neutral-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Projects
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your creative work
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          Create Project
        </Button>
      </div>
    </>
  );
}
