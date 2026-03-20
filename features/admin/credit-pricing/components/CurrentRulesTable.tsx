"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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

export function CurrentRulesTable({ rules }: { rules: CreditPricingRule[] }) {
  const [selectedRule, setSelectedRule] = useState<CreditPricingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [credits, setCredits] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleEditClick = (rule: CreditPricingRule) => {
    setSelectedRule(rule);
    setCredits(rule.credits);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRule) return;
    if (credits === "" || Number(credits) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid credit amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/credit-pricing/${selectedRule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credits: Number(credits) }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule");
      }

      toast({
        title: "Success",
        description: "Pricing rule updated successfully",
      });
      
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not update rule",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!rules || rules.length === 0) {
    return <div className="text-neutral-400 mb-8">No existing pricing rules found.</div>;
  }

  const rulesByModel = rules.reduce((acc, rule) => {
    if (!acc[rule.model]) acc[rule.model] = [];
    acc[rule.model].push(rule);
    return acc;
  }, {} as Record<string, CreditPricingRule[]>);

  return (
    <div className="w-full mb-12">
      <h2 className="text-xl  text-secondary-foreground mb-6">Current Pricing Rules</h2>
      <div className="space-y-8">
        {Object.entries(rulesByModel).map(([model, modelRules]) => (
          <div key={model} className="space-y-3">
            <h3 className="text-lg font-medium text-white capitalize">{model.replace("-", " ")}</h3>
            <div className="rounded-md border border-neutral-800 overflow-hidden bg-neutral-950">
              <table className="w-full text-sm text-left text-neutral-300">
                <thead className="text-xs uppercase bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Parameters</th>
                    <th scope="col" className="px-6 py-4 font-semibold w-[150px]">Credits</th>
                    <th scope="col" className="px-6 py-4 text-right font-semibold w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modelRules.map((rule) => {
                    const paramsString = Object.entries(rule.parameters || {})
                      .map(([key, val]) => `${key}: ${val}`)
                      .join(", ");
                      
                    return (
                      <tr key={rule.id || Math.random()} className="border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors">
                        <td className="px-6 py-4">{paramsString || "None"}</td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Pricing Rule</DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-neutral-400">Model</label>
                <div className="text-sm text-white bg-neutral-900 px-3 py-2 rounded-md border border-neutral-800">
                  {selectedRule.model}
                </div>
              </div>
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
                  value={credits}
                  onChange={(e) => setCredits(e.target.value ? Number(e.target.value) : "")}
                  className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isSaving}
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
