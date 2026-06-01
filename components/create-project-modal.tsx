"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { projectsService } from "@/lib/api/services/projects.service";
import { toast } from "sonner";
import { ProjectColorPicker } from "@/components/ui/hex-color-picker";
import { Button } from "@/components/ui/button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await projectsService.createProject(name, hexCode);
      toast.success("Project created successfully");
      router.push(`/projects`);
      onClose();
    } catch {
      // Error handled globally via apiFetch toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Create New Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="projectName"
              className="text-sm font-medium text-muted-foreground"
            >
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Campaign 2024"
              autoFocus
            />
          </div>

          <ProjectColorPicker value={hexCode} onChange={setHexCode} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
