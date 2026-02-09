import { MenuItem, Menu } from "@/components/menu";
import { useProjectsQuery } from "@/features/projects/hooks/projects";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
import { useVideoGenerationStore } from "@/stores/useVideoGenerationStore";
import { useEffect } from "react";

export default function ProjectSelector() {
  const { projectId, setProjectId } = useImageGenerationStore();
  const {setProjectId: setVideoProjectId} = useVideoGenerationStore();
  const { data: projects = [] } = useProjectsQuery();
  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
      setVideoProjectId(projects[0].id)
    }
  }, [projects, projectId, setProjectId]);
  return (
    <Menu
      trigger={
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
          </svg>

          {projects.find((project) => project.id === projectId)?.name}
        </div>
      }
      direction="up"
    >
      <MenuItem className="hover:bg-transparent">
        <div className="gap-1 h-full max-h-100 w-full overflow-y-auto flex flex-col">
          {projects.map((project) => (
            <span
              className="w-full text-left hover:bg-background-lighter p-3"
              key={project.id}
              onClick={() => { setProjectId(project.id),setVideoProjectId(project.id) }}
            >
              {project.name}
            </span>
          ))}
        </div>
      </MenuItem>
    </Menu>
  );
}
