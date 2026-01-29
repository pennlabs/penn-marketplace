import Link from "next/link";
import { BackButton } from "@/components/listings/detail/BackButton";
import { ListingForm } from "@/components/listings/ListingForm";

export default function CreateSubletPage() {
  return (
    <div className="w-full mx-auto container max-w-[96rem] px-12 pt-6 pb-12">
      <Link href="/sublets">
        <BackButton />
      </Link>

      <h1 className="text-3xl font-bold mb-8">New Sublet Listing</h1>

      <ListingForm listingType="sublet" />
    </div>
  );
}
