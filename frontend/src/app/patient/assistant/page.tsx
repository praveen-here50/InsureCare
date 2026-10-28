"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { FiArrowRight, FiFileText, FiHeart, FiInfo, FiMapPin, FiSend, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";
import { ApiError, send } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Surface } from "@/components/portal/ui";
import { MEMBER_REF } from "../portal";

// `failed` marks an error shown in the chat; it is not sent back as part of the conversation.
type Message = { id: number; role: "user" | "assistant"; text: string; source?: string; failed?: boolean };
type Reply = { text: string; source?: string };

const suggestedQuestions = ["What does my policy cover?", "Is cataract surgery covered?", "What documents are needed for a claim?", "Find hospitals in my network", "When does my policy expire?", "Explain my government scheme", "What's the status of my claim?"];
const helpTopics: Array<[IconType, string]> = [[FiShield, "Policies"], [FiFileText, "Documents"], [FiHeart, "Claims"], [FiMapPin, "Hospitals"]];
const quickLinks: Array<[string, string]> = [["My policies", "/patient/policies"], ["My documents", "/patient/documents"], ["My claims", "/patient/claims"], ["Find a hospital", "/patient/hospitals"]];

const initialMessages: Message[] = [{ id: 1, role: "assistant", text: "Hello, Priya. I can help you understand your policies, benefits, claims, documents, and healthcare options. What would you like to know?" }];

/** Answers come from the backend (POST /api/members/{id}/assistant), which reads the member's own records. */
async function askAssistant(conversation: Message[]) {
  const messages = conversation.filter((m) => !m.failed).map(({ role, text }) => ({ role, text }));
  return (await send<Reply>("POST", `/api/members/${MEMBER_REF}/assistant`, { messages }))!;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, thinking]);

  async function submitQuestion(question: string) {
    const value = question.trim();
    if (!value || thinking) return;
    const conversation: Message[] = [...messages, { id: Date.now(), role: "user", text: value }];
    setInput("");
    setMessages(conversation);
    setThinking(true);
    let answer: Message;
    try {
      const reply = await askAssistant(conversation);
      answer = { id: Date.now(), role: "assistant", text: reply.text, source: reply.source };
    } catch (error) {
      answer = { id: Date.now(), role: "assistant", failed: true, text: error instanceof ApiError ? error.message : "I couldn't reach InsureCare just now. Please check your connection and try again." };
    }
    setMessages((current) => [...current, answer]);
    setThinking(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); submitQuestion(input); }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-[2.5rem] sm:leading-[1.1]">Ask InsureCare</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500">Get quick answers about your cover, claims and documents in plain language.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Surface className="flex h-[min(680px,calc(100vh-260px))] min-h-[520px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-care-700 text-xs font-bold text-white">IC<span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-white" /></span>
            <div className="flex-1"><h2 className="font-bold text-ink">InsureCare assistant</h2><p className="text-xs text-slate-400">Answers from your InsureCare records</p></div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto bg-[#F8FAFD] p-5 sm:p-6" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">IC</span>}
                <div className={cn("flex max-w-[82%] flex-col gap-1.5", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn("whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-7", m.role === "user" ? "rounded-tr-md bg-care-600 text-white" : m.failed ? "rounded-tl-md border border-amber-200 bg-amber-50 text-amber-800" : "rounded-tl-md border border-slate-200/80 bg-white text-slate-700 shadow-soft")}>{m.text}</div>
                  {m.source && <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200"><FiFileText className="size-3 text-care-500" />{m.source}</span>}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">IC</span>
                <div className="flex gap-1 rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-4 py-4 shadow-soft">
                  {[0, 150, 300].map((d) => <span key={d} className="size-1.5 animate-pulse rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 transition focus-within:border-care-400 focus-within:ring-4 focus-within:ring-care-100">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your coverage…" aria-label="Ask InsureCare a question" className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-slate-400" />
              <button type="submit" disabled={!input.trim() || thinking} aria-label="Send question" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-care-600 text-white transition hover:bg-care-700 disabled:cursor-not-allowed disabled:opacity-40"><FiSend /></button>
            </form>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400"><FiInfo className="shrink-0" />Information only. Not medical advice and not a guarantee of coverage or claim approval.</p>
          </div>
        </Surface>

        <aside className="flex flex-col gap-5">
          <Surface className="p-5">
            <h2 className="text-sm font-bold text-ink">Try asking</h2>
            <div className="mt-3 flex flex-col gap-2">
              {suggestedQuestions.map((q) => (
                <button key={q} type="button" onClick={() => submitQuestion(q)} disabled={thinking} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:border-care-200 hover:bg-care-50 hover:text-care-800 disabled:opacity-50">
                  <span>{q}</span><FiArrowRight className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-care-600" />
                </button>
              ))}
            </div>
          </Surface>
          <Surface className="p-5">
            <h2 className="text-sm font-bold text-ink">I can help with</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">{helpTopics.map(([Icon, label]) => <div key={label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600"><Icon className="text-care-500" />{label}</div>)}</div>
          </Surface>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
            <h2 className="text-sm font-bold text-ink">Quick access</h2>
            <div className="mt-3 flex flex-col gap-2.5">{quickLinks.map(([label, href]) => <Link key={href} href={href} className="flex items-center justify-between text-sm font-semibold text-slate-600 hover:text-care-700"><span>{label}</span><FiArrowRight /></Link>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
