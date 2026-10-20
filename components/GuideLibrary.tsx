"use client";

import { useState, useMemo } from "react";
import type { Guide, Difficulty } from "@/lib/types";
import GuideCard from "./GuideCard";
import { Search, Filter, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

interface GuideLibraryProps {
  initialGuides: Guide[];
}

export default function GuideLibrary({ initialGuides }: GuideLibraryProps) {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [filterApproval, setFilterApproval] = useState<boolean | null>(null);

  const filteredGuides = useMemo(() => {
    return initialGuides.filter((g) => {
      // Search filter
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.one_liner.toLowerCase().includes(q);

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty === "All" || g.difficulty === selectedDifficulty;

      // Approval filter
      const matchesApproval =
        filterApproval === null || g.approval_required === filterApproval;

      return matchesSearch && matchesDifficulty && matchesApproval;
    });
  }, [initialGuides, search, selectedDifficulty, filterApproval]);

  const difficulties: ("All" | Difficulty)[] = ["All", "Easy", "Medium", "Hard", "Complex"];

  return (
    <div>
      {/* ── Filters bar ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by app, category, or keyword..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>

        {/* Difficulty pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDifficulty === d
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d}
            </button>
          ))}

          {/* Approval toggle */}
          <button
            onClick={() =>
              setFilterApproval((prev) => (prev === true ? null : true))
            }
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              filterApproval === true
                ? "bg-amber-500 border-amber-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Needs review
          </button>
        </div>
      </div>

      {/* Count & clear */}
      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing {filteredGuides.length} of {initialGuides.length} guides
        </span>
        {(search || selectedDifficulty !== "All" || filterApproval !== null) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedDifficulty("All");
              setFilterApproval(null);
            }}
            className="text-violet-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredGuides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center bg-white p-6">
          <p className="text-gray-600 font-medium">No guides matched your query.</p>
          <p className="mt-1 text-sm text-gray-400">
            You can generate a brand new guide for this app right now with our live agent.
          </p>
          <Link
            href={`/generate`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Generate guide for &quot;{search || "this app"}&quot; →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
