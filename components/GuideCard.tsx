"use client";

import Link from "next/link";
import { difficultyColor, difficultyDot, cn } from "@/lib/utils";
import type { Guide } from "@/lib/types";
import { Clock, ShieldCheck, ShieldOff, ArrowRight } from "lucide-react";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link
      href={`/guide/${guide.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-100 bg-gray-50 p-1.5 overflow-hidden">
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
            <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
              {guide.name}
            </h3>
            <p className="text-xs text-gray-500">{guide.category}</p>
          </div>
        </div>
        {/* Difficulty badge */}
        <span
          className={cn(
            "flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            difficultyColor(guide.difficulty)
          )}
        >
          <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle", difficultyDot(guide.difficulty))} />
          {guide.difficulty}
        </span>
      </div>

      {/* One-liner */}
      <p className="mt-3 text-sm text-gray-600 leading-relaxed flex-1">
        {guide.one_liner}
      </p>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {guide.setup_time}
        </span>
        {guide.approval_required ? (
          <span className="flex items-center gap-1 text-amber-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            {guide.approval_time ?? "Review required"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-600">
            <ShieldOff className="h-3.5 w-3.5" />
            No approval needed
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        {guide.composio_managed && (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-600 font-medium">
            Composio managed
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-violet-600 group-hover:gap-2 transition-all">
          View guide <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
