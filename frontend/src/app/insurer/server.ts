// Loads the insurer portal on the server, as the signed-in claims officer.
import { requireSession } from "@/lib/session";
import { serverApi } from "@/lib/server-api";
import { insurerData, type Snapshot } from "./data";

export async function getInsurerData() {
  await requireSession("insurer");
  return insurerData(await serverApi<Snapshot>("/api/insurer"));
}
