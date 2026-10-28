// Who is signed in, for server components. The backend owns the session; this asks it (GET /api/auth/me).
import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "./api";
import { serverApi } from "./server-api";
import { homeOf, type PortalKey, type Session } from "./session-types";

export { homeOf, type PortalKey, type Session };

/** The signed-in person, or null. Asked once per request however many components need it. */
export const getSession = cache(async (): Promise<Session | null> => {
  try {
    return await serverApi<Session>("/api/auth/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
});

/** The signed-in person for a portal: signed-out visitors go to the sign-in page, other accounts to their own portal. */
export async function requireSession(portal: PortalKey): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.portal !== portal) redirect(homeOf(session.portal));
  return session;
}
