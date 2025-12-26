"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const BackButton = () => {
  const router = useRouter();

  return (
    <button
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </button>
  );
}