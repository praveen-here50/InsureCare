// Sends signed-out visitors of the portals to the sign-in page, and back again afterwards.
// This only looks for the session cookie; whether the session is valid, and for which portal, is decided by the
// backend and the portal layouts (requireSession).
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.cookies.has("INSURECARE_SESSION")) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/patient/:path*", "/hospital/:path*", "/insurer/:path*"],
};
