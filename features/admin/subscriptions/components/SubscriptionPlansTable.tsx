"use client";

import { useState } from "react";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditSubscriptionPlanForm } from "../forms/EditSubscriptionPlanForm";

export function SubscriptionPlansTable({ plans }: { plans: SubscriptionPlan[] }) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleEditClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  return (
    <div className="w-full">
      <div className="rounded-md border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm text-left text-neutral-300">
          <thead className="text-xs uppercase bg-neutral-900 text-neutral-400">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Credits/Mo</th>
              <th scope="col" className="px-6 py-3">Billing</th>
              <th scope="col" className="px-6 py-3">Popular</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-neutral-800 bg-neutral-950 hover:bg-neutral-900">
                <td className="px-6 py-4 font-medium text-white">{plan.name}</td>
                <td className="px-6 py-4">${plan.priceAmount}</td>
                <td className="px-6 py-4">{plan.creditsPerMonth}</td>
                <td className="px-6 py-4">{plan.billingPeriod}</td>
                <td className="px-6 py-4">
                  {plan.isMostPopular ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">Yes</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-neutral-800 text-neutral-400">No</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex justify-end">
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <EditSubscriptionPlanForm 
              plan={selectedPlan} 
              onSuccess={() => setIsDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
