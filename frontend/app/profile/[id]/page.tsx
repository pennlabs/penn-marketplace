import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getCurrentUser, getPublicUserOrNotFound, getUserListings } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { UserListingsGrid } from "@/components/listings/UserListingsGrid";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  // an unknown id throws notFound() from getPublicUserOrNotFound
  const [user, , currentUser] = await Promise.all([
    getPublicUserOrNotFound(id),
    queryClient.fetchInfiniteQuery({
      queryKey: queryKeys.userListings(id),
      queryFn: () => getUserListings({ userId: id, pageParam: 1 }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.results.length > 0 ? allPages.length + 1 : undefined,
      pages: 1,
    }),
    getCurrentUser(),
  ]);

  return (
    <>
      <ProfileHeader user={user} />
      <h2 className="text-lg font-semibold">Active listings</h2>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UserListingsGrid userId={id} currentUser={currentUser} />
      </HydrationBoundary>
    </>
  );
}
