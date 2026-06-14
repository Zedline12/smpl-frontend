"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Loader2, ChevronDown, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
} from "@/features/generation/enums/models.enum";

const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS];

export interface ModelCostRule {
  id: string;
  model: string;
  parameters: Record<string, any>;
  price: number;
}

interface ModelCostTableProps {
  modelId: string;
  modelSchema: Record<string, any[]>;
  existingRules?: ModelCostRule[];
}

export function ModelCostTable({
  modelId,
  modelSchema,
  existingRules = [],
}: ModelCostTableProps) {
  const parameters = Object.keys(modelSchema);
  const router = useRouter();
  const modelIcon = ALL_MODELS.find((m) => m.id === modelId)?.svg ?? null;

  // "Add" State
  const initialFormState = parameters.reduce(
    (acc, param) => {
      acc[param] =
        modelSchema[param]?.[0] !== undefined ? String(modelSchema[param][0]) : "";
      return acc;
    },
    {} as Record<string, string>,
  );
  const [formData, setFormData] = useState<Record<string, string>>(initialFormState);
  const [addPrice, setAddPrice] = useState<number | "">("");
  const [isAdding, setIsAdding] = useState(false);

  // "Expand" State
  const [isExpanded, setIsExpanded] = useState(false);

  // "Edit" State
  const [selectedRule, setSelectedRule] = useState<ModelCostRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [isEditing, setIsEditing] = useState(false);

  // "Delete" State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSelectChange = (param: string, value: string) => {
    setFormData((prev) => ({ ...prev, [param]: value }));
  };

  const handleAddRule = async () => {
    if (addPrice === "" || Number(addPrice) < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setIsAdding(true);
    try {
      const typedParameters: Record<string, string | number | boolean> = { ...formData };
      parameters.forEach((param) => {
        const schemaValue = modelSchema[param][0];
        if (typeof schemaValue === "number") {
          typedParameters[param] = Number(typedParameters[param]);
        } else if (
          typeof schemaValue === "boolean" ||
          schemaValue === "true" ||
          schemaValue === "false"
        ) {
          typedParameters[param] = String(typedParameters[param]) === "true";
        }
      });

      const payload = { model: modelId, parameters: typedParameters, price: Number(addPrice) };

      const res = await fetch("/api/model-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to add rule");
      } else {
        toast.success("Rule created successfully");
        setAddPrice("");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (rule: ModelCostRule) => {
    setSelectedRule(rule);
    setEditPrice(rule.price);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRule) return;
    if (editPrice === "" || Number(editPrice) < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/model-costs/${selectedRule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(editPrice) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule");
      }

      toast.success("Rule updated successfully");
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not update rule");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    setDeletingId(ruleId);
    try {
      const response = await fetch(`/api/model-costs/${ruleId}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete rule");
      }

      toast.success("Rule deleted");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete rule");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border border-neutral-800 overflow-hidden bg-neutral-950">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-neutral-900 hover:bg-neutral-800/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {modelIcon && (
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-xl shrink-0"
              style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)" }}
            >
              {modelIcon}
            </div>
          )}
          <span className="text-sm font-semibold text-white tracking-wide">{modelId}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
            {existingRules.length} {existingRules.length === 1 ? "rule" : "rules"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-neutral-300">
            <thead className="text-xs uppercase bg-neutral-900 border-b border-neutral-800 text-neutral-400">
              <tr>
                {parameters.map((param) => (
                  <th key={param} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                    {param}
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-4 text-right font-semibold tracking-wider">
                  Action
                </th>
              </tr>

              {/* "Add Rule" Interface */}
              <tr className="border-b-4 border-neutral-800 bg-neutral-900/60">
                {parameters.map((param) => {
                  const schemaValue = modelSchema[param]?.[0];
                  const isBooleanParam =
                    typeof schemaValue === "boolean" ||
                    schemaValue === "true" ||
                    schemaValue === "false";
                  const currentValue = String(formData[param]) === "true";

                  return (
                    <td key={param} className="px-4 py-3 align-middle">
                      {isBooleanParam ? (
                        <div className="flex h-10 items-center justify-start ml-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={currentValue}
                            onClick={() => handleSelectChange(param, String(!currentValue))}
                            disabled={isAdding}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed ${
                              currentValue ? "bg-primary" : "bg-neutral-600"
                            }`}
                          >
                            <span
                              className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                currentValue ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ) : (
                        <select
                          value={formData[param]}
                          onChange={(e) => handleSelectChange(param, e.target.value)}
                          className="flex min-w-[120px] h-10 w-full items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isAdding}
                        >
                          {modelSchema[param]?.map((optionValue) => (
                            <option key={String(optionValue)} value={String(optionValue)}>
                              {String(optionValue)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 min-w-[120px] align-middle">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addPrice}
                    onChange={(e) =>
                      setAddPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isAdding}
                  />
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <button
                    onClick={handleAddRule}
                    disabled={isAdding}
                    className="inline-flex h-10 w-full sm:w-auto items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Rule"}
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {existingRules.length > 0 ? (
                existingRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors"
                  >
                    {parameters.map((param) => {
                      const ruleVal = rule.parameters?.[param];
                      return (
                        <td key={param} className="px-6 py-4">
                          {ruleVal !== undefined ? String(ruleVal) : "—"}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4">${rule.price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          disabled={deletingId === rule.id}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
                        >
                          {deletingId === rule.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={parameters.length + 2}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No cost rules configured for this model. Use the form above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Model Cost Rule</DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-neutral-400">Parameters</label>
                <div className="text-sm text-white bg-neutral-900 px-3 py-2 rounded-md border border-neutral-800 whitespace-pre-wrap">
                  {Object.entries(selectedRule.parameters || {})
                    .map(([key, val]) => `${key}: ${val}`)
                    .join("\n") || "None"}
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="editPrice" className="text-sm font-medium">
                  Price ($)
                </label>
                <input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) =>
                    setEditPrice(e.target.value ? Number(e.target.value) : "")
                  }
                  className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isEditing}
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditing}
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isEditing ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
