"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDeletePromptMutation,
  usePromptsQuery,
} from "../hooks/use-prompt-maker";
import { PromptMaker } from "../types/prompt-maker";
import { modelName } from "../utils/models";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

interface PromptHistoryListProps {
  selectedId?: string;
  onSelect: (prompt: PromptMaker) => void;
}

export function PromptHistoryList({
  selectedId,
  onSelect,
}: PromptHistoryListProps) {
  const { data: prompts, isLoading, isError, error, refetch } =
    usePromptsQuery();
  const deletePrompt = useDeletePromptMutation();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border shrink-0 border-b px-4 py-3">
        <h2 className="text-foreground text-sm font-semibold">Your prompts</h2>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <ul className="divide-border divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className="animate-pulse px-4 py-3.5">
                <div className="bg-background-lighter h-3.5 w-3/4 rounded" />
                <div className="bg-background-light mt-2 h-2.5 w-1/3 rounded" />
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="text-muted-foreground text-sm">
              {error instanceof Error
                ? error.message
                : "Could not load your prompts."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost btn-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && prompts?.length === 0 && (
          <p className="text-muted-foreground px-6 py-10 text-center text-sm">
            Prompts you create will show up here.
          </p>
        )}

        {!isLoading && !isError && !!prompts?.length && (
          <ul className="divide-border divide-y">
            {prompts.map((prompt) => {
              const isConfirming = confirmingId === prompt.id;
              const isDeleting =
                deletePrompt.isPending && deletePrompt.variables === prompt.id;
              const timestamp = relativeTime(prompt.createdAt);

              return (
                <li key={prompt.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(prompt)}
                    className={cn(
                      "hover:bg-background-light flex w-full cursor-pointer flex-col items-start gap-1 px-4 py-3.5 text-left transition-colors",
                      selectedId === prompt.id && "bg-background-light",
                    )}
                  >
                    <span className="text-foreground line-clamp-2 pr-9 text-sm">
                      {prompt.description}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {modelName(prompt.model)}
                      {timestamp ? ` · ${timestamp}` : ""}
                    </span>
                  </button>

                  {isConfirming ? (
                    <div className="bg-background-light absolute inset-0 flex items-center justify-end gap-2 px-4">
                      <span className="text-muted-foreground mr-auto text-xs">
                        Delete this prompt?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          deletePrompt.mutate(prompt.id, {
                            onSuccess: () => setConfirmingId(null),
                          })
                        }
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting && <Loader2 className="size-3 animate-spin" />}
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label="Delete prompt"
                      onClick={() => setConfirmingId(prompt.id)}
                      className="text-muted-foreground hover:bg-background-lighter absolute top-3 right-3 cursor-pointer rounded-lg p-1.5 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500 focus-visible:opacity-100 max-sm:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
