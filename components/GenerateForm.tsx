"use client";

import { useState, useRef } from "react";
import { Bot, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { Guide, GenerateStreamEvent } from "@/lib/types";
import GuideDetail from "./GuideDetail";

export default function GenerateForm() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Reset state
    setSteps([]);
    setGuide(null);
    setError(null);
    setLoading(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_name: input.trim(), app_url: url.trim() || undefined }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start generation");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: GenerateStreamEvent = JSON.parse(line.slice(6));
            if (event.type === "step" && event.message) {
              setSteps((prev) => [...prev, event.message!]);
            } else if (event.type === "result" && event.guide) {
              setGuide(event.guide);
            } else if (event.type === "error") {
              setError(event.error ?? "Unknown error");
            }
          } catch {
            // malformed JSON — skip
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFinished = !!guide || !!error;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-5 w-5 text-violet-600" />
          <h2 className="text-lg font-bold text-gray-900">Generate a guide</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Enter any app name or URL. The agent will research its OAuth setup process and generate a shareable guide in real time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              App name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Linear, Figma, HubSpot..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Website URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://linear.app"
              className="w-full rounded-lg border border-gray-300 py-2.5 px-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Bot className="h-4 w-4" />
                Generate guide
              </>
            )}
          </button>
        </form>
      </div>

      {/* Agent progress */}
      {(steps.length > 0 || loading) && !isFinished && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Agent working…
          </p>
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                {s}
              </li>
            ))}
            {loading && (
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                Thinking…
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">Generation failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Completed steps summary before guide */}
      {guide && steps.length > 0 && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-700 mb-2">Agent completed {steps.length} research steps</p>
          <ul className="space-y-1">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated guide */}
      {guide && <GuideDetail guide={guide} />}
    </div>
  );
}
