"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface EditSubscriptionPlanFormProps {
  plan: SubscriptionPlan;
  onSuccess: () => void;
}

export function EditSubscriptionPlanForm({ plan, onSuccess }: EditSubscriptionPlanFormProps) {
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: plan.name,
    priceAmount: plan.priceAmount,
    creditsPerMonth: plan.creditsPerMonth,
    stripePriceId: plan.stripePriceId,
    metadata: plan.metadata || [],
    isMostPopular: plan.isMostPopular || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/subscription-plans/${plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update plan");
      }

      toast({
        title: "Success",
        description: "Subscription plan updated successfully",
      });
      
      onSuccess();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not update subscription plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="priceAmount" className="text-sm font-medium">Price ($)</label>
          <input
            id="priceAmount"
            type="number"
            value={formData.priceAmount || 0}
            onChange={(e) => setFormData({ ...formData, priceAmount: parseFloat(e.target.value) })}
            className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="creditsPerMonth" className="text-sm font-medium">Credits/Mo</label>
          <input
            id="creditsPerMonth"
            type="number"
            value={formData.creditsPerMonth || 0}
            onChange={(e) => setFormData({ ...formData, creditsPerMonth: parseInt(e.target.value) })}
            className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="stripePriceId" className="text-sm font-medium">Stripe Price ID</label>
        <input
          id="stripePriceId"
          value={formData.stripePriceId || ""}
          onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
          className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Metadata Features</label>
        {((formData.metadata && formData.metadata.length > 0) ? formData.metadata : [""]).map((meta, index, arr) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              value={meta}
              onChange={(e) => {
                const newMeta = [...arr];
                newMeta[index] = e.target.value;
                setFormData({ ...formData, metadata: newMeta });
              }}
              placeholder="e.g. Include 1000 credits"
              className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {index === arr.length - 1 && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, metadata: [...arr, ""] })}
                className="flex shrink-0 items-center justify-center h-10 w-10 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                title="Add feature"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            {arr.length > 1 && (
              <button
                type="button"
                onClick={() => {
                   const newMeta = arr.filter((_, i) => i !== index);
                   setFormData({ ...formData, metadata: newMeta });
                }}
                className="flex shrink-0 items-center justify-center h-10 w-10 rounded-md bg-red-900/40 hover:bg-red-900/60 text-red-400 transition-colors"
                title="Remove feature"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 p-3 border border-neutral-800 rounded-md bg-neutral-900/50">
        <label htmlFor="isMostPopular" className="text-sm font-medium cursor-pointer">
          Most Popular Badge
        </label>
        <button
          id="isMostPopular"
          type="button"
          role="switch"
          aria-checked={formData.isMostPopular}
          onClick={() => setFormData({ ...formData, isMostPopular: !formData.isMostPopular })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${formData.isMostPopular ? "bg-primary" : "bg-neutral-700"}`}
        >
          <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${formData.isMostPopular ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
