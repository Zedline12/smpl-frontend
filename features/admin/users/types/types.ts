import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { SubscriptionPlanAdmin } from "../../subscriptions/types/types";

export interface UserAdmin {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  creditsBalance?: number;
  subscriptionPlan: Pick<
    SubscriptionPlanAdmin,
    "id" | "name" | "billingPeriod"
  >;
  subscription: {
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };
}
