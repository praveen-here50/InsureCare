// Loads the hospital desk on the server, for the hospital the signed-in staff member works at.
import { cache } from "react";
import { requireSession } from "@/lib/session";
import { serverApi } from "@/lib/server-api";
import type { Workspace } from "./data";

/** Loads the desk and returns it with the lookups the pages use. Once per request, shared by layout and page. */
export const getHospitalDesk = cache(async () => {
  const { hospitalId } = await requireSession("hospital");
  const w = await serverApi<Workspace>(`/api/hospitals/${hospitalId}/workspace`);
  return {
    HOSPITAL: w.hospital,
    AGENT: w.agent,
    WARDS: w.wards,
    SERVICES: w.services,
    PATIENTS: w.patients,
    admitted: () => w.patients.filter((p) => p.status !== "Not admitted"),
    getPatient: (id: string) => w.patients.find((p) => p.id === id),
    serviceByName: (name: string) => w.services.find((s) => s.name === name),
  };
});
