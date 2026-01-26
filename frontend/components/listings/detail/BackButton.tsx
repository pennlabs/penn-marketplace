"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const BackButton = () => {
  const router = useRouter();

  return (
    <button className="flex cursor-pointer items-center gap-2" onClick={() => router.back()}>
      <ArrowLeft className="h-5 w-5" />
      <span>Back</span>
    </button>
  );
};
