"use client";

import { cn, difficultyColor, difficultyDot, confidenceColor, confidenceBg } from "@/lib/utils";
import type { Guide, Confidence } from "@/lib/types";
import {
  Clock,
  ShieldCheck,
  ShieldOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Bot,
  User,
  ChevronRight,
} from "lucide-react";

export default function GuideDetail({ guide }: { guide: Guide }) {
  const confidence: Confidence =
    guide.evidence?.confidence === "High" ||
    guide.evidence?.confidence === "Medium" ||
    guide.evidence?.confidence === "Low"
      ? guide.evidence.confidence
      : "Medium";

  const caveats = Array.isArray(guide.evidence?.caveats) ? guide.evidence.caveats : [];
  const sources = Array.isArray(guide.evidence?.sources) ? guide.evidence.sources : [];
  const prerequisites = Array.isArray(guide.prerequisites) ? guide.prerequisites : [];
  const steps = Array.isArray(guide.steps) ? guide.steps : [];
  const commonBlockers = Array.isArray(guide.common_blockers) ? guide.common_blockers : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2">
              <img
                src={guide.logo_url}
                alt={guide.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{guide.name}</h1>
              <p className="text-sm text-gray-500">{guide.category || "Third-Party Integration"}</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-semibold",
              difficultyColor(guide.difficulty || "Medium")
            )}
          >
            <span
              className={cn(
                "mr-1.5 inline-block h-2 w-2 rounded-full align-middle",
                difficultyDot(guide.difficulty || "Medium")
              )}
            />
            {guide.difficulty || "Medium"}
          </span>
        </div>

        <p className="mt-4 text-gray-700 leading-relaxed">{guide.one_liner}</p>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Setup time" value={guide.setup_time || "30–60 min"} icon={<Clock className="h-4 w-4" />} />
          <Stat
            label="Approval"
            value={guide.approval_required ? guide.approval_time || "Required" : "Not required"}
            icon={
              guide.approval_required ? (
                <ShieldCheck className="h-4 w-4 text-amber-500" />
              ) : (
                <ShieldOff className="h-4 w-4 text-emerald-500" />
              )
            }
          />
          <Stat
            label="Registration"
            value={guide.timeline?.registration || "15 min"}
            icon={<ChevronRight className="h-4 w-4" />}
          />
          <Stat
            label="Total"
            value={guide.timeline?.total || "~30 min"}
            icon={<Clock className="h-4 w-4 text-violet-500" />}
          />
        </div>
      </div>

      {/* ── Composio context callout ── */}
      <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-sm font-semibold text-violet-800 mb-1">Why you&apos;re here (Composio context)</p>
        <p className="text-sm text-violet-700">{guide.composio_context}</p>
        {guide.composio_managed && (
          <span className="mt-2 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            ✓ Available in Composio managed OAuth
          </span>
        )}
      </div>

      {/* ── Prerequisites ── */}
      {prerequisites.length > 0 && (
        <Section title="Before you start" subtitle="Have these ready before opening the developer portal">
          <ul className="space-y-2">
            {prerequisites.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Steps ── */}
      {steps.length > 0 && (
        <Section title="Setup steps" subtitle="Step-by-step guide — researched and verified by agent">
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {step.id}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      {step.estimated_time && (
                        <span className="text-xs text-gray-400">{step.estimated_time}</span>
                      )}
                      {step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-violet-600 hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {step.description && (
                      <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    )}

                    {/* Form fields */}
                    {step.fields && step.fields.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {step.fields.map((f: any, fIdx) => {
                          const label =
                            typeof f === "string"
                              ? f
                              : f?.name
                              ? f?.description
                                ? `${f.name}: ${f.description}`
                                : f.name
                              : JSON.stringify(f);
                          return (
                            <span
                              key={fIdx}
                              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Agent note */}
                    <div
                      className={cn(
                        "mt-2 flex items-start gap-2 rounded-md p-2 text-xs",
                        step.agent_can_do ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-600"
                      )}
                    >
                      {step.agent_can_do ? (
                        <Bot className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <User className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span>
                        <strong>{step.agent_can_do ? "Agent can help: " : "You must do this: "}</strong>
                        {step.agent_note ??
                          (step.agent_can_do
                            ? "Agent can assist with this step."
                            : "Requires your account access.")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Approval details ── */}
      {guide.approval_details && guide.approval_details.is_required && (
        <Section title="Approval process" subtitle="What the review involves and how to navigate it">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-medium text-amber-700">Reviewed by</p>
                <p className="mt-1 text-sm font-semibold text-amber-900">
                  {guide.approval_details.who_reviews || "Provider Review Team"}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-medium text-amber-700">Typical wait</p>
                <p className="mt-1 text-sm font-semibold text-amber-900">
                  {guide.approval_details.typical_wait || "1–2 weeks"}
                </p>
              </div>
            </div>

            {Array.isArray(guide.approval_details.rejection_reasons) &&
              guide.approval_details.rejection_reasons.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Common rejection reasons</p>
                  <ul className="space-y-1.5">
                    {guide.approval_details.rejection_reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {Array.isArray(guide.approval_details.tips) && guide.approval_details.tips.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Tips for approval</p>
                <ul className="space-y-1.5">
                  {guide.approval_details.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Blockers ── */}
      {commonBlockers.length > 0 && (
        <Section
          title="Common blockers & how to resolve them"
          subtitle="What trips developers up and how to get unblocked"
        >
          <div className="space-y-3">
            {commonBlockers.map((b, i) => (
              <div key={i} className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900">{b.blocker}</p>
                    <p className="mt-1 text-sm text-orange-800">{b.how_to_resolve}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Agent capabilities ── */}
      <Section
        title="What the agent can do for you"
        subtitle="Where AI helps and where you need to take over"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-700 mb-4">
            {guide.agent_capabilities?.summary ||
              "Agent can research requirements and identify forms; human login is required for submitting credentials."}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Research requirements",
                can: guide.agent_capabilities?.can_research_requirements ?? true,
              },
              {
                label: "Navigate portal",
                can: guide.agent_capabilities?.can_navigate_portal ?? true,
              },
              {
                label: "Fill forms",
                can: guide.agent_capabilities?.can_fill_forms ?? false,
              },
              {
                label: "Submit approval",
                can: guide.agent_capabilities?.can_submit_approval ?? false,
              },
            ].map(({ label, can }) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 rounded-md p-2 text-sm",
                  can ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"
                )}
              >
                {can ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
                {label}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Evidence ── */}
      <Section
        title="Evidence & confidence"
        subtitle="What was tested, what sources support this, and what remains uncertain"
      >
        <div className={cn("rounded-lg border p-4", confidenceBg(confidence))}>
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("text-sm font-bold", confidenceColor(confidence))}>
              {confidence} confidence
            </span>
            <span className="text-xs text-gray-500">
              · Last verified {guide.evidence?.last_verified || "Recently"}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            {guide.evidence?.tested_notes ||
              "Agent synthesized guidance from web documentation and portal references."}
          </p>

          {caveats.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Caveats & uncertainty</p>
              <ul className="space-y-1">
                {caveats.map((c, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Sources</p>
              <ul className="space-y-1">
                {sources.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-medium",
                        s.type === "official"
                          ? "bg-blue-100 text-blue-700"
                          : s.type === "community"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {s.type}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline flex items-center gap-1"
                    >
                      {s.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
