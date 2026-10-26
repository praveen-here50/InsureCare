"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** Photograph with a quiet placeholder while loading or if the image is unavailable. */
export default function Photo({ src, alt = "", className, position = "center" }: { src: string; alt?: string; className?: string; position?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cn("block overflow-hidden bg-slate-200", className)}>
      {!failed && <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} style={{ objectPosition: position }} className="size-full object-cover" />}
    </span>
  );
}
