"use client";

import { useRef, useId } from "react";
import { ImagePlus, AlertCircle } from "lucide-react";
import { ImagePreview } from "@/components/common/ImagePreview";
import type { ImageFile } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  images: ImageFile[];
  isDragging: boolean;
  canAddMore: boolean;
  remainingSlots: number;
  maxFiles: number;
  label?: string;
  error?: string;
  acceptedFormats?: string;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: string) => void;
}

export const ImageDropzone = ({
  images,
  isDragging,
  canAddMore,
  remainingSlots,
  maxFiles,
  label = "Images",
  error,
  acceptedFormats = "image/png,image/jpeg,image/heic,image/webp",
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  onRemove,
}: ImageDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();
  const errorId = useId();
  const instructionsId = useId();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label id={`${dropzoneId}-label`} className="block text-sm font-medium">
          {label}
        </label>
        <span className="text-muted-foreground text-xs">
          {images.length}/{maxFiles} images
        </span>
      </div>

      <div
        role="button"
        tabIndex={canAddMore ? 0 : -1}
        aria-labelledby={`${dropzoneId}-label`}
        aria-describedby={`${instructionsId} ${error ? errorId : ""}`}
        aria-disabled={!canAddMore}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onKeyDown={handleKeyDown}
        onClick={() => canAddMore && inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          isDragging && "scale-[1.02] border-blue-500 bg-blue-50",
          !isDragging && !error && "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30",
          error && "border-red-300 bg-red-50/30",
          !canAddMore && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedFormats}
          className="sr-only"
          onChange={onFileSelect}
          disabled={!canAddMore}
          aria-hidden="true"
          tabIndex={-1}
        />

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className={cn(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-lg transition-colors",
                isDragging ? "bg-blue-100" : "bg-gray-100"
              )}
            >
              <ImagePlus
                className={cn(
                  "h-7 w-7 transition-colors",
                  isDragging ? "text-blue-500" : "text-gray-400"
                )}
                aria-hidden="true"
              />
            </div>
            <p className="mb-1 font-medium text-gray-600">
              {isDragging ? "Drop images here" : "Drop images here or click to browse"}
            </p>
            <p id={instructionsId} className="text-xs text-gray-400">
              Up to {maxFiles} images. PNG, JPG, HEIC supported.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
              }}
              role="list"
              aria-label="Uploaded images"
            >
              {images.map((image, index) => (
                <ImagePreview
                  key={image.id}
                  image={image}
                  index={index}
                  onRemove={() => onRemove(image.id)}
                />
              ))}
            </div>

            {canAddMore && (
              <p id={instructionsId} className="text-xs text-gray-500">
                {remainingSlots === 1
                  ? "You can add 1 more image"
                  : `You can add ${remainingSlots} more images`}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};
