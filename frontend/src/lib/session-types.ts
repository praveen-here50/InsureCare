// Shapes shared by the server session helpers (session.ts) and browser code.

export type PortalKey = "patient" | "hospital" | "insurer";

/** The signed-in person (GET /api/auth/me). Patients have `memberRef`/`memberId`; hospital staff have `hospitalId`/`hospitalName`. */
export type Session = {
  name: string; email?: string; portal: PortalKey;
  memberRef?: string; memberId?: string; hospitalId?: string; hospitalName?: string;
};

/** Where each kind of account lands after signing in. */
export const homeOf = (portal: PortalKey) => `/${portal}`;
