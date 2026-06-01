"use client";
import { MenuItem, Menu } from "@/components/menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import { UpdateProjectNameForm } from "@/features/projects/forms/updateProjectForm";
import { useProjectQuery } from "@/features/projects/hooks/projects";
import { downloadUrlsZip } from "@/lib/handle-downloads";
import { Download, Edit, Image, Music, Trash, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function LineSeparator({ hexCode }: { hexCode?: string }) {
  return (
    <svg viewBox="0 0 1200 4" preserveAspectRatio="none" className="w-full h-[3px]" fill="none">
      {!hexCode && (
        <defs>
          <linearGradient id="project-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9370ff" />
            <stop offset="100%" stopColor="#ef75ff" />
          </linearGradient>
        </defs>
      )}
      <line
        x1="0" y1="2" x2="1200" y2="2"
        stroke={hexCode ?? "url(#project-line-grad)"}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProjectPageSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-4 animate-pulse">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-3">
            <div className="h-9 w-56 rounded-lg bg-muted" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-muted" />
        </div>
        <div className="h-2 w-full rounded-full bg-muted" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { data: project, isLoading } = useProjectQuery(id);

  if (isLoading) return <ProjectPageSkeleton />;
  if (!project) return <div className="p-8 text-muted-foreground">Project not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
              {project.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
                <Image size={14} />
                {project.stats.totalImages}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
                <Video size={14} />
                {project.stats.totalVideos}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground">
                <Music size={14} />
                {project.stats.totalAudio}
              </span>
            </div>
          </div>

          <Menu>
            <MenuItem
              icon={<Download size={16} />}
              onClick={() =>
                downloadUrlsZip(
                  project.media.map((media) => media.url),
                  project.name,
                )
              }
            >
              Download All
            </MenuItem>
            <MenuItem
              icon={<Edit size={16} />}
              onClick={() => setIsUpdateModalOpen(true)}
            >
              Edit
            </MenuItem>
            <MenuItem
              icon={<Trash size={16} />}
              variant="danger"
              onClick={() => console.log("Delete")}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>

        <LineSeparator hexCode={project.hexCode} />
      </div>

      <Dialog
        open={isUpdateModalOpen}
        onOpenChange={(val) => !val && setIsUpdateModalOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Project</DialogTitle>
          </DialogHeader>
          <UpdateProjectNameForm
            projectId={project.id}
            initialName={project.name}
            initialHexCode={project.hexCode}
            onSuccess={() => {
              toast.success("Project updated successfully");
              setIsUpdateModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <MediaExplorer defaultProjectId={id} />
    </div>
  );
}
