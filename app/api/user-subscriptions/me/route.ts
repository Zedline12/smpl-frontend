import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../proxy";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return proxyUserSubscriptions(req, "me", "GET");
}
