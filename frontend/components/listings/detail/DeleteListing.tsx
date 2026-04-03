"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { deleteListing } from "@/lib/actions";
import type { Item, Sublet } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  listing: Item | Sublet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteListing = ({ listing, open, onOpenChange }: Props) => {
  const router = useRouter();
  const typeLabel = listing.listing_type === "sublet" ? "Sublet" : "Item";

  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(listing.id),
    onSuccess: () => {
      router.push(listing.listing_type === "sublet" ? "/sublets" : "/items");
    },
    onError: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {typeLabel}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {typeLabel.toLowerCase()}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer bg-red-500 text-white hover:bg-red-600"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : `Delete ${typeLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
