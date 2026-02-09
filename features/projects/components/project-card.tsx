
import { formatDistanceToNow } from "date-fns"; // You might need to install date-fns or use native Intl
import { Project } from "../types/project";

export function ProjectCard({ project }: { project: Project }) {
  // Fallback for date formatting if date-fns is not installed, or use simple JS
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-background-light rounded-xl  p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <svg
          className="w-6 h-6 text-secondary-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
    
      </div>
      <h3 className="font-bold text-2xl text-primary-foreground mb-1">
        {project.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Created {formatDate(project.createdAt)}
      </p>
    </div>
  );
}
