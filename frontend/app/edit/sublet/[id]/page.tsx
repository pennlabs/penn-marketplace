import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/listings/detail/BackButton";
import { SubletForm } from "@/components/listings/form/SubletForm";
import { getCurrentUser, getListingOrNotFound } from "@/lib/actions";

export default async function EditSubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, currentUser] = await Promise.all([getListingOrNotFound(id), getCurrentUser()]);

  if (listing.listing_type !== "sublet" || currentUser.id !== listing.seller.id) {
    notFound();
  }

  return (
    <>
      <Link href={`/sublets/${listing.id}`}>
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">Edit Sublet</h1>

      <SubletForm initialListing={listing} />
    </>
  );
}
