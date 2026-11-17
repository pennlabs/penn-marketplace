"use client";

import { ListingsGridView } from "@/components/listings/ListingsGridView";
import { NoListingsFound } from "@/components/listings/NoListingsFound";
import { useListings } from "@/hooks/useListings";
import { ListingTypes, User } from "@/lib/types";

type Props = {
  type: ListingTypes;
  currentUser: User;
};

// the filtered /items and /sublets feeds
export const ListingsGrid = ({ type, currentUser }: Props) => {
  const query = useListings({ type });

  return (
    <ListingsGridView
      query={query}
      currentUser={currentUser}
      emptyState={<NoListingsFound type={type} />}
    />
  );
};
