import { getAllGuides } from "@/lib/guides";
import GuideLibrary from "@/components/GuideLibrary";
import Link from "next/link";
import { ArrowRight, Bot, Zap, Clock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const guides = getAllGuides();

  return (
    <>
      {/* ── Hero ── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              <Bot className="h-4 w-4" />
              Agent-researched guides
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Set up your OAuth app
              <span className="text-violet-600"> without the guesswork.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              When you build an AI agent with Composio, at some point you need your own OAuth app with the provider — your branding, your scopes, your credentials.
              This hub tells you exactly what&apos;s involved: setup steps, approval timelines, blockers, and what an agent can do for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/generate"
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
              >
                <Bot className="h-4 w-4" />
                Generate guide for any app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#library"
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
              >
                Browse library
              </a>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-3 gap-5 max-w-lg">
            <QuickStat icon={<Zap className="h-5 w-5 text-emerald-500" />} label="Fastest setup" value="~15 min" sub="GitHub" />
            <QuickStat icon={<Clock className="h-5 w-5 text-amber-500" />} label="Longest review" value="4–12 weeks" sub="Salesforce AppExchange" />
            <QuickStat icon={<ShieldCheck className="h-5 w-5 text-violet-500" />} label="Apps with approval" value="5 of 7" sub="in this library" />
          </div>
        </div>
      </section>

      {/* ── Managed vs Own callout ── */}
      <section className="border-b border-gray-200 bg-violet-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-800">
                Composio managed OAuth vs. your own OAuth app
              </p>
              <p className="mt-1 text-sm text-violet-700">
                Composio&apos;s managed integrations let you prototype without registering your own app. When you go to production, you switch to your own credentials — that&apos;s what these guides are for.
              </p>
            </div>
            <Link
              href="/generate"
              className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Not in library? Generate →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Guide Library ── */}
      <section id="library" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Guide library</h2>
            <p className="mt-1 text-sm text-gray-500">
              Agent-researched guides with verified evidence, requirements, and approval paths.
            </p>
          </div>
        </div>

        <GuideLibrary initialGuides={guides} />

        {/* Generate CTA */}
        <div className="mt-12 rounded-2xl border border-violet-200 bg-violet-50 p-6 text-center">
          <Bot className="mx-auto h-8 w-8 text-violet-500 mb-3" />
          <h3 className="text-lg font-bold text-gray-900">Need a guide for a different app?</h3>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            The agent can investigate any OAuth-supporting app in real time — just enter the name or URL and watch it work.
          </p>
          <Link
            href="/generate"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            Generate a guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function QuickStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}
