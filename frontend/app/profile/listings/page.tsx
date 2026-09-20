import { getMyListings } from "@/lib/actions";
import { MyListingsContent } from "@/components/profile/MyListingsContent";

export default async function MyListingsPage() {
  const myListings = await getMyListings();

  return (
    <div className="container mx-auto w-full max-w-[96rem] space-y-6 px-4 pt-6 sm:px-12">
      <h1 className="text-2xl font-bold">My Listings</h1>
      <MyListingsContent listings={myListings.results} />
    </div>
  );
}
