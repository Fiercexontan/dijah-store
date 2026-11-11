import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only the admin area needs login sessions. The public storefront
  // uses guest checkout, so it never touches this.
  matcher: ["/admin/:path*"],
};