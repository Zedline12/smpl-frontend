import React from "react";
import { Project } from "@/lib/types/project.type";
import { formatDistanceToNow } from "date-fns"; // You might need to install date-fns or use native Intl

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
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <svg
            className="w-6 h-6"
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
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      <h3 className="font-semibold text-lg text-gray-900 mb-1">
        {project.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Updated {formatDate(project.updatedAt)}
      </p>
    </div>
  );
}
