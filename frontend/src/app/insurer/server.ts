// Loads the insurer portal on the server, as the signed-in claims officer.
import { cache } from "react";
import { requireSession } from "@/lib/session";
import { serverApi } from "@/lib/server-api";
import { insurerData, type Snapshot } from "./data";

/** Once per request, shared by layout and page. */
export const getInsurerData = cache(async () => {
  await requireSession("insurer");
  return insurerData(await serverApi<Snapshot>("/api/insurer"));
});
