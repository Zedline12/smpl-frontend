import { NextRequest } from "next/server";
import { proxyUserSubscriptions } from "../../proxy";

/** Prices a plan change (the current coupon is removed). Body: { planId, promotionCode? }. */
export function POST(req: NextRequest) {
  return proxyUserSubscriptions(req, "change-plan/preview", "POST");
}
