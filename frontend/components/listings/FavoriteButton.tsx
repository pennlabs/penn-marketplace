"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { addToUsersFavorites, deleteFromUsersFavorites } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Props {
  listingId: number;
  isFavorited?: boolean;
  className?: string;
}

export const FavoriteButton = ({ listingId, isFavorited: initial = false, className }: Props) => {
  const queryClient = useQueryClient();
  const [toggled, setToggled] = useState<boolean>();
  const isFavorited = toggled ?? initial;

  const { mutate } = useMutation({
    meta: { suppressErrorToast: true },
    mutationFn: (favorite: boolean) =>
      favorite ? addToUsersFavorites(listingId) : deleteFromUsersFavorites(listingId),
    onMutate: (favorite) => setToggled(favorite),
    onError: (_error, favorite) => setToggled(!favorite),
    onSettled: () => queryClient.invalidateQueries({ refetchType: "none" }),
  });

  return (
    <button
      type="button"
      onClick={() => mutate(!isFavorited)}
      aria-pressed={isFavorited}
      aria-label="Favorite"
      className={cn(
        "flex cursor-pointer items-center justify-center transition active:scale-90 motion-reduce:transition-none",
        className
      )}
    >
      <span className="relative block size-5">
        <Heart className="size-5" />
        <Heart
          className={cn(
            "absolute inset-0 size-5 fill-red-500 text-red-500 transition-transform motion-reduce:transition-none",
            isFavorited ? "scale-100 duration-500 ease-out" : "scale-0 duration-300 ease-in"
          )}
        />
      </span>
    </button>
  );
};
