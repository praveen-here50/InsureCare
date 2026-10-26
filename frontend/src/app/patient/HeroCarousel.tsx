"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { FamilyIllustration, HospitalIllustration, PulseIllustration, ShieldIllustration } from "@/components/Illustrations";
import { cn } from "@/lib/cn";

export type HeroSlide = { kicker: string; title: string; text: string; cta: string; href: string; art: "shield" | "hospital" | "pulse" | "family" };

const ART = { shield: ShieldIllustration, hospital: HospitalIllustration, pulse: PulseIllustration, family: FamilyIllustration };
const TONES = ["from-[#D6E8FF] via-[#E3EDFF] to-[#F0F4FF]", "from-[#E0E4FF] via-[#E9E6FF] to-[#F4EFFF]", "from-[#D3EEF3] via-[#DFF0FA] to-[#EEF5FF]"];
const INTERVAL = 5500;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, go]);

  return (
    <section
      aria-roledescription="carousel" aria-label="Highlights"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={(e) => { startX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        startX.current = null;
      }}
      className="relative overflow-hidden rounded-3xl shadow-[0_10px_40px_-12px_rgba(63,73,200,0.28)]"
    >
      <div className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide, i) => {
          const Art = ART[slide.art];
          const active = i === index;
          return (
            <div key={slide.title} aria-hidden={!active} className={cn("relative flex min-h-[290px] w-full shrink-0 items-center justify-between gap-4 bg-gradient-to-br px-6 pb-14 pt-8 sm:min-h-[300px] sm:px-10", TONES[i % TONES.length])}>
              <div className={cn("max-w-md", active ? "animate-fade-up" : "opacity-0")}>
                <p className="text-sm font-semibold text-brand-600">{slide.kicker}</p>
                <h2 className="mt-2 text-balance text-2xl font-bold leading-tight text-brand-950 sm:text-4xl">{slide.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{slide.text}</p>
                <Link href={slide.href} tabIndex={active ? 0 : -1} className="group mt-5 inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-800/25 transition hover:bg-brand-900 active:scale-95">
                  {slide.cta}<FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <Art className="w-36 shrink-0 animate-float sm:w-64" />
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-10">
        {slides.map((slide, i) => (
          <button key={slide.title} type="button" aria-label={`Show slide ${i + 1}`} aria-current={i === index} onClick={() => go(i)} className={cn("h-2 rounded-full bg-brand-800 transition-all duration-500", i === index ? "w-8" : "w-2 opacity-25 hover:opacity-50")} />
        ))}
      </div>
    </section>
  );
}
