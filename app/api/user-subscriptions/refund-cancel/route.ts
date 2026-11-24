import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../proxy";

/** Refunds the latest payment and ends the plan now. Body: { feedback?, comment? }. */
export function POST(req: NextRequest) {
  return proxyUserSubscriptions(req, "refund-cancel", "POST");
}
