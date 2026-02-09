"use client";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { Project } from "@/lib/types/project.type";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useMediaQuery } from "../queries/media";
import { MediaType } from "../types/media";
import { Sparkles, Clock } from "lucide-react";
import { MediaGrid } from "./MediaGrid";
import { MediaGridSkeleton } from "./skeletons/MediaGridSkeleton";
import { useProjectsQuery } from "@/features/projects/hooks/projects";
interface MediaExplorerProps {
  defaultProjectId?: string;
  defaultMediaType?: MediaType;
}
export default function MediaExplorer({
  defaultProjectId,
  defaultMediaType,
}: MediaExplorerProps) {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjectsQuery();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(
    defaultMediaType ?? "image",
  );
  const {
    data: media = [],
    isFetching: isMediaFetching,
    isFetched: isMediaFetched,
  } = useMediaQuery(selectedProject?.id, mediaType);
  const { data: queues } = useGenerationQueuesQuery();
  useEffect(() => {
    const currentQueues =
      queues?.filter((queue) =>
        ["pending", "processing"].includes(queue.status),
      ) ?? [];
    if (currentQueues.length == 0) {
      queryClient.refetchQueries({ queryKey: ["media"] });
    }
    if (defaultProjectId) {
      setSelectedProject(
        projects.find((p) => p.id === defaultProjectId) ?? null,
      );
    }
  }, [queues]);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2">
          <button
            onClick={() => setMediaType("image")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaType === "image"
                ? "bg-neutral-800 text-white"
                : "bg-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Image
          </button>
          <button
            onClick={() => setMediaType("video")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaType === "video"
                ? "bg-neutral-800 text-white"
                : "bg-transparent text-neutral-400 hover:text-white"
            }`}
          >
            Video
          </button>
        </div>
        {!defaultProjectId && (
          <div>
            <select
              value={(defaultProjectId ?? selectedProject?.id) || ""}
              onChange={(e) => {
                const projectId = e.target.value;
                if (projectId === "") {
                  setSelectedProject(null);
                } else {
                  const project = projects.find((p) => p.id === projectId);
                  setSelectedProject(project || null);
                }
              }}
              className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg focus:ring-neutral-500 focus:border-neutral-500 block w-full p-2.5"
            >
              <option value="">ALL</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {queues && queues.length > 0 && (
        <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-6 mb-4">
          {queues.map((queue) => (
            <div
              key={queue.id}
              className={`relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ${
                queue.status === "processing"
                  ? "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 animate-pulse text-white shadow-lg shadow-purple-500/20"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400"
              }`}
            >
              {queue.status === "processing" ? (
                <>
                  <Sparkles className="w-8 h-8 mb-3 animate-spin-slow" />
                  <span className="text-sm font-bold tracking-wide uppercase">
                    Generating...
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-8 h-8 mb-3 opacity-50" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Generation is in queue
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!isMediaFetched || isMediaFetching ? (
        <MediaGridSkeleton key={selectedProject?.id} />
      ) : (
        <MediaGrid
          aspectRatio="16:9"
          imagesWidth={200}
          layout="grid"
          media={media}
          key={selectedProject?.id}
        />
      )}
    </div>
  );
}
