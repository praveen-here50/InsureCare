export default function PatientLoading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6" aria-busy="true" aria-label="Loading page">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-80 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="size-11 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100" />
      </div>
    </div>
  );
}
