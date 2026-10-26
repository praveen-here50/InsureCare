type Props = { className?: string };

export function ShieldIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 220 180" fill="none" className={className} aria-hidden="true">
      <defs><linearGradient id="ill-shield" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5666E3" /><stop offset="1" stopColor="#2A2F82" /></linearGradient></defs>
      <circle cx="110" cy="92" r="74" fill="#fff" fillOpacity=".55" />
      <rect x="48" y="22" width="104" height="132" rx="14" fill="#fff" stroke="#C9D2FC" strokeWidth="2" />
      <rect x="64" y="42" width="52" height="8" rx="4" fill="#C9D2FC" /><rect x="64" y="60" width="72" height="6" rx="3" fill="#E6EAFE" />
      <rect x="64" y="74" width="60" height="6" rx="3" fill="#E6EAFE" /><rect x="64" y="88" width="40" height="6" rx="3" fill="#E6EAFE" />
      <path d="M146 78l36 12v30c0 22-15 36-36 44-21-8-36-22-36-44V90z" fill="url(#ill-shield)" />
      <path d="M130 122l11 11 20-22" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HospitalIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 220 180" fill="none" className={className} aria-hidden="true">
      <circle cx="110" cy="96" r="76" fill="#fff" fillOpacity=".55" />
      <ellipse cx="110" cy="160" rx="86" ry="9" fill="#5666E3" fillOpacity=".12" />
      <rect x="34" y="94" width="46" height="66" rx="8" fill="#E6EAFE" /><rect x="140" y="84" width="46" height="76" rx="8" fill="#E6EAFE" />
      <rect x="62" y="52" width="96" height="108" rx="10" fill="#fff" stroke="#C9D2FC" strokeWidth="2" />
      <rect x="92" y="24" width="36" height="36" rx="10" fill="#FF6B6B" />
      <path d="M110 31v22M99 42h22" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      {[72, 98].flatMap((y) => [76, 102, 128].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="16" height="14" rx="3" fill="#C9D2FC" />))}
      <rect x="97" y="126" width="26" height="34" rx="6" fill="#3F49C8" />
      <rect x="44" y="108" width="12" height="10" rx="2" fill="#C9D2FC" /><rect x="44" y="126" width="12" height="10" rx="2" fill="#C9D2FC" />
      <rect x="156" y="98" width="12" height="10" rx="2" fill="#C9D2FC" /><rect x="156" y="118" width="12" height="10" rx="2" fill="#C9D2FC" />
    </svg>
  );
}

export function PulseIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 220 180" fill="none" className={className} aria-hidden="true">
      <circle cx="110" cy="92" r="74" fill="#fff" fillOpacity=".55" />
      <rect x="34" y="44" width="152" height="96" rx="16" fill="#fff" stroke="#C9D2FC" strokeWidth="2" />
      <circle cx="64" cy="70" r="12" fill="#FF6B6B" fillOpacity=".18" />
      <path d="M64 76s-8-5-8-10a4.5 4.5 0 018-2.5A4.5 4.5 0 0172 66c0 5-8 10-8 10z" fill="#FF6B6B" />
      <rect x="84" y="64" width="56" height="7" rx="3.5" fill="#C9D2FC" /><rect x="84" y="77" width="36" height="6" rx="3" fill="#E6EAFE" />
      <path d="M48 112h34l10-22 14 42 14-30 8 10h28" stroke="#3F49C8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="166" cy="122" r="16" fill="#22C55E" /><path d="M158 122l6 6 10-12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FamilyIllustration({ className }: Props) {
  const person = (cx: number, y: number, r: number, w: number, body: string) => (
    <g key={cx}><circle cx={cx} cy={y} r={r} fill="#FFD2B0" /><rect x={cx - w / 2} y={y + r + 4} width={w} height={138 - (y + r + 4)} rx={w / 2.6} fill={body} /></g>
  );
  return (
    <svg viewBox="0 0 220 160" fill="none" className={className} aria-hidden="true">
      <circle cx="110" cy="84" r="68" fill="#fff" fillOpacity=".55" />
      <ellipse cx="110" cy="142" rx="84" ry="8" fill="#5666E3" fillOpacity=".12" />
      {person(62, 82, 13, 44, "#A3B2F8")}{person(158, 82, 13, 44, "#7A8CF1")}{person(110, 58, 17, 56, "#3F49C8")}
    </svg>
  );
}
