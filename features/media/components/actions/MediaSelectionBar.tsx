"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FolderInput, FolderPlus, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateProjectMutation,
  useProjectsQuery,
} from "@/features/projects/hooks/projects";
import { Media } from "../../types/media";
import { useMediaSelectionStore } from "../../stores/useMediaSelectionStore";
import { useDownloadMedia, useMoveMediaMutation } from "../../hooks/useMediaActions";
import { DeleteMediaDialog } from "./DeleteMediaDialog";
import { MENU_CONTENT_CLASS } from "./MediaCardActions";

interface MediaSelectionBarProps {
  /** The media currently loaded in the grid, to resolve selected ids. */
  media: Media[];
}

export function MediaSelectionBar({ media }: MediaSelectionBarProps) {
  const { active, ids, selectMany, clear } = useMediaSelectionStore();
  const { data: projects = [] } = useProjectsQuery();
  const moveMedia = useMoveMediaMutation();
  const createProject = useCreateProjectMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const selected = media.filter((m) => ids.has(m.id));
  const selectedIds = selected.map((m) => m.id);
  const count = selectedIds.length;
  const allSelected = count > 0 && count === media.length;

  const download = useDownloadMedia();
  const handleDownload = () => download(selected);

  const moveTo = (projectId: string) =>
    moveMedia.mutate({ ids: selectedIds, projectId }, { onSuccess: clear });

  const createAndMove = () => {
    const name = newProjectName.trim();
    if (!name) return;
    createProject.mutate(name, {
      onSuccess: (project) => {
        setNewProjectOpen(false);
        setNewProjectName("");
        moveTo(project.id);
      },
    });
  };

  const barButton =
    "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            key="media-selection-bar"
            initial={{ y: 120, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 120, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            // framer-motion owns `transform`, so centre with its x instead of a Tailwind translate.
            className="fixed bottom-6 left-1/2 z-[70]"
            style={{ x: "-50%" }}
          >
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-neutral-900/90 p-1.5 pl-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {/* Count */}
              <div className="flex items-center gap-2 pr-2">
                <motion.span
                  key={count}
                  initial={{ scale: 1.4, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex size-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-black"
                >
                  {count}
                </motion.span>
                <span className="hidden text-sm text-white/80 sm:inline">selected</span>
                <button
                  type="button"
                  onClick={() =>
                    allSelected ? selectMany([]) : selectMany(media.map((m) => m.id))
                  }
                  className="ml-1 hidden text-xs text-white/50 underline-offset-2 hover:text-white hover:underline sm:inline"
                >
                  {allSelected ? "Select none" : "Select all"}
                </button>
              </div>

              <span className="mx-1 h-6 w-px bg-white/10" />

              <button
                type="button"
                onClick={handleDownload}
                disabled={!count}
                className={`${barButton} text-white hover:bg-white/10`}
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={!count || moveMedia.isPending}
                    className={`${barButton} text-white hover:bg-white/10`}
                  >
                    <FolderInput className="size-4" />
                    <span className="hidden sm:inline">Move to</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className={`${MENU_CONTENT_CLASS} max-h-72`}
                >
                  <DropdownMenuLabel className="text-xs text-white/50">
                    Move {count} {count === 1 ? "item" : "items"} to
                  </DropdownMenuLabel>
                  {projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onSelect={() => moveTo(project.id)}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: (project as { hexCode?: string }).hexCode || "#71717a" }}
                      />
                      <span className="truncate">{project.name}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onSelect={() => setNewProjectOpen(true)}>
                    <FolderPlus /> New project…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={!count}
                className={`${barButton} text-red-400 hover:bg-red-500/15`}
              >
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <button
                type="button"
                onClick={clear}
                title="Exit selection"
                className="ml-1 flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteMediaDialog
        ids={selectedIds}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={clear}
      />

      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent className="border-white/10 bg-neutral-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createAndMove()}
            placeholder="Project name"
            maxLength={80}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-white/30"
          />
          <DialogFooter>
            <button
              type="button"
              onClick={createAndMove}
              disabled={!newProjectName.trim() || createProject.isPending}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--gradient-create)" }}
            >
              {createProject.isPending ? "Creating…" : `Create & move ${count}`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
