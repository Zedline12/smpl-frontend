import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../proxy";

/** Undoes a scheduled cancellation. */
export function POST(req: NextRequest) {
  return proxyUserSubscriptions(req, "resume", "POST");
}
