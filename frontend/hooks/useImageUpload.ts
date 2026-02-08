"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
};

const DEFAULT_MAX_FILES = 10;
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/heic", "image/webp"];

export function useImageUpload({
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  onError,
}: UseImageUploadOptions = {}) {
  const [images, setImages] = useState<ImageFile[]>([]);
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
        return `File type "${file.type}" is not supported. Please use PNG, JPG, or HEIC.`;
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

  const getFiles = useCallback(() => {
    return images.map((img) => img.file);
  }, [images]);

  return {
    images,
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
    getFiles,
  };
}
