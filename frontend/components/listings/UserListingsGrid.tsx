"use client";

import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ListingsGridView } from "@/components/listings/ListingsGridView";
import { useInfiniteListings } from "@/hooks/useInfiniteListings";
import { getUserListings } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { User } from "@/lib/types";

type Props = {
  userId: string;
  currentUser: User;
};

// a user's active listings on their profile
export const UserListingsGrid = ({ userId, currentUser }: Props) => {
  const query = useInfiniteListings({
    queryKey: queryKeys.userListings(userId),
    queryFn: (pageParam) => getUserListings({ userId, pageParam }),
  });

  return (
    <ListingsGridView
      query={query}
      currentUser={currentUser}
      emptyState={<EmptyState icon={ClipboardList} message="No active listings." />}
    />
  );
};
