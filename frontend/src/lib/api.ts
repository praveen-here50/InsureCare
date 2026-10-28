// Client for the InsureCare backend (backend/). Browser code reads with `api` and writes with `send`; server components
// read with `serverApi` (server-api.ts), which passes the visitor's sign-in cookie along.
// The browser calls this site's own /api, which Next.js forwards to the backend (next.config.ts), so the cookie stays first-party.

/** Backend address for the Next.js server (and its /api forwarding). The browser uses relative /api paths. */
export const BACKEND_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const BASE = typeof window === "undefined" ? BACKEND_URL : "";

/**
 * WebSocket that pushes a message whenever data changes (opened with a one-time ticket, see LiveUpdates). By default the
 * backend on port 8080 of whatever address the page was opened with (localhost, or this PC's Wi-Fi address on a phone);
 * set NEXT_PUBLIC_LIVE_URL when the backend is elsewhere. Call it in the browser.
 */
export const liveUrl = () => process.env.NEXT_PUBLIC_LIVE_URL
  ?? `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:8080/live`;

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function check(res: Response) {
  if (res.ok) return res;
  let detail = res.statusText;
  try { detail = ((await res.json()) as { detail?: string }).detail ?? detail; } catch {}
  throw new ApiError(res.status, detail);
}

/** GET JSON from the browser. Never cached: every request reads current data. */
export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" }).then(check);
  return res.json() as Promise<T>;
}

/** POST/PATCH/DELETE from the browser. Objects are sent as JSON, FormData as multipart. */
export async function send<T = unknown>(method: "POST" | "PATCH" | "DELETE", path: string, body?: object | FormData): Promise<T | undefined> {
  const json = body !== undefined && !(body instanceof FormData);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: json ? { "Content-Type": "application/json" } : undefined,
    body: json ? JSON.stringify(body) : (body as FormData | undefined),
  }).then(check);
  return res.status === 204 ? undefined : (res.json() as Promise<T>);
}

/** POST JSON from the browser and read a plain-text answer as it streams in; `onText` gets the whole text so far. */
export async function stream(path: string, body: object, onText: (text: string) => void): Promise<string> {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(check);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  return text + decoder.decode();
}

/** URL the browser opens for a path returned by the API (e.g. a document file): same-origin, so the sign-in cookie goes with it. */
export const apiUrl = (path: string) => path;
