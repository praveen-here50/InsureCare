import ClaimsBoard from "../ClaimsBoard";
import { admitted } from "../data";

export default function InsurerClaimsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Insurer claims</h1></div>
      <ClaimsBoard patients={admitted()} />
    </div>
  );
}
