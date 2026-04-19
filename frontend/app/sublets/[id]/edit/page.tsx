import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/listings/detail/BackButton";
import { EditListingForm } from "@/components/listings/form/EditListingForm";
import { ListingImageGallery } from "@/components/listings/detail/ListingImageGallery";
import { getCurrentUser, getListingOrNotFound } from "@/lib/actions";

export default async function EditSubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);

  if (listing.listing_type !== "sublet" || currentUser.id !== listing.seller.id) {
    notFound();
  }

  return (
    <div className="container mx-auto w-full max-w-[96rem] px-4 pt-4 pb-12 sm:px-12">
      <Link href={`/sublets/${listing.id}`}>
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">Edit Sublet</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ListingImageGallery images={listing.images} />
        <EditListingForm listing={listing} />
      </div>
    </div>
  );
}
