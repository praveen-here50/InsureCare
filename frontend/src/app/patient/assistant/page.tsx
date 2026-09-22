"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FiArrowRight, FiFileText, FiHeart, FiMapPin, FiMic, FiPaperclip, FiSend, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";

type Message = { id: number; role: "user" | "assistant"; text: string; time: string; source?: string };

const suggestedQuestions = ["What does my policy cover?", "Is cataract surgery covered?", "What documents are needed for a claim?", "Find hospitals in my network", "When does my policy expire?", "Explain my government scheme", "What's the status of my claim?"];
const helpTopics: Array<[IconType, string]> = [[FiShield, "Policies"], [FiFileText, "Documents"], [FiHeart, "Claims"], [FiMapPin, "Hospitals"], [FiShield, "Government schemes"]];
const quickLinks: Array<[string, string]> = [["My Policies", "/patient/policies"], ["My Documents", "/patient/documents"], ["My Claims", "/patient/claims"], ["Find a Hospital", "/patient/hospitals"]];

const demoReplies: Record<string, { text: string; source?: string }> = {
  "What does my policy cover?": { text: "In this synthetic demo, Family Health Shield Plus includes hospitalization, day-care procedures, and eligible pre- and post-hospitalization expenses. Please review your policy terms or contact the insurer before relying on this information.", source: "Family Health Shield Plus · Policy document · Demo" },
  "Is cataract surgery covered?": { text: "Based on the synthetic policy information available in this demo, cataract surgery is listed under covered hospitalization benefits. A waiting period may apply. This is not a coverage confirmation—please review your policy terms or contact the insurer before treatment.", source: "Family Health Shield Plus · Policy document · Demo" },
  "What documents are needed for a claim?": { text: "The demo checklist includes your claim form, hospital discharge summary, itemized bills, prescriptions, and identity or policy documents. Your insurer may request additional records.", source: "Claim checklist · Document library · Demo" },
  "Find hospitals in my network": { text: "I can help you browse the synthetic hospital directory by location, specialty, and network status. Use the Find a hospital shortcut below to explore available demo facilities.", source: "Hospital directory · Demo" },
  "When does my policy expire?": { text: "Your synthetic Family Health Shield Plus policy is shown as active through 31 March 2027. This demo date is for illustration only; confirm the date on your actual policy document.", source: "Family Health Shield Plus · Policy document · Demo" },
  "Explain my government scheme": { text: "The demo government scheme section explains eligibility, covered services, and enrollment guidance in plain language. Open the Policies area to review the available synthetic scheme information.", source: "Government scheme guide · Demo" },
  "What's the status of my claim?": { text: "Your synthetic claim is currently shown as under review. This demo status is not connected to an insurer and does not represent a real claim decision.", source: "Claim record · Demo" },
};

const initialMessages: Message[] = [{ id: 1, role: "assistant", text: "Hello, Priya. I can help you understand your synthetic demo policies, benefits, claims, documents, and healthcare options. What would you like to explore?", time: "10:32 AM" }, { id: 2, role: "user", text: "My father needs cataract surgery. Is it covered by my policy?", time: "10:33 AM" }, { id: 3, role: "assistant", text: demoReplies["Is cataract surgery covered?"]!.text, time: "10:33 AM", source: demoReplies["Is cataract surgery covered?"]!.source }];

function getReply(question: string) { return demoReplies[question] ?? { text: "I couldn't find supporting information in your available demo documents. Please check your policy documents or contact your insurer. I won't guess when no supporting source is available." }; }

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function submitQuestion(question: string) {
    const value = question.trim();
    if (!value || thinking) return;
    const reply = getReply(value);
    setInput("");
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: value, time: "Now" }]);
    setThinking(true);
    window.setTimeout(() => { setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: reply.text, time: "Now", source: reply.source }]); setThinking(false); }, 650);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); submitQuestion(input); }

  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
      <div><div className="mb-2 flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><FiShield /></span><span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">InsureCare assistant</span></div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Ask InsureCare</h1><p className="mt-1 text-sm text-slate-500">Get simple answers about your policies, benefits, claims, and healthcare coverage.</p></div><span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Synthetic demo assistant</span>
    </header>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Assistant conversation">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Your conversation</h2><p className="mt-0.5 text-xs text-slate-500">Answers use synthetic demo information only.</p></div><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />Ready to help</span></div>
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-5 sm:p-7" aria-live="polite">
          {messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`flex max-w-[88%] gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}><div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${message.role === "assistant" ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-600"}`}>{message.role === "assistant" ? "IC" : "P"}</div><div className={`${message.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}><div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-tr-sm bg-teal-700 text-white" : "rounded-tl-sm border border-slate-200 bg-white text-slate-700 shadow-sm"}`}>{message.text}</div>{message.source && <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"><span className="font-semibold text-slate-700">Based on:</span> {message.source}</div>}<span className="px-1 text-[11px] text-slate-400">{message.time}</span></div></div></div>)}
          {thinking && <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">IC</div><div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">Thinking through your demo information<span className="ml-1 inline-flex gap-0.5"><span className="animate-pulse">.</span><span className="animate-pulse [animation-delay:150ms]">.</span><span className="animate-pulse [animation-delay:300ms]">.</span></span></div></div>}
        </div>
        <div className="border-t border-slate-100 bg-white p-4 sm:p-5"><form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-1.5 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100"><button type="button" title="Attachments are demo-only" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"><FiPaperclip /></button><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your coverage..." aria-label="Ask InsureCare a question" className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-800 outline-none placeholder:text-slate-400" /><button type="button" title="Microphone is demo-only" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"><FiMic /></button><button type="submit" disabled={!input.trim() || thinking} aria-label="Send question" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"><FiSend /></button></form><p className="mt-3 text-center text-[11px] leading-4 text-slate-400">InsureCare provides information to help you understand your coverage. It does not replace medical advice or guarantee claim approval or coverage.</p></div>
      </section>

      <aside className="flex flex-col gap-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Suggested questions</h2><div className="mt-3 flex flex-col gap-2">{suggestedQuestions.map((question) => <button key={question} onClick={() => submitQuestion(question)} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-xs text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"><span>{question}</span><FiArrowRight className="shrink-0 text-slate-400" /></button>)}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">What I can help with</h2><p className="mt-1 text-xs leading-5 text-slate-500">Future answers can be grounded in your InsureCare areas.</p><div className="mt-4 grid grid-cols-2 gap-2">{helpTopics.map(([Icon, label]) => <div key={label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-600"><Icon className="text-teal-700" />{label}</div>)}</div></section>
        <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5"><h2 className="text-sm font-semibold text-slate-900">Quick access</h2><div className="mt-3 flex flex-col gap-2">{quickLinks.map(([label, href]) => <Link key={href} href={href} className="flex items-center justify-between text-xs font-semibold text-teal-800 hover:text-teal-950"><span>{label}</span><FiArrowRight /></Link>)}</div></section>
      </aside>
    </div>
  </div>;
}
