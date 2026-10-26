"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { FiCheck } from "react-icons/fi";

type Ctx = (message: string) => void;
const ToastCtx = createContext<Ctx>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string }[]>([]);
  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, message }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-20 right-4 z-[60] flex flex-col gap-2 lg:bottom-6 lg:right-6">
        {items.map((t) => <div key={t.id} className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><FiCheck className="shrink-0 text-emerald-400" />{t.message}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
