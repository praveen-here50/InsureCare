// Client for the InsureCare backend (backend/). Server components read with `api`; browser code writes with `send`.

/** Backend base URL. The server can use a private address (API_URL); the browser needs a public one. */
export const API_URL = (typeof window === "undefined" ? process.env.API_URL : undefined) ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** WebSocket that pushes a message whenever data changes. */
export const LIVE_URL = process.env.NEXT_PUBLIC_LIVE_URL ?? `${(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/^http/, "ws")}/live`;

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function check(res: Response) {
  if (res.ok) return res;
  let detail = res.statusText;
  try { detail = ((await res.json()) as { detail?: string }).detail ?? detail; } catch {}
  throw new ApiError(res.status, detail);
}

/** GET JSON. Never cached: every request reads current data. */
export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" }).then(check);
  return res.json() as Promise<T>;
}

/** POST/PATCH/DELETE from the browser. Objects are sent as JSON, FormData as multipart. */
export async function send<T = unknown>(method: "POST" | "PATCH" | "DELETE", path: string, body?: object | FormData): Promise<T | undefined> {
  const json = body !== undefined && !(body instanceof FormData);
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: json ? { "Content-Type": "application/json" } : undefined,
    body: json ? JSON.stringify(body) : (body as FormData | undefined),
  }).then(check);
  return res.status === 204 ? undefined : (res.json() as Promise<T>);
}

/** Absolute URL for a path returned by the API (e.g. a document file). */
export const apiUrl = (path: string) => `${API_URL}${path}`;
