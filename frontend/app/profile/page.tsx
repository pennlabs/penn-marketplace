import { getCurrentUser, getMyListings, getUsersFavorites } from "@/lib/actions";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ListingSection } from "@/components/profile/ListingSection";

export default async function ProfilePage() {
  const [currentUser, myListings, savedPosts] = await Promise.all([
    getCurrentUser(),
    getMyListings(),
    getUsersFavorites(),
  ]);

  return (
    <div className="container mx-auto w-full max-w-[96rem] space-y-8 px-4 pt-6 sm:px-12">
      <ProfileHeader user={currentUser} />
      <ListingSection
        title="My Listings"
        count={myListings.count}
        listings={myListings.results}
        seeAllHref="/profile/listings"
        icon="listings"
      />
      <ListingSection
        title="Saved Posts"
        count={savedPosts.count}
        listings={savedPosts.results}
        seeAllHref="/profile/saved"
        icon="saved"
      />
    </div>
  );
}
