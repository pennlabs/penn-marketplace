"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { useImageUpload } from "@/hooks/useImageUpload";
import {
  type CreateListingPayload,
  createListing,
  deleteListing,
  updateListing,
} from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import type { UpdateListingPayload } from "@/lib/types";

type UseSaveListingOptions = {
  /** set in edit mode: the listing being edited */
  listingId?: number;
  basePath: "items" | "sublets";
  displayLabel: string;
  imageUpload: ReturnType<typeof useImageUpload>;
  /** clears the form after a successful create */
  onCreated: () => void;
};

// creates or updates a listing, then saves its images. shared by the item and sublet forms.
export function useSaveListing({
  listingId,
  basePath,
  displayLabel,
  imageUpload,
  onCreated,
}: UseSaveListingOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = listingId !== undefined;

  return useMutation({
    mutationFn: (payload: CreateListingPayload | UpdateListingPayload) =>
      isEditMode
        ? updateListing(listingId, payload as UpdateListingPayload)
        : createListing(payload as CreateListingPayload),
    onSuccess: async (data) => {
      const errors = await imageUpload.saveToListing(data.id);
      errors.forEach((message) => toast.error(message));
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: queryKeys.listing(data.id) });
      }

      if (errors.length > 0) {
        if (isEditMode) return; // stay on the form; saving again retries only what failed
        try {
          await deleteListing(data.id); // cascades to any images already uploaded
          toast.error(`${displayLabel} was not created. Replace the file(s) and try again.`);
        } catch {
          toast.error(`${displayLabel} was created with missing images. Please delete it.`);
        }
        imageUpload.markAllUnsaved(); // the next attempt creates a new listing
        return; // keep the form filled in so the user can fix the files
      }

      toast.success(`${displayLabel} ${isEditMode ? "updated" : "created"} successfully!`);
      queryClient.invalidateQueries({ queryKey: [basePath] });
      if (!isEditMode) {
        onCreated();
        imageUpload.clearImages();
      }
      router.replace(`/${basePath}/${data.id}`);
    },
  });
}
