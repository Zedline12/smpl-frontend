"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CreditPricingRule {
  id: string;
  model: string;
  parameters: Record<string, any>;
  credits: number;
}

interface ModelPricingTableProps {
  modelId: string;
  modelSchema: Record<string, any[]>;
  existingRules?: CreditPricingRule[];
}

export function ModelPricingTable({
  modelId,
  modelSchema,
  existingRules = [],
}: ModelPricingTableProps) {
  const parameters = Object.keys(modelSchema);
  const router = useRouter();

  // "Add" State
  const initialFormState = parameters.reduce(
    (acc, param) => {
      acc[param] =
        modelSchema[param]?.[0] !== undefined
          ? String(modelSchema[param][0])
          : "";
      return acc;
    },
    {} as Record<string, string>,
  );
  const [formData, setFormData] = useState<Record<string, string>>(initialFormState);
  const [addCredits, setAddCredits] = useState<number | "">("");
  const [isAdding, setIsAdding] = useState(false);

  // "Edit" State
  const [selectedRule, setSelectedRule] = useState<CreditPricingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCredits, setEditCredits] = useState<number | "">("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectChange = (param: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleAddRule = async () => {
    if (addCredits === "" || Number(addCredits) <= 0) {
      toast.error("Please enter a valid credit amount.");
      return;
    }

    setIsAdding(true);
    try {
      const typedParameters: Record<string, string | number | boolean> = { ...formData };
      parameters.forEach((param) => {
        const schemaValue = modelSchema[param][0];
        if (typeof schemaValue === "number") {
          typedParameters[param] = Number(typedParameters[param]);
        } else if (typeof schemaValue === "boolean" || schemaValue === "true" || schemaValue === "false") {
          typedParameters[param] = String(typedParameters[param]) === "true";
        }
      });

      const payload = {
        model: modelId,
        parameters: typedParameters,
        credits: Number(addCredits),
      };

      const res = await fetch("/api/credit-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message || "Failed to post new rule");
      } else {
        toast.success("Pricing Created Successfully");
        setAddCredits("");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (rule: CreditPricingRule) => {
    setSelectedRule(rule);
    setEditCredits(rule.credits);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRule) return;
    if (editCredits === "" || Number(editCredits) <= 0) {
      toast.error("Please enter a valid credit amount.");
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/credit-pricing/${selectedRule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: Number(editCredits) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule");
      }

      toast.success("Pricing rule updated successfully");
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Could not update rule");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-md border border-neutral-800 overflow-hidden bg-neutral-950">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left text-neutral-300">
          <thead className="text-xs uppercase bg-neutral-900 border-b border-neutral-800 text-neutral-400">
            {/* Headers mapping exactly from schema parameters */}
            <tr>
              {parameters.map((param) => (
                <th key={param} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                  {param}
                </th>
              ))}
              <th scope="col" className="px-6 py-4 font-semibold tracking-wider">
                Credits
              </th>
              <th scope="col" className="px-6 py-4 text-right font-semibold tracking-wider">
                Action
              </th>
            </tr>

            {/* "Add Rule" Interface in Header */}
            <tr className="border-b-4 border-neutral-800 bg-neutral-900/60">
              {parameters.map((param) => {
                const schemaValue = modelSchema[param]?.[0];
                const isBooleanParam = typeof schemaValue === "boolean" || schemaValue === "true" || schemaValue === "false";
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
              <td className="px-4 py-3 min-w-[100px] align-middle">
                <input
                  type="number"
                  value={addCredits}
                  onChange={(e) =>
                    setAddCredits(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="0"
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
            {/* Existing Active Rules */}
            {existingRules.length > 0 ? (
              existingRules.map((rule) => (
                <tr key={rule.id} className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors">
                  {parameters.map((param) => {
                    // Match param keys so they appear under their respective columns
                    const ruleVal = rule.parameters?.[param];
                    return (
                      <td key={param} className="px-6 py-4">
                        {ruleVal !== undefined ? String(ruleVal) : "—"}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4">{rule.credits}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={parameters.length + 2} className="px-6 py-8 text-center text-neutral-500">
                  No active rules configured for this model. Use the form above to deploy one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Model Rule</DialogTitle>
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
                <label htmlFor="editCredits" className="text-sm font-medium">Credits</label>
                <input
                  id="editCredits"
                  type="number"
                  value={editCredits}
                  onChange={(e) => setEditCredits(e.target.value ? Number(e.target.value) : "")}
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
