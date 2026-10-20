import GenerateForm from "@/components/GenerateForm";
import type { Metadata } from "next";
import { Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Generate OAuth Guide — OAuth Setup Hub",
  description:
    "Enter any app name or URL. The agent researches its OAuth setup process and generates a shareable guide in real time.",
};

export default function GeneratePage() {
  return (
    <>
      {/* Page header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            <Bot className="h-4 w-4" />
            Live agent
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Generate a guide for any app
          </h1>
          <p className="mt-3 text-gray-600">
            The agent will search the web, navigate developer portals, and produce a detailed
            OAuth setup guide — including difficulty, timeline, approval requirements, and blockers.
          </p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Heads up:</strong> Generation takes 30–90 seconds. The agent runs multiple
            web searches and reads documentation to produce accurate guidance.
          </div>
        </div>
      </section>

      <GenerateForm />
    </>
  );
}
