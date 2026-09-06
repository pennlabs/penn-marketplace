import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/listings/detail/BackButton";
import { ItemForm } from "@/components/listings/form/ItemForm";
import { getCurrentUser, getListingOrNotFound } from "@/lib/actions";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);

  if (listing.listing_type !== "item" || currentUser.id !== listing.seller.id) {
    notFound();
  }

  return (
    <div className="container mx-auto w-full max-w-[96rem] px-12 pt-4 pb-12">
      <Link href={`/items/${listing.id}`}>
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">Edit Item</h1>

      <ItemForm initialListing={listing} />
    </div>
  );
}
