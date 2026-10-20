"use client";

import { Share2 } from "lucide-react";

export default function CopyLinkButton() {
  const copy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <Share2 className="h-4 w-4" />
      Share guide
    </button>
  );
}
