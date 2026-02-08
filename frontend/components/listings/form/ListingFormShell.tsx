"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDropzone } from "@/components/common/ImageDropzone";
import type { useImageUpload } from "@/hooks/useImageUpload";

interface ListingFormShellProps {
  /** Fires on form submission */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Whether the form is currently submitting or pending */
  isFormDisabled: boolean;
  /** Whether the mutation is in-flight (controls spinner) */
  isPending: boolean;
  /** Display label for the submit button and photo section (e.g., "Item", "Listing") */
  displayLabel: string;
  /** Max number of images allowed */
  maxFiles?: number;
  /** Everything returned from useImageUpload */
  imageUpload: ReturnType<typeof useImageUpload>;
  /** The form fields (left column) */
  children: React.ReactNode;
}

export function ListingFormShell({
  onSubmit,
  isFormDisabled,
  isPending,
  displayLabel,
  maxFiles = 10,
  imageUpload,
  children,
}: ListingFormShellProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">{children}</div>

        <div className="space-y-6">
          <ImageDropzone
            images={imageUpload.images}
            isDragging={imageUpload.isDragging}
            canAddMore={imageUpload.canAddMore}
            remainingSlots={imageUpload.remainingSlots}
            maxFiles={maxFiles}
            label={`${displayLabel} Photos`}
            onDragEnter={imageUpload.handleDragEnter}
            onDragLeave={imageUpload.handleDragLeave}
            onDragOver={imageUpload.handleDragOver}
            onDrop={imageUpload.handleDrop}
            onFileSelect={imageUpload.handleFileSelect}
            onRemove={imageUpload.removeImage}
          />
          <div className="pt-4">
            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={isFormDisabled}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                `Create ${displayLabel}`
              )}
            </Button>
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {isPending && "Creating your listing, please wait..."}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
