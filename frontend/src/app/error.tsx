"use client";

import { FiRefreshCw, FiWifiOff } from "react-icons/fi";

/** Shown when a page cannot load its data, most often because the backend is not running. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><FiWifiOff className="size-6" /></span>
      <h1 className="text-xl font-bold text-slate-900">Can’t reach InsureCare right now</h1>
      <p className="text-sm leading-6 text-slate-500">The data service didn’t respond. If it was asleep, it can take up to a minute to start, so please try again shortly.</p>
      <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"><FiRefreshCw />Try again</button>
    </div>
  );
}
