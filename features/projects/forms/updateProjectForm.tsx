"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUpdateProjectMutation } from "../hooks/projects";
import { ProjectColorPicker } from "@/components/ui/hex-color-picker";

export function UpdateProjectNameForm({
  projectId,
  initialName,
  initialHexCode,
  onSuccess,
}: {
  projectId: string;
  initialName: string;
  initialHexCode?: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [hexCode, setHexCode] = useState<string | undefined>(initialHexCode);
  const mutation = useUpdateProjectMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(
          { id: projectId, body: { name, hexCode } },
          { onSuccess: () => onSuccess?.() },
        );
      }}
      className="space-y-4 py-2"
    >
      <div className="space-y-2">
        <Label htmlFor="projectName" className="text-secondary-foreground font-medium">
          Project Name
        </Label>
        <Input
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={mutation.isPending}
          className="bg-background-light border-neutral-800 focus-visible:ring-primary/50 h-10 transition-all duration-200"
          placeholder="Enter project name..."
        />
      </div>

      <ProjectColorPicker value={hexCode} onChange={setHexCode} />

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={mutation.isPending || !name.trim()}
          variant="primary"
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
