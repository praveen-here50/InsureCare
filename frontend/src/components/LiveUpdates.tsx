"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/Toast";
import { liveUrl } from "@/lib/api";

type LiveMessage = { topic: string; message: string; at: string };

/**
 * Keeps the open page in step with the database. The backend pushes a message over a WebSocket
 * whenever anything changes; we show it as a toast and re-render the page with fresh server data.
 */
export default function LiveUpdates() {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let refresh: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(liveUrl());
      socket.onopen = () => {
        // Anything may have changed while we were disconnected.
        if (attempts > 0) router.refresh();
        attempts = 0;
      };
      socket.onmessage = (e) => {
        try { toast((JSON.parse(e.data as string) as LiveMessage).message); } catch {}
        clearTimeout(refresh);
        refresh = setTimeout(() => router.refresh(), 150); // one refresh for a burst of changes
      };
      socket.onclose = () => {
        if (closed) return;
        retry = setTimeout(connect, Math.min(30_000, 1_000 * 2 ** attempts++));
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(retry);
      clearTimeout(refresh);
      socket?.close();
    };
  }, [router, toast]);

  return null;
}
