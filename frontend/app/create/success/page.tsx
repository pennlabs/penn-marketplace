"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListingSuccessPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("id");
  const listingType = searchParams.get("type") || "items";

  return (
    <div className="w-full mx-auto container max-w-[96rem] px-12 pt-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-bold mb-8">
          Your listing was successfully uploaded
        </h1>

        <div className="flex gap-4">
          {listingId && (
            <Link href={`/${listingType}/${listingId}`}>
              <Button
                variant="outline"
                className="px-6 h-10 border-gray-300 hover:bg-gray-50"
              >
                View Listing
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button
              variant="outline"
              className="px-6 h-10 border-gray-300 hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}