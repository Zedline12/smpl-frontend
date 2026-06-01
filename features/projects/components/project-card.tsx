
import { formatDistanceToNow } from "date-fns";
import { ProjectWithStats } from "../types/project";

export function ProjectCard({ project }: { project: ProjectWithStats }) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Unique gradient IDs scoped to this project to avoid SVG ID collisions
  const gid = `smpl-${project.id.replace(/[^a-zA-Z0-9]/g, "")}`;

  const tabStyle = project.hexCode
    ? { background: `linear-gradient(135deg, ${project.hexCode}, ${project.hexCode}88)` }
    : undefined;

  return (
    <div className="cursor-pointer group">
      {/* Folder tab — brand gradient or project hex color */}
      <div
        className={`relative z-10 w-[42%] h-6 rounded-t-lg border border-b-0 border-border opacity-80 group-hover:opacity-100 transition-opacity duration-200${!project.hexCode ? " bg-gradient-primary" : ""}`}
        style={tabStyle}
      />
      {/* Folder body */}
      <div className="relative -mt-px rounded-xl rounded-tl-none p-5 border border-border bg-card group-hover:border-white/20 group-hover:bg-background-light transition-all duration-200">
        <h3 className="font-bold text-xl text-foreground mb-4">
          <span className="relative inline-block">
            {project.name}
            <div
              className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300${!project.hexCode ? " bg-gradient-primary" : ""}`}
              style={project.hexCode ? { background: project.hexCode } : undefined}
            />
          </span>
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Created {formatDate(project.createdAt)}
          </p>
          <div className="flex items-center gap-3">
            {/* Video */}
            <div className="flex items-center gap-1" title="Videos">
              <svg className="w-4 h-4" fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`${gid}-v`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9370ff" />
                    <stop offset="100%" stopColor="#ef75ff" />
                  </linearGradient>
                </defs>
                <path stroke={`url(#${gid}-v)`} strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-xs text-white/80">{project.stats.totalVideos}</span>
            </div>
            {/* Image */}
            <div className="flex items-center gap-1" title="Images">
              <svg className="w-4 h-4" fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`${gid}-i`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9370ff" />
                    <stop offset="100%" stopColor="#ef75ff" />
                  </linearGradient>
                </defs>
                <path stroke={`url(#${gid}-i)`} strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-xs text-white/80">{project.stats.totalImages}</span>
            </div>
            {/* Audio */}
            <div className="flex items-center gap-1" title="Audio">
              <svg className="w-4 h-4" fill="none" strokeWidth={1.5} viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`${gid}-a`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9370ff" />
                    <stop offset="100%" stopColor="#ef75ff" />
                  </linearGradient>
                </defs>
                <path stroke={`url(#${gid}-a)`} strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
              <span className="text-xs text-white/80">{project.stats.totalAudio}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
