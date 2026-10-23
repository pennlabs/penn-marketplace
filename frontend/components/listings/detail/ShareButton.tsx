"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  text: string;
  className?: string;
}

export const ShareButton = ({ title, text, className }: Props) => {
  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;

    // only touch devices use native share popup, web just copies link
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyLink(url);
  };

  return (
    <button
      type="button"
      className={cn("cursor-pointer", className)}
      onClick={handleShare}
      aria-label="Share listing"
    >
      <Share className="h-5 w-5" />
    </button>
  );
};
