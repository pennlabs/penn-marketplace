"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ListingImage } from "@/lib/types";
import { mediaUrl } from "@/lib/utils";
import { deleteListingImage, uploadListingImages } from "@/lib/actions";
import { MAX_LISTING_IMAGES } from "@/lib/constants";

export type ImageFile = {
  file: File;
  id: string;
  preview: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  error?: string;
};

type UseImageUploadOptions = {
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  onError?: (message: string) => void;
  initialImages?: ListingImage[];
};

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// local image id -> the image as saved on the server
type SavedImages = Record<string, ListingImage>;

// deletes the given saved images, dropping each one that succeeded from `next`.
// returns an error message if any failed.
async function deleteSaved(ids: string[], next: SavedImages): Promise<string | null> {
  const results = await Promise.allSettled(ids.map((id) => deleteListingImage(next[id].id)));
  ids.forEach((id, i) => {
    if (results[i].status === "fulfilled") delete next[id];
  });
  const failed = results.filter((r) => r.status === "rejected").length;
  return failed > 0 ? `${failed} image(s) could not be removed. Save again to retry.` : null;
}

// syncs the image list to a listing: uploads new files after the existing ones (new files are
// always appended, so kept images never need reordering), then deletes removed images. returns
// the updated saved map and error messages; saving again retries only what failed.
async function persistImages(
  listingId: number,
  images: ImageFile[],
  saved: SavedImages
): Promise<{ saved: SavedImages; errors: string[] }> {
  const next = { ...saved };
  const currentIds = new Set(images.map((img) => img.id));
  const removed = Object.keys(next).filter((id) => !currentIds.has(id));
  const toUpload = images.filter((img) => !(img.id in next));

  // upload before deleting so a failed upload never costs the user a photo they still have.
  // only when uploading first would pass the per-listing limit must some deletes go first.
  const overLimit = Object.keys(next).length + toUpload.length - MAX_LISTING_IMAGES;
  const deleteFirst = removed.slice(0, Math.max(0, overLimit));
  const deleteAfter = removed.slice(deleteFirst.length);

  const deleteFirstError = await deleteSaved(deleteFirst, next);
  if (deleteFirstError) {
    // uploading now would exceed the image limit
    return { saved: next, errors: [deleteFirstError] };
  }

  const start = Math.max(-1, ...Object.values(next).map((img) => img.order)) + 1;
  const uploads = await Promise.allSettled(
    toUpload.map(async (img, i) => {
      const formData = new FormData();
      formData.append("images", img.file);
      // parallel uploads finish in any order, so tell the backend where this one goes
      formData.append("order", String(start + i));
      return (await uploadListingImages(listingId, formData))[0];
    })
  );
  const errors: string[] = [];
  toUpload.forEach((img, i) => {
    const result = uploads[i];
    if (result.status === "fulfilled") next[img.id] = result.value;
    else errors.push(`The file "${img.file.name}" could not be uploaded.`);
  });
  // keep the removed photos until every replacement is up; the retry deletes them
  if (errors.length > 0) return { saved: next, errors };

  const deleteAfterError = await deleteSaved(deleteAfter, next);
  if (deleteAfterError) errors.push(deleteAfterError);
  return { saved: next, errors };
}

export function useImageUpload({
  maxFiles = MAX_LISTING_IMAGES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  onError,
  initialImages = [],
}: UseImageUploadOptions = {}) {
  const [images, setImages] = useState<ImageFile[]>(() =>
    initialImages.map((img) => ({
      file: new File([], `existing-image-${img.id}.jpg`, { type: "image/jpeg" }),
      // keep the backend id so existing images can be deleted/reordered later
      id: String(img.id),
      preview: mediaUrl(img.image_url),
      status: "uploaded",
    }))
  );
  const [saved, setSaved] = useState<SavedImages>(() =>
    Object.fromEntries(initialImages.map((img) => [String(img.id), img]))
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  const generateId = () => Math.random().toString(36).slice(2, 11);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type "${file.type}" is not supported. Please use PNG, JPG, or WebP.`;
      }
      if (file.size > maxSizeBytes) {
        const sizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
        return `File "${file.name}" is too large. Maximum size is ${sizeMB}MB.`;
      }
      return null;
    },
    [acceptedTypes, maxSizeBytes]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: ImageFile[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
          continue;
        }

        validFiles.push({
          file,
          id: generateId(),
          preview: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (errors.length > 0) {
        onError?.(errors[0]);
      }

      setImages((prev) => {
        const combined = [...prev, ...validFiles];
        if (combined.length > maxFiles) {
          onError?.(`Maximum ${maxFiles} images allowed. Some images were not added.`);
          return combined.slice(0, maxFiles);
        }
        return combined;
      });
    },
    [validateFile, maxFiles, onError]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => {
        if (img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
      return [];
    });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset input to allow selecting the same file again
      e.target.value = "";
    },
    [addFiles]
  );

  // returns error messages; an empty list means every change was saved
  const saveToListing = async (listingId: number): Promise<string[]> => {
    const result = await persistImages(listingId, images, saved);
    setSaved(result.saved);
    return result.errors;
  };

  // after a failed create is rolled back, nothing is on the server anymore
  const markAllUnsaved = useCallback(() => setSaved({}), []);

  // new files not yet uploaded, plus saved images the user removed
  const currentIds = new Set(images.map((img) => img.id));
  const unsavedImageCount =
    images.filter((img) => !(img.id in saved)).length +
    Object.keys(saved).filter((id) => !currentIds.has(id)).length;

  return {
    images,
    unsavedImageCount,
    isDragging,
    canAddMore: images.length < maxFiles,
    remainingSlots: maxFiles - images.length,
    addFiles,
    removeImage,
    reorderImages,
    clearImages,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    saveToListing,
    markAllUnsaved,
  };
}
