import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../proxy";

/**
 * Upgrades or downgrades the current subscription.
 * Body: { planId, promotionCode?, appliedVia?, prorationDate? }.
 */
export function POST(req: NextRequest) {
  return proxyUserSubscriptions(req, "change-plan", "POST");
}
