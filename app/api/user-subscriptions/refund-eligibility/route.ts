import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../proxy";

/** Whether "cancel and get a full refund" is available (latest payment ≤ 14 days, no credits used). */
export function GET(req: NextRequest) {
  return proxyUserSubscriptions(req, "refund-eligibility", "GET");
}
