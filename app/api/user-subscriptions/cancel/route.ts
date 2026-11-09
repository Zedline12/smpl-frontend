import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../proxy";

/** Cancels at the end of the paid period. Body: { feedback?, comment? }. */
export function POST(req: NextRequest) {
  return proxyUserSubscriptions(req, "cancel", "POST");
}
