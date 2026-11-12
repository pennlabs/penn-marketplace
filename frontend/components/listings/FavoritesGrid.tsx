"use client";

import { Heart } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ListingsGridView } from "@/components/listings/ListingsGridView";
import { useInfiniteListings } from "@/hooks/useInfiniteListings";
import { getUsersFavorites } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { User } from "@/lib/types";

type Props = {
  currentUser: User;
};

export const FavoritesGrid = ({ currentUser }: Props) => {
  const query = useInfiniteListings({
    queryKey: queryKeys.favorites(),
    queryFn: (pageParam) => getUsersFavorites({ pageParam }),
  });

  return (
    <ListingsGridView
      query={query}
      currentUser={currentUser}
      emptyState={
        <EmptyState
          icon={Heart}
          message="No favorites yet. Tap the heart on a listing to save it here."
        />
      }
    />
  );
};
