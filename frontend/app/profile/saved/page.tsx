import { getUsersFavorites } from "@/lib/actions";
import { MyListingsContent } from "@/components/profile/MyListingsContent";

export default async function SavedListingsPage() {
  const savedListings = await getUsersFavorites();

  return (
    <div className="container mx-auto w-full max-w-[96rem] space-y-6 px-4 pt-6 sm:px-12">
      <h1 className="text-2xl font-bold">Saved Listings</h1>
      <MyListingsContent listings={savedListings.results} />
    </div>
  );
}
