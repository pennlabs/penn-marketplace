import Image from "next/image";
import { X, AlertCircle } from "lucide-react";
import type { ImageFile } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  image: ImageFile;
  index: number;
  onRemove: () => void;
}

export const ImagePreview = ({ image, index, onRemove }: ImagePreviewProps) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  const handleRemoveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onRemove();
    }
  };

  return (
    <div
      role="listitem"
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
    >
      <Image
        src={image.preview}
        alt={`Upload ${index + 1}: ${image.file.name}`}
        fill
        className="object-cover"
        unoptimized
      />

      {/* Overlay with filename on hover */}
      <div className="absolute inset-0 flex items-end bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="w-full truncate text-[10px] text-white">{image.file.name}</span>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemoveClick}
        onKeyDown={handleRemoveKeyDown}
        className={cn(
          "absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full",
          "bg-red-500 text-white hover:bg-red-600",
          "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
          "transition-opacity focus:opacity-100",
          "focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        )}
        aria-label={`Remove image ${index + 1}: ${image.file.name}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Status indicator */}
      {image.status === "uploading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {image.status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
          <AlertCircle className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
