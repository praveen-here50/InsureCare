// Backend reads for server components, as the visitor: their sign-in cookie goes along, so the backend knows who is asking.
import { cookies } from "next/headers";
import { BACKEND_URL, check } from "./api";

/** GET JSON as the signed-in visitor. Never cached: every request reads current data. */
export async function serverApi<T>(path: string): Promise<T> {
  const cookie = (await cookies()).toString();
  const res = await fetch(`${BACKEND_URL}${path}`, { cache: "no-store", headers: cookie ? { cookie } : {} }).then(check);
  return res.json() as Promise<T>;
}
