import { notFound } from "next/navigation";
import { getGuideById, getAllGuides } from "@/lib/guides";
import GuideDetail from "@/components/GuideDetail";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const guide = getGuideById(id);
  if (!guide) return { title: "Guide not found" };
  return {
    title: `${guide.name} OAuth Setup Guide — OAuth Setup Hub`,
    description: guide.one_liner,
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = getGuideById(id);
  if (!guide) notFound();

  return (
    <div>
      {/* Breadcrumb bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </Link>
          <CopyLinkButton />
        </div>
      </div>

      <GuideDetail guide={guide} />
    </div>
  );
}

// Inline client component for copy-link (avoids extra file)
import CopyLinkButton from "@/components/CopyLinkButton";
