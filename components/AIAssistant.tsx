"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, MessageCircle, Send, Sparkles, User, X } from "lucide-react";

type AssistantMatch = {
  id: string;
  title: string;
  description: string;
  city: string;
  privacyTier: string;
  price: number;
  link: string;
  score: number;
};

type AssistantResponse = {
  message: string;
  matches: AssistantMatch[];
  needsMoreDetail?: boolean;
  fallback?: boolean;
};

type ChatMessage =
  | { id: string; role: "assistant"; text: string; matches?: AssistantMatch[] }
  | { id: string; role: "user"; text: string };

const starterPrompts = [
  "Malibu house with a pool and ocean view for a Video production shoot",
  "Private place in Topanga for a softcore photo shoot",
  "Modern Los Angeles location that allows hardcore content",
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Ask me anything about our locations. Tell me the area, vibe, privacy level, or amenities you want and I’ll suggest the best matches.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  const starterCards = useMemo(
    () =>
      starterPrompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => setInput(prompt)}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white transition hover:border-blue-400/50 hover:bg-blue-500/10"
        >
          {prompt}
        </button>
      )),
    []
  );

  const submitPrompt = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Assistant request failed");
      }

      const data: AssistantResponse = await response.json();

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.message,
          matches: data.matches,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Something glitched on my end. Try another search and I’ll take another swing.",
        },
      ]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submitPrompt(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:scale-105"
        aria-label="Location Scout"
        title="Location Scout"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[70] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f16]/95 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/20 via-transparent to-blue-400/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Location Scout
                </div>
                <p className="mt-1 text-sm text-white">
                  Ask me anything about our locations.
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300">
                live
              </span>
            </div>
          </div>

          <div ref={listRef} className="max-h-[26rem] space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2">{starterCards}</div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-white/10 bg-white/5 text-white"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-blue-500">
                    {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {message.role === "assistant" && message.matches && message.matches.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.matches.map((match) => (
                        <div key={match.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-medium text-white">{match.title}</h4>
                              <p className="mt-1 text-xs text-blue-500">
                                {match.city} · {match.privacyTier} · ${match.price}/hr
                              </p>
                            </div>
                            <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-blue-500">
                              match
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white">{match.description}</p>
                          <Link
                            href={match.link}
                            className="mt-3 inline-flex text-sm font-medium text-blue-600 transition hover:text-blue-500"
                          >
                            View location →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding the best spots...
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
            <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="Ask Location Scout about the kind of location you need"
                className="min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-blue-500"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
