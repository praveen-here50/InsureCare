"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { send } from "@/lib/api";
import type { Session } from "@/lib/session-types";

const SessionCtx = createContext<Session | null>(null);

/** Makes the signed-in person available to the portal's client components (set by PortalShell). */
export function SessionProvider({ session, children }: { session: Session; children: React.ReactNode }) {
  return <SessionCtx.Provider value={session}>{children}</SessionCtx.Provider>;
}

/** The signed-in person. Only inside a portal, where the layout has already required a session. */
export function useSession(): Session {
  const session = useContext(SessionCtx);
  if (!session) throw new Error("useSession is only available inside a signed-in portal");
  return session;
}

/** Signs out on the server, forgets this tab's assistant chat and goes to the sign-in page. */
export function useSignOut() {
  const router = useRouter();
  return async () => {
    try { await send("POST", "/api/auth/logout"); } catch {}
    try { sessionStorage.clear(); } catch {}
    router.replace("/login");
    router.refresh();
  };
}
