"use client";

import Link from "next/link";
import { ClipboardList, Clock } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ListingsGridView } from "@/components/listings/ListingsGridView";
import { useInfiniteListings } from "@/hooks/useInfiniteListings";
import { getMyListings } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { User } from "@/lib/types";

type Props = {
  expired: boolean;
  currentUser: User;
};

// one tab of /my-listings; each tab is its own paginated query
export const MyListingsGrid = ({ expired, currentUser }: Props) => {
  const query = useInfiniteListings({
    queryKey: queryKeys.myListings(expired),
    queryFn: (pageParam) => getMyListings({ expired, pageParam }),
  });

  const emptyState = expired ? (
    <EmptyState icon={Clock} message="No expired listings." />
  ) : (
    <EmptyState
      icon={ClipboardList}
      message="You don't have any active listings."
      action={
        <Link
          href="/create/item"
          className="bg-brand hover:bg-brand-hover rounded-md px-4 py-2 text-sm text-white"
        >
          Create a listing
        </Link>
      }
    />
  );

  return <ListingsGridView query={query} currentUser={currentUser} emptyState={emptyState} />;
};
